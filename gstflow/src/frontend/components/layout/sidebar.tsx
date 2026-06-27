"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/frontend/components/ui/button";
import { Separator } from "@/frontend/components/ui/separator";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FolderOpen,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "AI Assistant",
    href: "#ai-chat",
    icon: Sparkles,
    special: true,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "#ai-chat") return false;
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
    <aside
      className={`fixed top-0 left-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 hidden lg:flex flex-col ${
        collapsed ? "w-[80px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-gstai flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/20">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              GST<span className="gradient-text-ai">AI</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const isSpecial = "special" in item && item.special;

          if (isSpecial) {
            return (
              <div key={item.href}>
                <Separator className="my-2" />
                <button
                  onClick={() => {
                    // Trigger the chat widget to open
                    const chatBtn = document.querySelector(".chat-bubble button, .chat-bubble") as HTMLElement;
                    if (chatBtn) chatBtn.click();
                  }}
                  title={collapsed ? item.title : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group w-full text-cyan-500 hover:bg-cyan-500/10`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 text-cyan-500" />
                  {!collapsed && <span>{item.title}</span>}
                  {!collapsed && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-semibold text-cyan-500">
                      AI
                    </span>
                  )}
                </button>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 flex-shrink-0 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                }`}
              />
              {!collapsed && <span>{item.title}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User section */}
      <div className="p-3">
        {session?.user?.role === "ADMIN" && !collapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-md bg-primary/5 border border-primary/10">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Admin</span>
          </div>
        )}

        <div
          className={`flex items-center gap-3 px-3 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`mt-1 text-muted-foreground hover:text-destructive ${
            collapsed ? "w-full justify-center" : "w-full justify-start"
          }`}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
