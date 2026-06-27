"use server";

import { prisma } from "@/backend/db/prisma";
import { getOrganizationId } from "@/backend/db/helpers";
import { paymentSchema, type PaymentInput } from "@/backend/validations/payment";
import { revalidatePath } from "next/cache";

// ─── RECORD PAYMENT ─────────────────────────────────────────────

export async function recordPayment(values: PaymentInput) {
  const orgId = await getOrganizationId();
  const validated = paymentSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    // Verify invoice exists and belongs to org
    const invoice = await prisma.invoice.findFirst({
      where: { id: validated.data.invoiceId, organizationId: orgId },
      include: { payments: true },
    });
    if (!invoice) return { error: "Invoice not found" };

    // Calculate total paid so far
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalAmount - totalPaid;

    if (validated.data.amount > remaining + 0.01) {
      return { error: `Payment amount exceeds remaining balance of ₹${remaining.toFixed(2)}` };
    }

    // Create payment
    await prisma.payment.create({
      data: {
        organizationId: orgId,
        invoiceId: validated.data.invoiceId,
        amount: validated.data.amount,
        date: new Date(validated.data.date),
        method: validated.data.method,
        reference: validated.data.reference || null,
        notes: validated.data.notes || null,
        status: "COMPLETED",
      },
    });

    // Update invoice status based on total payments
    const newTotalPaid = totalPaid + validated.data.amount;
    let newStatus = invoice.status;
    if (newTotalPaid >= invoice.totalAmount - 0.01) {
      newStatus = "PAID";
    } else if (newTotalPaid > 0) {
      newStatus = "PARTIAL";
    }

    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      });
    }

    revalidatePath("/dashboard/invoices");
    revalidatePath(`/dashboard/invoices/${invoice.id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Record payment error:", error);
    return { error: "Failed to record payment." };
  }
}

// ─── GET PAYMENTS ───────────────────────────────────────────────

export async function getPayments() {
  const orgId = await getOrganizationId();

  return prisma.payment.findMany({
    where: { organizationId: orgId },
    include: {
      invoice: {
        select: { invoiceNumber: true, customer: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
}
