import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Users, Plus, Search, ArrowRight, IndianRupee } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import Link from "next/link";
import { getCustomers } from "@/backend/actions/customer.actions";
import { formatCurrency } from "@/backend/services/gst";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const customers = await getCustomers(params.search);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground text-sm">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} in your directory
          </p>
        </div>
        <Button
          asChild
          className="gradient-primary text-white hover:opacity-90"
        >
          <Link href="/dashboard/customers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={params.search}
          placeholder="Search customers by name, GSTIN, or email..."
          className="pl-9 h-10 bg-background/50"
        />
      </form>

      {customers.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Add your first customer to start creating invoices and tracking
              your business relationships.
            </p>
            <Button
              asChild
              className="gradient-primary text-white hover:opacity-90"
            >
              <Link href="/dashboard/customers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
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
                    <th className="text-left font-medium text-muted-foreground p-4">Customer</th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">GSTIN</th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden lg:table-cell">Phone</th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden lg:table-cell">City</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Invoices</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Outstanding</th>
                    <th className="text-right font-medium text-muted-foreground p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {customer.name}
                        </Link>
                        {customer.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {customer.email}
                          </p>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {customer.gstin ? (
                          <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono">
                            {customer.gstin}
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">
                        {customer.phone || "—"}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">
                        {customer.city || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant="outline" className="font-mono">
                          {customer.invoiceCount}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {customer.outstanding > 0 ? (
                          <span className="text-amber-400 font-medium font-mono flex items-center justify-end gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {formatCurrency(customer.outstanding).replace("₹", "")}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">Settled</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/customers/${customer.id}`}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
