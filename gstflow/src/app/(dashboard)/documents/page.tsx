import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import {
  FileText,
  ClipboardList,
  CreditCard,
  Receipt,
  Truck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const documentTypes = [
  {
    title: "Quotation / Estimate",
    description: "Send price quotes to prospects and potential customers before finalizing a deal.",
    icon: FileText,
    href: "/dashboard/documents/quotation",
    color: "text-primary",
    bg: "bg-primary/10",
    gradient: "from-primary/10 to-transparent",
  },
  {
    title: "Purchase Order",
    description: "Create purchase orders for ordering goods and services from your suppliers.",
    icon: ClipboardList,
    href: "/dashboard/documents/purchase-order",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    gradient: "from-emerald-500/10 to-transparent",
  },
  {
    title: "Credit Note",
    description: "Issue credit notes for returns, refunds, or invoice adjustments to customers.",
    icon: CreditCard,
    href: "/dashboard/documents/credit-note",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/10 to-transparent",
  },
  {
    title: "Delivery Challan",
    description: "Document goods dispatched for delivery with transport and shipping details.",
    icon: Truck,
    href: "/dashboard/documents/delivery-challan",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    gradient: "from-violet-500/10 to-transparent",
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Document Hub</h2>
        <p className="text-muted-foreground text-sm">
          Generate professional business documents for your operations
        </p>
      </div>

      {/* AI Tip */}
      <div className="flex items-start gap-3 p-4 rounded-2xl glass-card border-cyan-500/20">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <p className="text-sm font-medium">Need help choosing?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ask the AI Assistant which document type is right for your situation. Click the chat bubble in the bottom-right corner.
          </p>
        </div>
      </div>

      {/* Document Types Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {documentTypes.map((doc) => (
          <Link key={doc.title} href={doc.href}>
            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${doc.bg} flex items-center justify-center`}>
                    <doc.icon className={`h-6 w-6 ${doc.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-lg mt-3">{doc.title}</CardTitle>
                <CardDescription className="text-sm">
                  {doc.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Pro-forma Invoice</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Debit Note</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
