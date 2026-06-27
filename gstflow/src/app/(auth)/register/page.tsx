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
import { registerAction } from "@/backend/actions/auth.actions";
import { Eye, EyeOff, Loader2, UserPlus, Check, X, Sparkles, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength indicators
  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    matches:
      formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerAction(formData);

      if (result.error) {
        setErrors({ form: result.error });
        toast.error(result.error);
      } else if (result.success && result.redirect) {
        toast.success("Account created successfully!");
        router.push(result.redirect);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordCheck = ({
    met,
    label,
  }: {
    met: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={met ? "text-emerald-500" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-gstai opacity-10" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-primary/15 blur-[100px] animate-float" />
        <div
          className="absolute bottom-1/3 right-1/3 w-[280px] h-[280px] rounded-full blur-[80px] animate-float"
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
            Start Your Business
            <br />
            <span className="gradient-text-ai">Journey Today</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-md">
            Set up your business profile in minutes and unlock the full power of AI-driven management.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: Sparkles, label: "Free forever — no hidden costs", color: "text-primary" },
              { icon: Zap, label: "Setup in under 2 minutes", color: "text-amber-500" },
              { icon: Shield, label: "Secure & GST compliant", color: "text-emerald-500" },
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
                Create your account
              </CardTitle>
              <CardDescription className="text-center">
                Get started with GST AI in minutes
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
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="h-11 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
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
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
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

                  {/* Password strength */}
                  {formData.password.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <PasswordCheck met={passwordChecks.minLength} label="8+ characters" />
                      <PasswordCheck met={passwordChecks.hasUppercase} label="Uppercase" />
                      <PasswordCheck met={passwordChecks.hasLowercase} label="Lowercase" />
                      <PasswordCheck met={passwordChecks.hasNumber} label="Number" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className="h-11 bg-background/50"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword.length > 0 && (
                    <PasswordCheck met={passwordChecks.matches} label="Passwords match" />
                  )}
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
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By creating an account, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
