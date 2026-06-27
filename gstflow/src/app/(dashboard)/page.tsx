import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import {
  FileText,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Clock,
  AlertTriangle,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/backend/auth/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getRecentInvoices } from "@/backend/actions/analytics.actions";
import { getLowStockProducts } from "@/backend/actions/product.actions";
import { formatCurrency } from "@/backend/services/gst";
import { formatDate } from "@/backend/db/helpers";
import { INVOICE_STATUSES } from "@/backend/validations/invoice";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.organizationId) {
    redirect("/onboarding");
  }

  const [stats, recentInvoices, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentInvoices(5),
    getLowStockProducts(),
  ]);

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: `${stats.invoiceCount} invoices`,
      trend: "up" as const,
      icon: IndianRupee,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      change: `${stats.overdueCount} pending`,
      trend: stats.outstanding > 0 ? ("down" as const) : ("up" as const),
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Total Invoices",
      value: String(stats.invoiceCount),
      change: `${stats.paidCount} paid`,
      trend: "up" as const,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Customers",
      value: String(stats.customerCount),
      change: `${stats.productCount} products`,
      trend: "up" as const,
      icon: Users,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/customers/new">
              <Users className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
          <Button asChild size="sm" className="gradient-primary text-white hover:opacity-90">
            <Link href="/dashboard/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`p-2.5 rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Invoices
              </CardTitle>
              <CardDescription className="text-xs">
                Your latest invoice activity
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/dashboard/invoices">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No invoices yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create your first invoice to get started
                </p>
                <Button
                  asChild
                  size="sm"
                  className="gradient-primary text-white hover:opacity-90"
                >
                  <Link href="/dashboard/invoices/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentInvoices.map((inv) => {
                  const statusConfig = INVOICE_STATUSES.find(
                    (s) => s.value === inv.status
                  );
                  return (
                    <Link
                      key={inv.id}
                      href={`/dashboard/invoices/${inv.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium font-mono">
                            {inv.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inv.customer.name} · {formatDate(inv.invoiceDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium font-mono">
                            {formatCurrency(inv.totalAmount)}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${statusConfig?.color || ""}`}
                          >
                            {statusConfig?.label || inv.status}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Low Stock */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Common tasks to help you manage your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Create Invoice",
                  desc: "Generate a new GST invoice",
                  icon: FileText,
                  href: "/dashboard/invoices/new",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  title: "Generate Documents",
                  desc: "Quotations, POs, Credit Notes & more",
                  icon: FolderOpen,
                  href: "/dashboard/documents",
                  color: "text-violet-500",
                  bg: "bg-violet-500/10",
                },
                {
                  title: "Add Customer",
                  desc: "Add a new customer to your directory",
                  icon: Users,
                  href: "/dashboard/customers/new",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
                {
                  title: "Add Product",
                  desc: "Add products to your catalog",
                  icon: Package,
                  href: "/dashboard/products/new",
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                },
                {
                  title: "View Reports",
                  desc: "GST summary and analytics",
                  icon: TrendingUp,
                  href: "/dashboard/reports",
                  color: "text-rose-500",
                  bg: "bg-rose-500/10",
                },
              ].map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-all group"
                >
                  <div className={`p-2.5 rounded-xl ${action.bg}`}>
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <Card className="border-amber-500/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}/edit`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">{product.name}</span>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 font-mono text-xs">
                      {product.stock} left
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
