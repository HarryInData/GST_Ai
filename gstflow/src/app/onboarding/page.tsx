"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
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
import { Textarea } from "@/frontend/components/ui/textarea";
import { onboardingAction } from "@/backend/actions/auth.actions";
import {
  Loader2,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    stateCode: "",
    pincode: "",
    phone: "",
    email: "",
    invoicePrefix: "INV",
  });

  const handleStateChange = (stateCode: string | null) => {
    if (!stateCode) return;
    const state = INDIAN_STATES.find((s) => s.code === stateCode);
    setFormData({
      ...formData,
      stateCode,
      state: state?.name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("Session expired. Please sign in again.");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const result = await onboardingAction(session.user.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Business profile set up successfully!");
        await update(); // Refresh session
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Business Info", icon: Building2 },
    { num: 2, title: "Address", icon: MapPin },
    { num: 3, title: "Invoice Setup", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] animate-float"
          style={{
            background: "oklch(0.627 0.265 303.9 / 15%)",
            animationDelay: "3s",
          }}
        />
      </div>

      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-gstai flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">
              GST<span className="gradient-text-ai">AI</span>
            </span>
          </div>
          <p className="text-muted-foreground">Set up your business profile</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => step > s.num && setStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  step === s.num
                    ? "gradient-primary text-white"
                    : step > s.num
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
                {s.title}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-px ${
                    step > s.num ? "bg-emerald-500" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="glass border-border/50 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Info */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      placeholder="Acme Technologies Pvt. Ltd."
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessName: e.target.value,
                        })
                      }
                      required
                      className="h-11 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN (Optional)</Label>
                    <Input
                      id="gstin"
                      placeholder="22AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gstin: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength={15}
                      className="h-11 bg-background/50 uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      15-character GST Identification Number
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="h-11 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        placeholder="info@company.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="h-11 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        if (!formData.businessName) {
                          toast.error("Business name is required");
                          return;
                        }
                        setStep(2);
                      }}
                      className="gradient-primary text-white hover:opacity-90"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Business Address
                  </CardTitle>
                  <CardDescription>
                    Where is your business located?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="123, Main Street, Near Clock Tower"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      className="bg-background/50 min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                        className="h-11 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">
                        Pincode <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        required
                        maxLength={6}
                        className="h-11 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.stateCode}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger className="h-11 bg-background/50">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.code} — {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (
                          !formData.address ||
                          !formData.city ||
                          !formData.stateCode ||
                          !formData.pincode
                        ) {
                          toast.error("Please fill all required fields");
                          return;
                        }
                        setStep(3);
                      }}
                      className="gradient-primary text-white hover:opacity-90"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Invoice Setup */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Invoice Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your invoice numbering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">
                      Invoice Prefix{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="invoicePrefix"
                      placeholder="INV"
                      value={formData.invoicePrefix}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoicePrefix: e.target.value.toUpperCase(),
                        })
                      }
                      required
                      maxLength={10}
                      className="h-11 bg-background/50 uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your invoices will be numbered as:{" "}
                      <span className="font-mono text-foreground">
                        {formData.invoicePrefix || "INV"}-0001
                      </span>
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="text-sm font-medium mb-3 text-primary">
                      Business Profile Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Business</span>
                        <span className="font-medium">
                          {formData.businessName}
                        </span>
                      </div>
                      {formData.gstin && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GSTIN</span>
                          <span className="font-mono">
                            {formData.gstin}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span>
                          {formData.city}, {formData.state}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Invoice Format
                        </span>
                        <span className="font-mono">
                          {formData.invoicePrefix}-0001
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="gradient-primary text-white hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Setting up..." : "Complete Setup"}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
