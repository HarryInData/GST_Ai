"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { loginAction } from "@/backend/actions/auth.actions";
import { Eye, EyeOff, Loader2, ArrowRight, FileText, MessageSquareText, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginAction(formData);

      if (result.error) {
        setErrors({ form: result.error });
        toast.error(result.error);
      } else if (result.success && result.redirect) {
        toast.success("Welcome back!");
        router.push(result.redirect);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-gstai opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/15 blur-[100px] animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full blur-[80px] animate-float"
          style={{ background: "oklch(0.627 0.265 303.9 / 10%)", animationDelay: "3s" }}
        />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl gradient-gstai flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              GST<span className="gradient-text-ai">AI</span>
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold tracking-tight mb-4 leading-tight">
            AI-Powered Business
            <br />
            <span className="gradient-text-ai">Management Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-md">
            Create invoices, generate documents, and manage your entire business with the power of AI.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-4">
            {[
              { icon: FileText, label: "GST-Compliant Invoicing", color: "text-primary" },
              { icon: MessageSquareText, label: "AI Chat Assistant", color: "text-cyan-500" },
              { icon: BarChart3, label: "Smart Analytics & Reports", color: "text-emerald-500" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-gstai flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                GST<span className="gradient-text-ai">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-Powered Business Management
            </p>
          </div>

          <Card className="glass-card border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your GST AI account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {errors.form && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                    {errors.form}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="h-11 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="h-11 bg-background/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 gradient-primary text-white hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
