"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/backend/actions/product.actions";
import { GST_RATES, PRODUCT_UNITS } from "@/backend/validations/product";
import { Loader2, Package } from "lucide-react";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    hsnCode?: string | null;
    sku?: string | null;
    unit: string;
    price: number;
    gstRate: number;
    stock: number;
    lowStockAlert: number;
    isActive: boolean;
  };
}

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    hsnCode: initialData?.hsnCode || "",
    sku: initialData?.sku || "",
    unit: initialData?.unit || "NOS",
    price: initialData?.price || 0,
    purchasePrice: 0,
    gstRate: initialData?.gstRate ?? 18,
    stock: initialData?.stock || 0,
    lowStockAlert: initialData?.lowStockAlert || 10,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(initialData!.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          mode === "create"
            ? "Product created successfully!"
            : "Product updated successfully!"
        );
        router.push("/dashboard/products");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Details */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-violet-500" />
              Product Details
            </CardTitle>
            <CardDescription className="text-xs">
              Basic product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Laptop Stand"
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Product description..."
                rows={3}
                className="bg-background/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN / SAC Code</Label>
                <Input
                  id="hsnCode"
                  value={formData.hsnCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hsnCode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="e.g., 8471"
                  maxLength={8}
                  className="bg-background/50 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU Code</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="e.g., LPTST-001"
                  className="bg-background/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, unit: v || "NOS" }))
                }
              >
                <SelectTrigger id="unit" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Product is active and available for invoicing
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Pricing & Inventory</CardTitle>
            <CardDescription className="text-xs">
              Set pricing, GST rate, and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Selling Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  required
                  className="bg-background/50 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purchasePrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  className="bg-background/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstRate">
                GST Rate (%) <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(formData.gstRate)}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, gstRate: parseInt(v || "18") }))
                }
              >
                <SelectTrigger id="gstRate" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GST_RATES.map((rate) => (
                    <SelectItem key={rate} value={String(rate)}>
                      {rate}% GST
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Preview */}
            <div className="rounded-lg border border-border/50 bg-background/30 p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Price Preview
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-mono">₹{formData.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  GST ({formData.gstRate}%)
                </span>
                <span className="font-mono">
                  ₹{((formData.price * formData.gstRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="font-mono text-primary">
                  ₹
                  {(
                    formData.price +
                    (formData.price * formData.gstRate) / 100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4 space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Stock Management
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stock: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-background/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lowStockAlert: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-background/50 font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.name || formData.price <= 0}
          className="gradient-primary text-white hover:opacity-90 min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Product"
          ) : (
            "Update Product"
          )}
        </Button>
      </div>
    </form>
  );
}
