"use client";

import { useState, useCallback, useEffect } from "react";
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
import { toast } from "sonner";
import { createInvoice } from "@/backend/actions/invoice.actions";
import {
  calculateLineItemTax,
  calculateInvoiceTotals,
  isInterStateSupply,
  formatCurrency,
  numberToWords,
  INDIAN_STATES,
} from "@/backend/services/gst";
import { GST_RATES } from "@/backend/validations/product";
import { Loader2, Plus, Trash2, FileText, Calculator } from "lucide-react";
import type { InvoiceItemInput } from "@/backend/validations/invoice";

interface InvoiceFormProps {
  customers: Array<{
    id: string;
    name: string;
    gstin?: string | null;
    state?: string | null;
  }>;
  products: Array<{
    id: string;
    name: string;
    hsnCode?: string | null;
    price: number;
    gstRate: number;
    unit: string;
    stock: number;
  }>;
  orgStateCode?: string | null;
}

const emptyItem: InvoiceItemInput = {
  productId: "",
  description: "",
  hsnCode: "",
  quantity: 1,
  unitPrice: 0,
  gstRate: 18,
};

export function InvoiceForm({
  customers,
  products,
  orgStateCode,
}: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveType, setSaveType] = useState<"DRAFT" | "SENT">("DRAFT");

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    placeOfSupply: "",
    reverseCharge: false,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItemInput[]>([{ ...emptyItem }]);

  // Determine inter-state from place of supply
  const interState = isInterStateSupply(orgStateCode, formData.placeOfSupply);

  // Auto-set place of supply when customer is selected
  useEffect(() => {
    if (formData.customerId) {
      const customer = customers.find((c) => c.id === formData.customerId);
      if (customer?.state) {
        const state = INDIAN_STATES.find((s) => s.name === customer.state);
        if (state) {
          setFormData((prev) => ({ ...prev, placeOfSupply: state.code }));
        }
      }
    }
  }, [formData.customerId, customers]);

  // Calculate line item taxes
  const itemTaxes = items.map((item) =>
    calculateLineItemTax(item.quantity, item.unitPrice, item.gstRate, interState)
  );
  const totals = calculateInvoiceTotals(itemTaxes);

  // Select a product → auto-fill item fields
  const handleProductSelect = useCallback(
    (index: number, productId: string) => {
      if (!productId) return;
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                productId,
                description: product.name,
                hsnCode: product.hsnCode || "",
                unitPrice: product.price,
                gstRate: product.gstRate,
              }
            : item
        )
      );
    },
    [products]
  );

  const updateItem = (index: number, field: keyof InvoiceItemInput, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: "DRAFT" | "SENT") => {
    setSaveType(status);
    setLoading(true);

    try {
      const result = await createInvoice({
        ...formData,
        status,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          gstRate: Number(item.gstRate),
        })),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          status === "DRAFT"
            ? "Invoice saved as draft!"
            : "Invoice created successfully!"
        );
        router.push(`/dashboard/invoices/${result.invoiceId}`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Customer & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    Customer <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, customerId: v || "" }))
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.gstin ? ` (${c.gstin})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceDate: e.target.value,
                      }))
                    }
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Place of Supply</Label>
                  <Select
                    value={formData.placeOfSupply}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, placeOfSupply: v || "" }))
                    }
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.code} - {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {interState && (
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <Calculator className="h-3 w-3" />
                      Inter-state supply — IGST will be applied
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
              <CardDescription className="text-xs">
                Add products or services to the invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border/50 bg-background/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    {products.length > 0 && (
                      <div className="sm:col-span-6 space-y-1">
                        <Label className="text-xs">Select Product</Label>
                        <Select
                          value={item.productId || ""}
                          onValueChange={(v) => handleProductSelect(index, v || "")}
                        >
                          <SelectTrigger className="bg-background/50 h-9 text-xs">
                            <SelectValue placeholder="Choose a product or enter manually" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} — {formatCurrency(p.price)} ({p.gstRate}%)
                                {p.stock > 0 ? ` [Stock: ${p.stock}]` : " [Out of stock]"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-xs">Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                        className="bg-background/50 h-9 text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <Label className="text-xs">HSN Code</Label>
                      <Input
                        value={item.hsnCode}
                        onChange={(e) =>
                          updateItem(index, "hsnCode", e.target.value)
                        }
                        placeholder="HSN"
                        className="bg-background/50 h-9 text-sm font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="bg-background/50 h-9 text-sm font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <Label className="text-xs">Rate (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="bg-background/50 h-9 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">GST %</Label>
                      <Select
                        value={String(item.gstRate)}
                        onValueChange={(v) =>
                          updateItem(index, "gstRate", parseInt(v || "0"))
                        }
                      >
                        <SelectTrigger className="bg-background/50 h-9 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GST_RATES.map((rate) => (
                            <SelectItem key={rate} value={String(rate)}>
                              {rate}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Per-item tax summary */}
                    <div className="flex-1 text-right space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Taxable: <span className="font-mono">{formatCurrency(itemTaxes[index].taxableAmount)}</span>
                      </p>
                      {!interState ? (
                        <p className="text-xs text-muted-foreground">
                          CGST: <span className="font-mono">{formatCurrency(itemTaxes[index].cgstAmount)}</span>
                          {" + "}SGST: <span className="font-mono">{formatCurrency(itemTaxes[index].sgstAmount)}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          IGST: <span className="font-mono">{formatCurrency(itemTaxes[index].igstAmount)}</span>
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        Total: {formatCurrency(itemTaxes[index].totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Payment terms, notes, or additional information..."
                rows={3}
                className="bg-background/50 resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary Panel */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono font-medium">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>

              {!interState ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span className="font-mono">
                      {formatCurrency(totals.cgstTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span className="font-mono">
                      {formatCurrency(totals.sgstTotal)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST</span>
                  <span className="font-mono">
                    {formatCurrency(totals.igstTotal)}
                  </span>
                </div>
              )}

              <div className="border-t border-border/50 pt-3 flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span className="gradient-text font-mono">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>

              {totals.grandTotal > 0 && (
                <p className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
                  {numberToWords(totals.grandTotal)}
                </p>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-4">
                <Button
                  type="button"
                  onClick={() => handleSubmit("SENT")}
                  disabled={loading || !formData.customerId || items.every((i) => !i.description)}
                  className="w-full gradient-primary text-white hover:opacity-90"
                >
                  {loading && saveType === "SENT" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={loading || !formData.customerId}
                  className="w-full"
                >
                  {loading && saveType === "DRAFT" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
