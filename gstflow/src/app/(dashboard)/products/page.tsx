import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import Link from "next/link";
import { getProducts } from "@/backend/actions/product.actions";
import { formatCurrency } from "@/backend/services/gst";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts(params.search);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground text-sm">
            {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <Button
          asChild
          className="gradient-primary text-white hover:opacity-90"
        >
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={params.search}
          placeholder="Search products by name, HSN code, or SKU..."
          className="pl-9 h-10 bg-background/50"
        />
      </form>

      {products.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Package className="h-7 w-7 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No products yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Add your products with HSN codes, GST rates, and pricing to
              quickly add them to invoices.
            </p>
            <Button
              asChild
              className="gradient-primary text-white hover:opacity-90"
            >
              <Link href="/dashboard/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
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
                    <th className="text-left font-medium text-muted-foreground p-4">Product</th>
                    <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">HSN</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Price</th>
                    <th className="text-center font-medium text-muted-foreground p-4">GST %</th>
                    <th className="text-center font-medium text-muted-foreground p-4">Stock</th>
                    <th className="text-center font-medium text-muted-foreground p-4">Status</th>
                    <th className="text-right font-medium text-muted-foreground p-4 w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.stock <= product.lowStockAlert;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {product.hsnCode ? (
                            <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono">
                              {product.hsnCode}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono font-medium">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className="font-mono text-xs">
                            {product.gstRate}%
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isLowStock && (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span
                              className={`font-mono font-medium ${
                                isLowStock ? "text-amber-400" : ""
                              } ${product.stock === 0 ? "text-red-400" : ""}`}
                            >
                              {product.stock}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {product.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/products/${product.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
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
