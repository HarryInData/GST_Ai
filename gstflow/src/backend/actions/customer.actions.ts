"use server";

import { prisma } from "@/backend/db/prisma";
import { getOrganizationId } from "@/backend/db/helpers";
import { customerSchema, type CustomerInput } from "@/backend/validations/customer";
import { revalidatePath } from "next/cache";

// ─── CREATE CUSTOMER ────────────────────────────────────────────

export async function createCustomer(values: CustomerInput) {
  const orgId = await getOrganizationId();
  const validated = customerSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        organizationId: orgId,
        name: validated.data.name,
        email: validated.data.email || null,
        phone: validated.data.phone || null,
        gstin: validated.data.gstin || null,
        billingAddress: validated.data.billingAddress || null,
        shippingAddress: validated.data.shippingAddress || null,
        city: validated.data.city || null,
        state: validated.data.state || null,
        pincode: validated.data.pincode || null,
      },
    });

    revalidatePath("/dashboard/customers");
    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("Create customer error:", error);
    return { error: "Failed to create customer. Please try again." };
  }
}

// ─── UPDATE CUSTOMER ────────────────────────────────────────────

export async function updateCustomer(id: string, values: CustomerInput) {
  const orgId = await getOrganizationId();
  const validated = customerSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    // Verify ownership
    const existing = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: "Customer not found" };

    await prisma.customer.update({
      where: { id },
      data: {
        name: validated.data.name,
        email: validated.data.email || null,
        phone: validated.data.phone || null,
        gstin: validated.data.gstin || null,
        billingAddress: validated.data.billingAddress || null,
        shippingAddress: validated.data.shippingAddress || null,
        city: validated.data.city || null,
        state: validated.data.state || null,
        pincode: validated.data.pincode || null,
      },
    });

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update customer error:", error);
    return { error: "Failed to update customer." };
  }
}

// ─── DELETE CUSTOMER ────────────────────────────────────────────

export async function deleteCustomer(id: string) {
  const orgId = await getOrganizationId();

  try {
    // Verify ownership
    const customer = await prisma.customer.findFirst({
      where: { id, organizationId: orgId },
      include: { _count: { select: { invoices: true } } },
    });

    if (!customer) return { error: "Customer not found" };
    if (customer._count.invoices > 0) {
      return { error: "Cannot delete customer with existing invoices." };
    }

    await prisma.customer.delete({ where: { id } });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    console.error("Delete customer error:", error);
    return { error: "Failed to delete customer." };
  }
}

// ─── GET CUSTOMERS (LIST) ───────────────────────────────────────

export async function getCustomers(search?: string) {
  const orgId = await getOrganizationId();

  const where: Record<string, unknown> = { organizationId: orgId };

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { gstin: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { invoices: true } },
      invoices: {
        select: { totalAmount: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate outstanding for each customer
  return customers.map((c) => {
    const totalBilled = c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = c.invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const outstanding = totalBilled - totalPaid;

    return {
      ...c,
      invoiceCount: c._count.invoices,
      totalBilled,
      outstanding,
    };
  });
}

// ─── GET SINGLE CUSTOMER ────────────────────────────────────────

export async function getCustomer(id: string) {
  const orgId = await getOrganizationId();

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId: orgId },
    include: {
      invoices: {
        include: {
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return null;

  const totalBilled = customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = customer.invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return {
    ...customer,
    totalBilled,
    outstanding: totalBilled - totalPaid,
  };
}
