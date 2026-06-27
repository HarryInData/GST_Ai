"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/frontend/components/layout/sidebar";
import { Header } from "@/frontend/components/layout/header";
import { AIChatWidget } from "@/frontend/components/ai/ai-chat-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content area */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
          }`}
        >
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="p-4 lg:p-6 pt-20 lg:pt-6">{children}</main>
        </div>

        {/* AI Chat Widget */}
        <AIChatWidget />
      </div>
    </SessionProvider>
  );
}
