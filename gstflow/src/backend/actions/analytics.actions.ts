"use server";

import { prisma } from "@/backend/db/prisma";
import { getOrganizationId } from "@/backend/db/helpers";

// ─── DASHBOARD STATS ────────────────────────────────────────────

export async function getDashboardStats() {
  const orgId = await getOrganizationId();

  const [invoices, customers, products, payments] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId: orgId },
      select: { totalAmount: true, status: true },
    }),
    prisma.customer.count({ where: { organizationId: orgId } }),
    prisma.product.count({ where: { organizationId: orgId } }),
    prisma.payment.aggregate({
      where: { organizationId: orgId, status: "COMPLETED" },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = payments._sum.amount || 0;
  const outstanding = totalRevenue - totalPaid;
  const invoiceCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE" || i.status === "SENT").length;

  return {
    totalRevenue,
    totalPaid,
    outstanding,
    invoiceCount,
    customerCount: customers,
    productCount: products,
    paidCount,
    overdueCount,
  };
}

// ─── MONTHLY SALES ──────────────────────────────────────────────

export async function getMonthlySales(year?: number) {
  const orgId = await getOrganizationId();
  const targetYear = year || new Date().getFullYear();

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      invoiceDate: { gte: startDate, lte: endDate },
      status: { not: "CANCELLED" },
    },
    select: {
      invoiceDate: true,
      totalAmount: true,
      cgstTotal: true,
      sgstTotal: true,
      igstTotal: true,
      subtotal: true,
    },
  });

  // Aggregate by month
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(targetYear, i, 1).toLocaleString("en-IN", { month: "short" }),
    monthIndex: i,
    revenue: 0,
    taxCollected: 0,
    invoiceCount: 0,
  }));

  for (const inv of invoices) {
    const month = new Date(inv.invoiceDate).getMonth();
    monthlyData[month].revenue += inv.totalAmount;
    monthlyData[month].taxCollected += inv.cgstTotal + inv.sgstTotal + inv.igstTotal;
    monthlyData[month].invoiceCount += 1;
  }

  return monthlyData;
}

// ─── GST SUMMARY ────────────────────────────────────────────────

export async function getGstSummary() {
  const orgId = await getOrganizationId();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      invoiceDate: { gte: startOfMonth, lte: endOfMonth },
      status: { not: "CANCELLED" },
    },
    select: {
      cgstTotal: true,
      sgstTotal: true,
      igstTotal: true,
      subtotal: true,
      totalAmount: true,
    },
  });

  return {
    cgstTotal: invoices.reduce((sum, inv) => sum + inv.cgstTotal, 0),
    sgstTotal: invoices.reduce((sum, inv) => sum + inv.sgstTotal, 0),
    igstTotal: invoices.reduce((sum, inv) => sum + inv.igstTotal, 0),
    totalTax: invoices.reduce(
      (sum, inv) => sum + inv.cgstTotal + inv.sgstTotal + inv.igstTotal,
      0
    ),
    totalTaxable: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    invoiceCount: invoices.length,
    period: `${startOfMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}`,
  };
}

// ─── TOP CUSTOMERS ──────────────────────────────────────────────

export async function getTopCustomers(limit = 5) {
  const orgId = await getOrganizationId();

  const customers = await prisma.customer.findMany({
    where: { organizationId: orgId },
    include: {
      invoices: {
        where: { status: { not: "CANCELLED" } },
        select: { totalAmount: true },
      },
    },
  });

  return customers
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalRevenue: c.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      invoiceCount: c.invoices.length,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

// ─── PRODUCT PERFORMANCE ────────────────────────────────────────

export async function getProductPerformance(limit = 5) {
  const orgId = await getOrganizationId();

  const products = await prisma.product.findMany({
    where: { organizationId: orgId },
    include: {
      invoiceItems: {
        select: { quantity: true, totalAmount: true },
      },
    },
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      totalSold: p.invoiceItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: p.invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

// ─── RECENT INVOICES ────────────────────────────────────────────

export async function getRecentInvoices(limit = 5) {
  const orgId = await getOrganizationId();

  return prisma.invoice.findMany({
    where: { organizationId: orgId },
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// ─── PENDING PAYMENTS ───────────────────────────────────────────

export async function getPendingPayments() {
  const orgId = await getOrganizationId();

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: { in: ["SENT", "PARTIAL", "OVERDUE"] },
    },
    include: {
      customer: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return invoices.map((inv) => {
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      ...inv,
      paidAmount: paid,
      remainingAmount: inv.totalAmount - paid,
    };
  });
}
