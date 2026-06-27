import Link from "next/link";
import { auth } from "@/backend/auth/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  Users,
  Package,
  BarChart3,
  MessageSquareText,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (!session.user.organizationId) {
      redirect("/onboarding");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-gstai flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                GST<span className="gradient-text-ai">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-medium gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div
          className="absolute top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] animate-float"
          style={{
            background: "oklch(0.627 0.265 303.9 / 8%)",
            animationDelay: "3s",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium mb-8 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">AI-Powered Business Management</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Your Business,{" "}
            <span className="gradient-text-ai text-glow">Supercharged</span>
            <br />
            with AI
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Create GST invoices, generate business documents, manage customers & products,
            and get instant AI assistance — all in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-3.5 gradient-primary text-white rounded-2xl font-medium text-base hover:opacity-90 transition-all shadow-lg shadow-primary/25"
            >
              Start Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-3.5 glass-card rounded-2xl font-medium text-base hover:bg-accent/50 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-muted-foreground animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>GST Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary" />
              <span>Free to Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Run Your Business</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete suite of tools designed for Indian businesses — from invoicing to AI assistance.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "GST Invoicing",
                desc: "Create GST-compliant invoices with automatic CGST/SGST/IGST calculations. Support for inter-state and intra-state supplies.",
                color: "text-primary",
                bg: "bg-primary/10",
                gradient: "from-primary/10 to-transparent",
              },
              {
                icon: Package,
                title: "Document Generator",
                desc: "Generate quotations, purchase orders, credit notes, debit notes, and delivery challans with professional templates.",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                gradient: "from-violet-500/10 to-transparent",
              },
              {
                icon: MessageSquareText,
                title: "AI Chat Assistant",
                desc: "Get instant help with platform features, GST queries, and business guidance from our built-in AI assistant.",
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
                gradient: "from-cyan-500/10 to-transparent",
              },
              {
                icon: Users,
                title: "Customer Management",
                desc: "Maintain a complete directory of customers with GSTIN, billing/shipping addresses, and transaction history.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                gradient: "from-emerald-500/10 to-transparent",
              },
              {
                icon: BarChart3,
                title: "Reports & Analytics",
                desc: "Track revenue, GST liability, top customers, and product performance with interactive charts and insights.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                gradient: "from-amber-500/10 to-transparent",
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                desc: "Enterprise-grade security with role-based access control. Fully compliant with Indian GST regulations.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
                gradient: "from-rose-500/10 to-transparent",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl glass-card hover:border-primary/20 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Get Started in <span className="gradient-text-ai">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up for free in seconds. No credit card required.",
              },
              {
                step: "02",
                title: "Set Up Business",
                desc: "Add your GSTIN, business details, and invoice preferences.",
              },
              {
                step: "03",
                title: "Start Working",
                desc: "Create invoices, generate documents, and let AI handle the rest.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl glass-card relative overflow-hidden">
            <div className="absolute inset-0 gradient-gstai opacity-5" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of Indian businesses using GST AI to streamline their operations.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-3.5 gradient-primary text-white rounded-2xl font-medium text-base hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  No credit card
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Setup in 2 min
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-gstai flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="text-sm font-semibold">
              GST<span className="gradient-text-ai">AI</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GST AI. Built for Indian businesses.
          </p>
        </div>
      </footer>
    </div>
  );
}
