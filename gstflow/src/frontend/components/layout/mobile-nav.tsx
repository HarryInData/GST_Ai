"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/frontend/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/components/ui/sheet";
import { Separator } from "@/frontend/components/ui/separator";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Shield,
  FolderOpen,
  Sparkles,
} from "lucide-react";

const navigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { title: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-accent transition-colors">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gstai flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-lg font-bold">
              GST<span className="gradient-text-ai">AI</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}

          <Separator className="my-2" />

          {/* AI Assistant */}
          <button
            onClick={() => {
              setOpen(false);
              setTimeout(() => {
                const chatBtn = document.querySelector(".chat-bubble button, .chat-bubble") as HTMLElement;
                if (chatBtn) chatBtn.click();
              }, 300);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-cyan-500 hover:bg-cyan-500/10"
          >
            <Sparkles className="h-5 w-5" />
            AI Assistant
            <span className="ml-auto px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-semibold">
              AI
            </span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          {session?.user?.role === "ADMIN" && (
            <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-md bg-primary/5 border border-primary/10">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Admin</span>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive mt-1"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
