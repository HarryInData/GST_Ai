import { Button } from "@/frontend/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceForm } from "@/frontend/components/forms/invoice-form";
import { getCustomers } from "@/backend/actions/customer.actions";
import { getProducts } from "@/backend/actions/product.actions";
import { auth } from "@/backend/auth/auth";
import { prisma } from "@/backend/db/prisma";
import { redirect } from "next/navigation";

export default async function NewInvoicePage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/onboarding");

  const [customers, products, org] = await Promise.all([
    getCustomers(),
    getProducts(),
    prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { stateCode: true },
    }),
  ]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-9 w-9">
          <Link href="/dashboard/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Invoice</h2>
          <p className="text-muted-foreground text-sm">
            Create a new GST-compliant invoice
          </p>
        </div>
      </div>

      <InvoiceForm
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          gstin: c.gstin,
          state: c.state,
        }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          hsnCode: p.hsnCode,
          price: p.price,
          gstRate: p.gstRate,
          unit: p.unit,
          stock: p.stock,
        }))}
        orgStateCode={org?.stateCode}
      />
    </div>
  );
}
