"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { MobileNav } from "@/frontend/components/layout/mobile-nav";
import {
  Menu,
  Bell,
  LogOut,
  User,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/invoices": "Invoices",
  "/dashboard/invoices/new": "New Invoice",
  "/dashboard/customers": "Customers",
  "/dashboard/customers/new": "New Customer",
  "/dashboard/products": "Products",
  "/dashboard/products/new": "New Product",
  "/dashboard/documents": "Documents",
  "/dashboard/documents/quotation": "New Quotation",
  "/dashboard/documents/purchase-order": "Purchase Order",
  "/dashboard/documents/credit-note": "Credit Note",
  "/dashboard/documents/delivery-challan": "Delivery Challan",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const pageTitle =
    routeTitles[pathname] ||
    pathname
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (l) => l.toUpperCase()) ||
    "Dashboard";

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <MobileNav />

        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden lg:flex h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Assistant quick button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
          onClick={() => {
            const chatBtn = document.querySelector(".chat-bubble button, .chat-bubble") as HTMLElement;
            if (chatBtn) chatBtn.click();
          }}
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent transition-colors outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">
              {session?.user?.name?.split(" ")[0]}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </p>
                {session?.user?.role === "ADMIN" && (
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      Admin
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
