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
import { toast } from "sonner";
import { createCustomer, updateCustomer } from "@/backend/actions/customer.actions";
import { validateGSTIN } from "@/backend/validations/customer";
import { INDIAN_STATES } from "@/backend/services/gst";
import { Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";

interface CustomerFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    gstin?: string | null;
    billingAddress?: string | null;
    shippingAddress?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  };
}

export function CustomerForm({ mode, initialData }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gstinStatus, setGstinStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [gstinError, setGstinError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    gstin: initialData?.gstin || "",
    billingAddress: initialData?.billingAddress || "",
    shippingAddress: initialData?.shippingAddress || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    stateCode: "",
    pincode: initialData?.pincode || "",
  });

  const handleGSTINChange = (value: string) => {
    const upper = value.toUpperCase();
    setFormData((prev) => ({ ...prev, gstin: upper }));

    if (upper.length === 0) {
      setGstinStatus("idle");
      setGstinError("");
      return;
    }

    const result = validateGSTIN(upper);
    if (upper.length === 15) {
      setGstinStatus(result.valid ? "valid" : "invalid");
      setGstinError(result.error || "");

      // Auto-fill state from GSTIN
      if (result.valid) {
        const stateCode = upper.substring(0, 2);
        const state = INDIAN_STATES.find((s) => s.code === stateCode);
        if (state) {
          setFormData((prev) => ({
            ...prev,
            gstin: upper,
            state: state.name,
            stateCode: state.code,
          }));
        }
      }
    } else {
      setGstinStatus("idle");
      setGstinError("");
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = INDIAN_STATES.find((s) => s.name === stateName);
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      stateCode: state?.code || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result =
        mode === "create"
          ? await createCustomer(formData)
          : await updateCustomer(initialData!.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          mode === "create"
            ? "Customer created successfully!"
            : "Customer updated successfully!"
        );
        router.push("/dashboard/customers");
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
        {/* Basic Info */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-xs">
              Customer name and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Customer / Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Acme Corporation"
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <div className="relative">
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => handleGSTINChange(e.target.value)}
                  placeholder="e.g., 29AABCU9603R1ZM"
                  maxLength={15}
                  className={`bg-background/50 pr-10 font-mono uppercase ${
                    gstinStatus === "valid"
                      ? "border-emerald-500 focus-visible:ring-emerald-500"
                      : gstinStatus === "invalid"
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                {gstinStatus === "valid" && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
                {gstinStatus === "invalid" && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {gstinError && (
                <p className="text-xs text-destructive">{gstinError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@example.com"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="9876543210"
                  maxLength={10}
                  className="bg-background/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Address Details</CardTitle>
            <CardDescription className="text-xs">
              Billing and shipping address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                value={formData.billingAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billingAddress: e.target.value,
                  }))
                }
                placeholder="Enter billing address..."
                rows={3}
                className="bg-background/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shippingAddress: e.target.value,
                  }))
                }
                placeholder="Same as billing (leave empty if same)"
                rows={2}
                className="bg-background/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(v) => handleStateChange(v || "")}
                >
                  <SelectTrigger id="state" className="bg-background/50">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.name}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                }
                placeholder="560001"
                maxLength={6}
                className="bg-background/50 w-1/2"
              />
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
          disabled={loading || !formData.name}
          className="gradient-primary text-white hover:opacity-90 min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Customer"
          ) : (
            "Update Customer"
          )}
        </Button>
      </div>
    </form>
  );
}
