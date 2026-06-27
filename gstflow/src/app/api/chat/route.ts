import { NextRequest, NextResponse } from "next/server";
import { findBestMatch, getSuggestedActions } from "@/backend/services/ai-knowledge-base";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Try knowledge base first
    const match = findBestMatch(message);

    if (match) {
      return NextResponse.json({
        response: match.response,
        category: match.category,
        followUp: match.followUp || [],
      });
    }

    // Fallback response if no match found
    const fallbackResponse =
      "I'm not sure I understand that question. Here are some things I can help you with:\n\n" +
      "• 🧾 **Invoicing** — Creating, managing, and understanding invoices\n" +
      "• 💰 **GST** — Tax calculations, rates, and compliance\n" +
      "• 👥 **Customers** — Adding and managing customers\n" +
      "• 📦 **Products** — Product catalog and inventory\n" +
      "• 📄 **Documents** — Quotations, POs, credit notes\n" +
      "• 📊 **Reports** — Analytics and summaries\n\n" +
      "Try asking something specific, like _\"How to create an invoice?\"_";

    return NextResponse.json({
      response: fallbackResponse,
      category: "general",
      followUp: getSuggestedActions(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
