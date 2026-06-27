"use client";

import { useState } from "react";
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
import { forgotPasswordAction } from "@/backend/actions/auth.actions";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction({ email });

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        setIsSubmitted(true);
        toast.success("Check your email for reset instructions");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            GST<span className="gradient-text">Flow</span>
          </span>
        </div>
      </div>

      <Card className="glass border-border/50 shadow-2xl">
        {!isSubmitted ? (
          <>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                Forgot password?
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email and we&apos;ll send you a reset link
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 bg-background/50"
                  />
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
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to sign in
                </Link>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                Check your email
              </CardTitle>
              <CardDescription className="text-center">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Try another email
              </Button>

              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
