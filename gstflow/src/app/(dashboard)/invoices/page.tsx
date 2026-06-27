import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { FileText, Plus, Search, ArrowRight } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import Link from "next/link";
import { getInvoices } from "@/backend/actions/invoice.actions";
import { formatCurrency } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const invoices = await getInvoices({
    search: params.search,
    status: params.status,
  });

  const currentStatus = params.status || "ALL";

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground text-sm">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          asChild
          className="gradient-primary text-white hover:opacity-90"
        >
          <Link href="/dashboard/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={params.search}
            placeholder="Search invoices..."
            className="pl-9 h-10 bg-background/50"
          />
          <input type="hidden" name="status" value={currentStatus} />
        </form>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE"].map(
            (status) => {
              const config = INVOICE_STATUSES.find((s) => s.value === status);
              return (
                <Link
                  key={status}
                  href={`/dashboard/invoices?status=${status}${
                    params.search ? `&search=${params.search}` : ""
                  }`}
                >
                  <Badge
                    variant={currentStatus === status ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors px-3 py-1"
                  >
                    {status === "ALL" ? "All" : config?.label || status}
                  </Badge>
                </Link>
              );
            }
          )}
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No invoices yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Create your first GST-compliant invoice and start managing your
              business finances.
            </p>
            <Button
              asChild
              className="gradient-primary text-white hover:opacity-90"
            >
              <Link href="/dashboard/invoices/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4">
                      Invoice #
                    </th>
                    <th className="text-left font-medium text-muted-foreground p-4">
                      Customer
                    </th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-right font-medium text-muted-foreground p-4">
                      Amount
                    </th>
                    <th className="text-center font-medium text-muted-foreground p-4">
                      Status
                    </th>
                    <th className="text-right font-medium text-muted-foreground p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const statusConfig = INVOICE_STATUSES.find(
                      (s) => s.value === invoice.status
                    );
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="font-medium font-mono hover:text-primary transition-colors"
                          >
                            {invoice.invoiceNumber}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{invoice.customer.name}</p>
                          {invoice.customer.gstin && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {invoice.customer.gstin}
                            </p>
                          )}
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="p-4 text-right font-mono font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusConfig?.color || ""}`}
                          >
                            {statusConfig?.label || invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
