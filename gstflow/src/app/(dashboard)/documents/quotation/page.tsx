"use client";

import { useState, useRef } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { DocumentPreview, type DocumentData, type DocumentItem } from "@/frontend/components/documents/document-preview";
import { Plus, Trash2, Printer, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

export default function QuotationPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    number: `QT-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    date: new Date().toISOString().split("T")[0],
    validUntil: "",
    fromName: "",
    fromAddress: "",
    fromGstin: "",
    fromPhone: "",
    fromEmail: "",
    toName: "",
    toAddress: "",
    toGstin: "",
    toPhone: "",
    toEmail: "",
    notes: "",
    terms: "1. This quotation is valid for the period mentioned above.\n2. Prices are inclusive of applicable GST.\n3. Payment terms: 50% advance, 50% on delivery.",
  });

  const [items, setItems] = useState<DocumentItem[]>([
    { description: "", hsnCode: "", quantity: 1, unit: "NOS", unitPrice: 0, gstRate: 18, amount: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { description: "", hsnCode: "", quantity: 1, unit: "NOS", unitPrice: 0, gstRate: 18, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof DocumentItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as unknown as Record<string, unknown>)[field] = value;
    // Recalculate amount
    const item = newItems[index];
    item.amount = item.quantity * item.unitPrice * (1 + item.gstRate / 100);
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalGst = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.gstRate / 100), 0);
  const total = subtotal + totalGst;

  const getPreviewData = (): DocumentData => ({
    type: "QUOTATION",
    number: formData.number,
    date: formData.date,
    validUntil: formData.validUntil,
    fromName: formData.fromName || "Your Business",
    fromAddress: formData.fromAddress,
    fromGstin: formData.fromGstin,
    fromPhone: formData.fromPhone,
    fromEmail: formData.fromEmail,
    toName: formData.toName || "Customer",
    toAddress: formData.toAddress,
    toGstin: formData.toGstin,
    toPhone: formData.toPhone,
    toEmail: formData.toEmail,
    items: items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice * (1 + item.gstRate / 100),
    })),
    subtotal,
    cgst: totalGst / 2,
    sgst: totalGst / 2,
    igst: 0,
    total,
    notes: formData.notes,
    terms: formData.terms,
  });

  const handlePrint = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Quotation</h2>
          <p className="text-muted-foreground text-sm">Generate a professional price quote</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6 no-print">
          {/* Document Info */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Quote Number</Label>
                  <Input value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} className="h-9 bg-background/50 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-9 bg-background/50 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Valid Until</Label>
                  <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="h-9 bg-background/50 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* From / To */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">From (Your Business)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name *</Label>
                  <Input value={formData.fromName} onChange={(e) => setFormData({ ...formData, fromName: e.target.value })} className="h-9 bg-background/50 text-sm" placeholder="Your Company" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GSTIN</Label>
                  <Input value={formData.fromGstin} onChange={(e) => setFormData({ ...formData, fromGstin: e.target.value.toUpperCase() })} className="h-9 bg-background/50 text-sm uppercase" placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Textarea value={formData.fromAddress} onChange={(e) => setFormData({ ...formData, fromAddress: e.target.value })} className="bg-background/50 text-sm min-h-[60px]" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={formData.fromPhone} onChange={(e) => setFormData({ ...formData, fromPhone: e.target.value })} className="h-9 bg-background/50 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={formData.fromEmail} onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })} className="h-9 bg-background/50 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">To (Customer)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer Name *</Label>
                  <Input value={formData.toName} onChange={(e) => setFormData({ ...formData, toName: e.target.value })} className="h-9 bg-background/50 text-sm" placeholder="Customer Company" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GSTIN</Label>
                  <Input value={formData.toGstin} onChange={(e) => setFormData({ ...formData, toGstin: e.target.value.toUpperCase() })} className="h-9 bg-background/50 text-sm uppercase" placeholder="22AAAAA0000A1Z5" maxLength={15} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Textarea value={formData.toAddress} onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })} className="bg-background/50 text-sm min-h-[60px]" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={formData.toPhone} onChange={(e) => setFormData({ ...formData, toPhone: e.target.value })} className="h-9 bg-background/50 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={formData.toEmail} onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })} className="h-9 bg-background/50 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-muted/30">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-[10px]">Description</Label>
                    <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="h-8 bg-background/50 text-xs" placeholder="Item name" />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="h-8 bg-background/50 text-xs" min={1} />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-[10px]">Unit</Label>
                    <Input value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="h-8 bg-background/50 text-xs" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px]">Price</Label>
                    <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} className="h-8 bg-background/50 text-xs" min={0} />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="text-[10px]">GST%</Label>
                    <Input type="number" value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", Number(e.target.value))} className="h-8 bg-background/50 text-xs" min={0} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[10px]">Amount</Label>
                    <div className="h-8 px-2 bg-muted/50 rounded-md flex items-center text-xs font-medium">
                      ₹{(item.quantity * item.unitPrice * (1 + item.gstRate / 100)).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-background/50 text-sm min-h-[60px]" placeholder="Additional notes..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Terms & Conditions</Label>
                <Textarea value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} className="bg-background/50 text-sm min-h-[80px]" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1">
              Preview
            </Button>
            <Button onClick={handlePrint} className="flex-1 gradient-primary text-white hover:opacity-90">
              <Printer className="h-4 w-4 mr-2" />
              Print / Download PDF
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className={`${showPreview ? "block" : "hidden lg:block"}`}>
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3 no-print">
              <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
              {showPreview && (
                <Button variant="ghost" size="sm" className="text-xs lg:hidden" onClick={() => setShowPreview(false)}>
                  Hide Preview
                </Button>
              )}
            </div>
            <div className="transform scale-[0.7] origin-top-left w-[143%]">
              <DocumentPreview ref={previewRef} data={getPreviewData()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
