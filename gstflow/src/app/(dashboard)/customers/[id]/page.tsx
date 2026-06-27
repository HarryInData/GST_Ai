import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/backend/actions/customer.actions";
import { formatCurrency } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";
import { DeleteCustomerButton } from "./delete-button";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/dashboard/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
            {customer.gstin && (
              <code className="text-xs bg-muted/50 px-2 py-0.5 rounded font-mono text-muted-foreground">
                GSTIN: {customer.gstin}
              </code>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <DeleteCustomerButton id={customer.id} name={customer.name} hasInvoices={customer.invoices.length > 0} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/customers/${customer.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.invoices.length}</p>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">
                  {formatCurrency(customer.totalBilled)}
                </p>
                <p className="text-xs text-muted-foreground">Total Billed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <IndianRupee className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold font-mono ${customer.outstanding > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {formatCurrency(customer.outstanding)}
                </p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </div>
            )}
            {(customer.billingAddress || customer.city) && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  {customer.billingAddress && <p>{customer.billingAddress}</p>}
                  <p>
                    {[customer.city, customer.state, customer.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Invoice History</CardTitle>
            <CardDescription className="text-xs">
              All invoices for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices yet for this customer.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left font-medium text-muted-foreground p-3">Invoice #</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Date</th>
                      <th className="text-right font-medium text-muted-foreground p-3">Amount</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.invoices.map((inv) => {
                      const statusConfig = INVOICE_STATUSES.find(
                        (s) => s.value === inv.status
                      );
                      return (
                        <tr
                          key={inv.id}
                          className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                        >
                          <td className="p-3">
                            <Link
                              href={`/dashboard/invoices/${inv.id}`}
                              className="font-medium font-mono hover:text-primary transition-colors"
                            >
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {formatDate(inv.invoiceDate)}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {formatCurrency(inv.totalAmount)}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusConfig?.color || ""}`}
                            >
                              {statusConfig?.label || inv.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
