"use server";

import { prisma } from "@/backend/db/prisma";
import { getOrganizationId } from "@/backend/db/helpers";
import { productSchema, type ProductInput } from "@/backend/validations/product";
import { revalidatePath } from "next/cache";

// ─── CREATE PRODUCT ─────────────────────────────────────────────

export async function createProduct(values: ProductInput) {
  const orgId = await getOrganizationId();
  const validated = productSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const product = await prisma.product.create({
      data: {
        organizationId: orgId,
        name: validated.data.name,
        description: validated.data.description || null,
        hsnCode: validated.data.hsnCode || null,
        sku: validated.data.sku || null,
        unit: validated.data.unit,
        price: validated.data.price,
        gstRate: validated.data.gstRate,
        stock: validated.data.stock,
        lowStockAlert: validated.data.lowStockAlert,
        isActive: validated.data.isActive,
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product." };
  }
}

// ─── UPDATE PRODUCT ─────────────────────────────────────────────

export async function updateProduct(id: string, values: ProductInput) {
  const orgId = await getOrganizationId();
  const validated = productSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid fields. " + validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const existing = await prisma.product.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: "Product not found" };

    await prisma.product.update({
      where: { id },
      data: {
        name: validated.data.name,
        description: validated.data.description || null,
        hsnCode: validated.data.hsnCode || null,
        sku: validated.data.sku || null,
        unit: validated.data.unit,
        price: validated.data.price,
        gstRate: validated.data.gstRate,
        stock: validated.data.stock,
        lowStockAlert: validated.data.lowStockAlert,
        isActive: validated.data.isActive,
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product." };
  }
}

// ─── DELETE PRODUCT ─────────────────────────────────────────────

export async function deleteProduct(id: string) {
  const orgId = await getOrganizationId();

  try {
    const product = await prisma.product.findFirst({
      where: { id, organizationId: orgId },
      include: { _count: { select: { invoiceItems: true } } },
    });

    if (!product) return { error: "Product not found" };
    if (product._count.invoiceItems > 0) {
      return { error: "Cannot delete product used in invoices. Deactivate it instead." };
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product." };
  }
}

// ─── GET PRODUCTS (LIST) ────────────────────────────────────────

export async function getProducts(search?: string) {
  const orgId = await getOrganizationId();

  const where: Record<string, unknown> = { organizationId: orgId };

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search } },
      { hsnCode: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ─── GET SINGLE PRODUCT ────────────────────────────────────────

export async function getProduct(id: string) {
  const orgId = await getOrganizationId();

  return prisma.product.findFirst({
    where: { id, organizationId: orgId },
  });
}

// ─── GET LOW STOCK PRODUCTS ────────────────────────────────────

export async function getLowStockProducts() {
  const orgId = await getOrganizationId();

  return prisma.product.findMany({
    where: {
      organizationId: orgId,
      isActive: true,
      // SQLite workaround: we can't use column references in where,
      // so we fetch all and filter in JS
    },
    orderBy: { stock: "asc" },
  }).then((products) =>
    products.filter((p) => p.stock <= p.lowStockAlert)
  );
}
