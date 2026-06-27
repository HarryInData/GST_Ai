"use server";

import { prisma } from "@/backend/db/prisma";
import { getOrganizationId } from "@/backend/db/helpers";
import { invoiceSchema, type InvoiceInput } from "@/backend/validations/invoice";
import { calculateLineItemTax, calculateInvoiceTotals, isInterStateSupply } from "@/backend/services/gst";
import { generateInvoiceNumber } from "@/backend/db/helpers";
import { revalidatePath } from "next/cache";

// ─── CREATE INVOICE ─────────────────────────────────────────────

export async function createInvoice(values: InvoiceInput) {
  const orgId = await getOrganizationId();
  const validated = invoiceSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    // Get org details for invoice number + state code
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { invoicePrefix: true, nextInvoiceNo: true, stateCode: true },
    });
    if (!org) return { error: "Organization not found" };

    // Get customer state code for inter-state detection
    const customer = await prisma.customer.findFirst({
      where: { id: validated.data.customerId, organizationId: orgId },
      select: { state: true },
    });
    if (!customer) return { error: "Customer not found" };

    // Determine supply type from place of supply or customer state
    const customerStateCode = validated.data.placeOfSupply || "";
    const isInterState = isInterStateSupply(org.stateCode, customerStateCode);

    // Calculate tax for each line item
    const itemTaxes = validated.data.items.map((item) =>
      calculateLineItemTax(item.quantity, item.unitPrice, item.gstRate, isInterState)
    );
    const totals = calculateInvoiceTotals(itemTaxes);

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(org.invoicePrefix, org.nextInvoiceNo);

    // Create invoice + items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          organizationId: orgId,
          customerId: validated.data.customerId,
          invoiceDate: new Date(validated.data.invoiceDate),
          dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
          placeOfSupply: validated.data.placeOfSupply || null,
          reverseCharge: validated.data.reverseCharge,
          notes: validated.data.notes || null,
          status: validated.data.status,
          subtotal: totals.subtotal,
          cgstTotal: totals.cgstTotal,
          sgstTotal: totals.sgstTotal,
          igstTotal: totals.igstTotal,
          totalAmount: totals.grandTotal,
          items: {
            create: validated.data.items.map((item, index) => ({
              productId: item.productId || null,
              description: item.description,
              hsnCode: item.hsnCode || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              gstRate: item.gstRate,
              taxableAmount: itemTaxes[index].taxableAmount,
              cgstAmount: itemTaxes[index].cgstAmount,
              sgstAmount: itemTaxes[index].sgstAmount,
              igstAmount: itemTaxes[index].igstAmount,
              totalAmount: itemTaxes[index].totalAmount,
            })),
          },
        },
      });

      // Increment invoice number
      await tx.organization.update({
        where: { id: orgId },
        data: { nextInvoiceNo: { increment: 1 } },
      });

      // Update product stock (reduce by quantity sold) - only for final invoices
      if (validated.data.status !== "DRAFT") {
        for (const item of validated.data.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: Math.floor(item.quantity) } },
            });
          }
        }
      }

      return inv;
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard");
    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Create invoice error:", error);
    return { error: "Failed to create invoice. Please try again." };
  }
}

// ─── UPDATE INVOICE STATUS ──────────────────────────────────────

export async function updateInvoiceStatus(id: string, status: string) {
  const orgId = await getOrganizationId();

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!invoice) return { error: "Invoice not found" };

    await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update invoice status error:", error);
    return { error: "Failed to update invoice status." };
  }
}

// ─── GET INVOICES (LIST) ────────────────────────────────────────

export async function getInvoices(filters?: { status?: string; search?: string }) {
  const orgId = await getOrganizationId();

  const where: Record<string, unknown> = { organizationId: orgId };

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.search && filters.search.trim()) {
    where.OR = [
      { invoiceNumber: { contains: filters.search } },
      { customer: { name: { contains: filters.search } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer: { select: { name: true, gstin: true } },
      _count: { select: { items: true, payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices.map(inv => ({
    ...inv,
    subtotal: Number(inv.subtotal),
    cgstTotal: Number(inv.cgstTotal),
    sgstTotal: Number(inv.sgstTotal),
    igstTotal: Number(inv.igstTotal),
    totalAmount: Number(inv.totalAmount),
  }));
}

// ─── GET SINGLE INVOICE (FULL) ──────────────────────────────────

export async function getInvoice(id: string) {
  const orgId = await getOrganizationId();

  const inv = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId },
    include: {
      customer: true,
      organization: true,
      items: {
        include: { product: { select: { name: true, unit: true } } },
      },
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!inv) return null;

  return {
    ...inv,
    subtotal: Number(inv.subtotal),
    cgstTotal: Number(inv.cgstTotal),
    sgstTotal: Number(inv.sgstTotal),
    igstTotal: Number(inv.igstTotal),
    totalAmount: Number(inv.totalAmount),
    items: inv.items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxableAmount: Number(item.taxableAmount),
      cgstAmount: Number(item.cgstAmount),
      sgstAmount: Number(item.sgstAmount),
      igstAmount: Number(item.igstAmount),
      totalAmount: Number(item.totalAmount),
    })),
    payments: inv.payments.map(p => ({
      ...p,
      amount: Number(p.amount)
    })),
  };
}

// ─── DELETE INVOICE ─────────────────────────────────────────────

export async function deleteInvoice(id: string) {
  const orgId = await getOrganizationId();

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!invoice) return { error: "Invoice not found" };
    if (invoice.status !== "DRAFT") {
      return { error: "Only draft invoices can be deleted." };
    }

    await prisma.invoice.delete({ where: { id } });

    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (error) {
    console.error("Delete invoice error:", error);
    return { error: "Failed to delete invoice." };
  }
}
