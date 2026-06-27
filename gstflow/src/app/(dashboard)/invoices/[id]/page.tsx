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
  Printer,
  Download,
  Send,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "@/backend/actions/invoice.actions";
import { InvoiceTemplate } from "@/frontend/components/documents/invoice-pdf";
import { formatCurrency } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";
import { InvoiceActions } from "./invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  const statusConfig = INVOICE_STATUSES.find((s) => s.value === invoice.status);
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.totalAmount - totalPaid;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-9 w-9">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight font-mono">
                {invoice.invoiceNumber}
              </h2>
              <Badge
                variant="outline"
                className={`text-xs ${statusConfig?.color || ""}`}
              >
                {statusConfig?.label || invoice.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {invoice.customer.name} · {formatDate(invoice.invoiceDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/invoices/${invoice.id}/print`}>
              <Printer className="h-4 w-4 mr-2" />
              Print / PDF
            </Link>
          </Button>
          <InvoiceActions invoice={invoice} remaining={remaining} />
        </div>
      </div>

      {/* Payment Summary Bar */}
      {invoice.status !== "DRAFT" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">
                  {formatCurrency(invoice.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Total Amount</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold font-mono text-emerald-400">
                  {formatCurrency(totalPaid)}
                </p>
                <p className="text-xs text-muted-foreground">Total Paid</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <IndianRupee className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className={`text-lg font-bold font-mono ${remaining > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {formatCurrency(remaining)}
                </p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Template */}
      <InvoiceTemplate invoice={invoice} />

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
            <CardDescription className="text-xs">
              All payments recorded for this invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Reference</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/30">
                    <td className="p-3">{formatDate(payment.date)}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {payment.method}
                      </Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground font-mono">
                      {payment.reference || "—"}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-emerald-400">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
