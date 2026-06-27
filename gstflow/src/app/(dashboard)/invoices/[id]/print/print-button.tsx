"use client";

import { Button } from "@/frontend/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrintButton() {
  const router = useRouter();

  return (
    <div className="flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border p-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button
        size="sm"
        onClick={() => window.print()}
        className="gradient-primary text-white hover:opacity-90"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print / Save as PDF
      </Button>
    </div>
  );
}
