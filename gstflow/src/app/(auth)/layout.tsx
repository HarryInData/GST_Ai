"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex bg-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] animate-float" />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-float"
            style={{
              background: "oklch(0.627 0.265 303.9 / 6%)",
              animationDelay: "3s",
            }}
          />
        </div>
        {children}
      </div>
    </SessionProvider>
  );
}
