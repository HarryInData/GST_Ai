"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { toast } from "sonner";
import { updateInvoiceStatus, deleteInvoice } from "@/backend/actions/invoice.actions";
import { recordPayment } from "@/backend/actions/payment.actions";
import { PAYMENT_METHODS } from "@/backend/validations/payment";
import { formatCurrency } from "@/backend/services/gst";
import { Loader2, Send, CheckCircle2, Trash2, IndianRupee } from "lucide-react";

interface InvoiceActionsProps {
  invoice: {
    id: string;
    status: string;
    totalAmount: number;
  };
  remaining: number;
}

export function InvoiceActions({ invoice, remaining }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: remaining,
    method: "CASH",
    reference: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      const result = await updateInvoiceStatus(invoice.id, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        const displayStatus = (status || "").toLowerCase() || "updated";
        toast.success(`Invoice marked as ${displayStatus}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    setLoading(true);
    try {
      const result = await recordPayment({
        invoiceId: invoice.id,
        amount: Number(paymentData.amount),
        method: paymentData.method,
        reference: paymentData.reference,
        date: paymentData.date,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment recorded successfully!");
        setPaymentOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this draft invoice? This cannot be undone.")) return;
    setLoading(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invoice deleted.");
        router.push("/dashboard/invoices");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {invoice.status === "DRAFT" && (
        <>
          <Button
            size="sm"
            onClick={() => handleStatusChange("SENT")}
            disabled={loading}
            className="gradient-primary text-white hover:opacity-90"
          >
            <Send className="h-4 w-4 mr-2" />
            Mark as Sent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </>
      )}

      {["SENT", "PARTIAL", "OVERDUE"].includes(invoice.status) &&
        remaining > 0 && (
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gradient-primary text-white hover:opacity-90">
              <IndianRupee className="h-4 w-4 mr-2" />
              Record Payment
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Remaining: {formatCurrency(remaining)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remaining}
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentData.method}
                    onValueChange={(v) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        method: v || "CASH",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference / Transaction ID</Label>
                  <Input
                    value={paymentData.reference}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        reference: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={handleRecordPayment}
                  disabled={loading || paymentData.amount <= 0}
                  className="w-full gradient-primary text-white hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      {invoice.status === "SENT" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange("OVERDUE")}
          disabled={loading}
        >
          Mark Overdue
        </Button>
      )}
    </div>
  );
}
