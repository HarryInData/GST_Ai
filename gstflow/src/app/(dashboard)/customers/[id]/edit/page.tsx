import { Button } from "@/frontend/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/backend/actions/customer.actions";
import { CustomerForm } from "@/frontend/components/forms/customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-9 w-9">
          <Link href={`/dashboard/customers/${customer.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Customer</h2>
          <p className="text-muted-foreground text-sm">
            Update {customer.name}&apos;s details
          </p>
        </div>
      </div>

      <CustomerForm mode="edit" initialData={customer} />
    </div>
  );
}
