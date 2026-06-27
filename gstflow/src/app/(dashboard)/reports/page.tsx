import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  FileText,
  Users,
  Package,
  Clock,
} from "lucide-react";
import {
  getDashboardStats,
  getMonthlySales,
  getGstSummary,
  getTopCustomers,
  getProductPerformance,
  getPendingPayments,
} from "@/backend/actions/analytics.actions";
import { formatCurrency } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";
import { RevenueChart, GstBreakdownChart } from "@/frontend/components/analytics/charts";
import Link from "next/link";

export default async function ReportsPage() {
  const [stats, monthlySales, gstSummary, topCustomers, productPerformance, pendingPayments] =
    await Promise.all([
      getDashboardStats(),
      getMonthlySales(),
      getGstSummary(),
      getTopCustomers(5),
      getProductPerformance(5),
      getPendingPayments(),
    ]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground text-sm">
          GST summaries, revenue trends, and business insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(gstSummary.totalTax)}
                </p>
                <p className="text-xs text-muted-foreground">GST Collected ({gstSummary.period})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-amber-400">
                  {formatCurrency(stats.outstanding)}
                </p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <IndianRupee className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(stats.totalPaid)}
                </p>
                <p className="text-xs text-muted-foreground">Total Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
            <CardDescription className="text-xs">
              Revenue and GST collection trends for {new Date().getFullYear()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthlySales} />
          </CardContent>
        </Card>

        {/* GST Breakdown */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">GST Breakdown</CardTitle>
            <CardDescription className="text-xs">
              {gstSummary.period} — {gstSummary.invoiceCount} invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GstBreakdownChart data={gstSummary} />
            <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST</span>
                <span className="font-mono">{formatCurrency(gstSummary.cgstTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGST</span>
                <span className="font-mono">{formatCurrency(gstSummary.sgstTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IGST</span>
                <span className="font-mono">{formatCurrency(gstSummary.igstTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-2">
                <span>Total GST Payable</span>
                <span className="font-mono text-primary">
                  {formatCurrency(gstSummary.totalTax)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Top Customers
            </CardTitle>
            <CardDescription className="text-xs">
              By total revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No customer data yet
              </p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <Link
                    key={customer.id}
                    href={`/dashboard/customers/${customer.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.invoiceCount} invoices
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium">
                      {formatCurrency(customer.totalRevenue)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-500" />
              Product Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Top selling products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No sales data yet
              </p>
            ) : (
              <div className="space-y-3">
                {productPerformance.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.totalSold} units sold
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium">
                      {formatCurrency(product.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Payments
            </CardTitle>
            <CardDescription className="text-xs">
              Invoices awaiting payment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4">
                      Invoice
                    </th>
                    <th className="text-left font-medium text-muted-foreground p-4">
                      Customer
                    </th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">
                      Due Date
                    </th>
                    <th className="text-right font-medium text-muted-foreground p-4">
                      Total
                    </th>
                    <th className="text-right font-medium text-muted-foreground p-4">
                      Remaining
                    </th>
                    <th className="text-center font-medium text-muted-foreground p-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((inv) => {
                    const statusConfig = INVOICE_STATUSES.find(
                      (s) => s.value === inv.status
                    );
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/dashboard/invoices/${inv.id}`}
                            className="font-mono font-medium hover:text-primary transition-colors"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="p-4">{inv.customer.name}</td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="p-4 text-right font-mono">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="p-4 text-right font-mono text-amber-400 font-medium">
                          {formatCurrency(inv.remainingAmount)}
                        </td>
                        <td className="p-4 text-center">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
