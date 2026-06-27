// ─── GST AI KNOWLEDGE BASE ─────────────────────────────────
// Pattern-matching engine for the AI chat assistant
// Provides contextual help for all platform features

export interface KnowledgeEntry {
  keywords: string[];
  response: string;
  category: string;
  followUp?: string[];
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ─── INVOICING ────────────────────────────────────
  {
    keywords: ["create invoice", "new invoice", "make invoice", "generate invoice", "how to invoice"],
    response: "To create a new invoice:\n\n1. Go to **Invoices** from the sidebar\n2. Click **\"New Invoice\"** button\n3. Select a customer (or add new)\n4. Add line items with products, quantities, and prices\n5. GST will be auto-calculated (CGST+SGST for intra-state, IGST for inter-state)\n6. Choose status (Draft/Sent) and click **Create**\n\nYour invoice number is auto-generated based on your prefix settings!",
    category: "invoicing",
    followUp: ["How does GST calculation work?", "How to add a customer?", "How to edit invoice prefix?"],
  },
  {
    keywords: ["invoice status", "draft", "sent", "paid", "overdue", "invoice state"],
    response: "Invoice statuses in GST AI:\n\n• **Draft** — Not finalized, can be edited/deleted\n• **Sent** — Sent to customer, awaiting payment\n• **Paid** — Fully paid\n• **Partial** — Partially paid\n• **Overdue** — Past due date\n• **Cancelled** — Voided\n\nYou can update status from the invoice detail page.",
    category: "invoicing",
  },
  {
    keywords: ["delete invoice", "remove invoice", "cancel invoice"],
    response: "You can only delete invoices that are in **Draft** status. Once an invoice is sent or paid, it cannot be deleted — but you can change its status to **Cancelled**.\n\nTo delete a draft:\n1. Go to the invoice detail page\n2. Click the delete option\n3. Confirm deletion",
    category: "invoicing",
  },
  {
    keywords: ["invoice number", "invoice prefix", "invoice format", "numbering"],
    response: "Invoice numbers are auto-generated using your prefix + sequence number. For example: **INV-0001**, **INV-0002**, etc.\n\nTo change the prefix:\n1. Go to **Settings** → **Invoice** tab\n2. Update the Invoice Prefix\n\nThe prefix was set during onboarding. The next number increments automatically.",
    category: "invoicing",
  },

  // ─── GST CALCULATIONS ─────────────────────────────
  {
    keywords: ["gst", "tax", "cgst", "sgst", "igst", "gst calculation", "tax calculation", "how gst works"],
    response: "GST calculation in GST AI:\n\n**Intra-State Supply** (same state):\n• GST is split equally into CGST + SGST\n• Example: 18% GST → 9% CGST + 9% SGST\n\n**Inter-State Supply** (different states):\n• Full GST goes as IGST\n• Example: 18% GST → 18% IGST\n\nThe platform auto-detects supply type based on your business state code and the customer's state code (Place of Supply).",
    category: "gst",
    followUp: ["What are GST rates?", "How to check GST summary?"],
  },
  {
    keywords: ["gst rate", "tax rate", "5%", "12%", "18%", "28%", "gst slab"],
    response: "Common GST rates in India:\n\n• **0%** — Essential items (milk, grains, etc.)\n• **5%** — Packaged food, footwear under ₹1000\n• **12%** — Processed food, electronics\n• **18%** — Most goods & services (default)\n• **28%** — Luxury items, automobiles\n\nYou can set the GST rate for each product in the Products section. Each invoice line item can have a different rate.",
    category: "gst",
  },
  {
    keywords: ["hsn", "hsn code", "sac code", "hsn number"],
    response: "**HSN (Harmonized System of Nomenclature)** codes are used to classify goods for GST. SAC codes are used for services.\n\nYou can add HSN/SAC codes when:\n• Creating a product (in the product form)\n• Adding line items to an invoice\n\nHSN codes are mandatory for businesses with turnover above ₹5 crore. They help in standardized tax classification.",
    category: "gst",
  },

  // ─── CUSTOMERS ────────────────────────────────────
  {
    keywords: ["add customer", "new customer", "create customer", "customer management"],
    response: "To add a new customer:\n\n1. Go to **Customers** from the sidebar\n2. Click **\"Add Customer\"**\n3. Fill in details:\n   - Name, Email, Phone\n   - GSTIN (if registered)\n   - Billing & Shipping addresses\n   - State & Pincode\n4. Click **Create**\n\nCustomers are linked to your invoices for easy selection.",
    category: "customers",
    followUp: ["How to create an invoice?", "How to view customer history?"],
  },
  {
    keywords: ["customer gstin", "customer gst", "b2b customer", "registered customer"],
    response: "Adding GSTIN for customers enables:\n\n• Proper B2B invoice generation\n• Correct inter/intra state detection\n• Compliance with GST filing requirements\n\nGSTIN format: **22AAAAA0000A1Z5** (15 characters)\nFirst 2 digits = State Code",
    category: "customers",
  },

  // ─── PRODUCTS ─────────────────────────────────────
  {
    keywords: ["add product", "new product", "create product", "product management", "inventory"],
    response: "To add a product:\n\n1. Go to **Products** from the sidebar\n2. Click **\"Add Product\"**\n3. Fill in details:\n   - Name & Description\n   - HSN Code, SKU\n   - Selling Price & Purchase Price\n   - GST Rate (default 18%)\n   - Stock quantity & Low stock alert\n4. Click **Create**\n\nProducts can be selected when creating invoices for quick line item entry.",
    category: "products",
    followUp: ["How to track inventory?", "What is HSN code?"],
  },
  {
    keywords: ["stock", "inventory", "low stock", "stock alert", "out of stock"],
    response: "GST AI tracks your product inventory:\n\n• **Stock** is automatically reduced when invoices are created (except drafts)\n• **Low Stock Alert** — Set a threshold to get alerts on the dashboard\n• Products with stock below the alert level appear in the **Low Stock Alerts** card on your dashboard\n\nYou can update stock manually by editing the product.",
    category: "products",
  },

  // ─── DOCUMENTS ────────────────────────────────────
  {
    keywords: ["document", "quotation", "estimate", "purchase order", "credit note", "debit note", "delivery challan", "proforma"],
    response: "GST AI supports multiple business documents:\n\n📄 **Quotation/Estimate** — Send price quotes to prospects\n📋 **Purchase Order** — Order goods from suppliers\n📑 **Credit Note** — Issue refunds/adjustments\n📑 **Debit Note** — Claim additional amounts\n🚚 **Delivery Challan** — Document goods dispatch\n\nGo to **Documents** in the sidebar to access the document hub.",
    category: "documents",
    followUp: ["How to create a quotation?", "How to create a credit note?"],
  },
  {
    keywords: ["create quotation", "make quotation", "send quote", "estimate"],
    response: "To create a quotation:\n\n1. Go to **Documents** from the sidebar\n2. Click **Quotation / Estimate**\n3. Select customer and add line items\n4. Add terms & conditions\n5. Preview and print/download\n\nQuotations are not invoices — they don't affect your GST calculations.",
    category: "documents",
  },
  {
    keywords: ["credit note", "refund", "adjustment"],
    response: "To create a credit note:\n\n1. Go to **Documents** → **Credit Note**\n2. Reference the original invoice\n3. Specify the reason (defective goods, price adjustment, etc.)\n4. Add adjusted items and amounts\n5. Preview and download\n\nCredit notes reduce your GST liability for the period.",
    category: "documents",
  },

  // ─── REPORTS ──────────────────────────────────────
  {
    keywords: ["report", "analytics", "revenue", "chart", "graph", "insight"],
    response: "The **Reports** page provides:\n\n📊 **Monthly Revenue** — Bar chart of monthly sales trends\n📈 **GST Breakdown** — CGST, SGST, IGST split with pie chart\n🏆 **Top Customers** — Ranked by total revenue\n📦 **Product Performance** — Best-selling products\n⏰ **Pending Payments** — Invoices awaiting payment\n\nGo to **Reports** from the sidebar for detailed analytics.",
    category: "reports",
    followUp: ["How to export reports?", "How to view GST summary?"],
  },
  {
    keywords: ["gst summary", "gst report", "tax summary", "tax report", "gst return", "gstr"],
    response: "The GST Summary on the Reports page shows:\n\n• **Total CGST collected**\n• **Total SGST collected**\n• **Total IGST collected**\n• **Net GST payable**\n• Period-wise breakdown\n\nThis helps you prepare your GST returns (GSTR-1, GSTR-3B). Note: GST AI provides the data — actual filing is done on the GST portal.",
    category: "reports",
  },

  // ─── SETTINGS ─────────────────────────────────────
  {
    keywords: ["setting", "profile", "account", "business setting", "config", "preference"],
    response: "Settings in GST AI:\n\n🏢 **Business** — View/update business name, GSTIN, address\n👤 **Profile** — Your name, email, and role\n🧾 **Invoice** — Invoice prefix and numbering\n👥 **Team** — Role permissions (Admin only)\n\nGo to **Settings** from the sidebar to manage your account.",
    category: "settings",
    followUp: ["How to change invoice prefix?", "What are admin permissions?"],
  },
  {
    keywords: ["admin", "staff", "role", "permission", "team", "access"],
    response: "GST AI has two roles:\n\n🛡️ **Admin** — Full access to all features including settings, team management, and data deletion\n👤 **Staff** — Can create and view invoices, manage customers and products\n\nThe first user who registers becomes the Admin. Team invitation will be available in a future update.",
    category: "settings",
  },

  // ─── NAVIGATION ───────────────────────────────────
  {
    keywords: ["navigate", "where", "find", "how to go", "menu", "sidebar", "page"],
    response: "Quick navigation guide:\n\n🏠 **Dashboard** — Overview & quick actions\n🧾 **Invoices** — Create & manage invoices\n👥 **Customers** — Customer directory\n📦 **Products** — Product catalog & inventory\n📄 **Documents** — Quotations, POs, Credit Notes, etc.\n📊 **Reports** — Analytics & GST summaries\n⚙️ **Settings** — Account & business config\n💬 **AI Assistant** — That's me! Ask anything\n\nUse the sidebar on desktop or the menu icon on mobile.",
    category: "navigation",
  },

  // ─── GENERAL ──────────────────────────────────────
  {
    keywords: ["hello", "hi", "hey", "help", "what can you do", "who are you"],
    response: "Hello! 👋 I'm the **GST AI Assistant**. I can help you with:\n\n• 🧾 Creating and managing invoices\n• 📄 Generating business documents\n• 📊 Understanding reports & analytics\n• 💰 GST calculations & compliance\n• 👥 Customer & product management\n• ⚙️ Platform settings & navigation\n\nJust ask me anything about GST AI!",
    category: "general",
    followUp: ["How to create an invoice?", "What documents can I generate?", "Show me the dashboard"],
  },
  {
    keywords: ["thank", "thanks", "great", "awesome", "perfect", "cool"],
    response: "You're welcome! 😊 Happy to help. Let me know if you have any other questions about GST AI.",
    category: "general",
  },
  {
    keywords: ["print", "download", "pdf", "export"],
    response: "To print or download documents:\n\n1. Open the invoice or document you want to print\n2. Click the **Print** button in the top-right\n3. Your browser's print dialog will open\n4. Choose **Save as PDF** to download, or send to printer\n\nThe print layout is optimized with your company header, item details, and GST breakdown.",
    category: "general",
  },
  {
    keywords: ["payment", "record payment", "receive payment", "payment method"],
    response: "To record a payment against an invoice:\n\n1. Open the invoice detail page\n2. Click **Record Payment**\n3. Enter amount, date, and payment method\n4. Payment methods: Cash, Bank Transfer, UPI, Cheque\n5. Add reference number (transaction ID)\n\nThe invoice status will auto-update based on payment (Paid/Partial).",
    category: "payments",
  },
  {
    keywords: ["expense", "track expense", "business expense"],
    response: "Expense tracking in GST AI:\n\n• Record business expenses with categories (Rent, Salary, Utilities, etc.)\n• Track vendor details and GSTIN\n• Monitor GST on purchases (Input Tax Credit)\n• Categorize by payment method\n\nExpense management helps with GST input credit calculations and financial reporting.",
    category: "expenses",
  },
];

/**
 * Find the best matching response for a user query
 */
export function findBestMatch(query: string): KnowledgeEntry | null {
  const normalizedQuery = query.toLowerCase().trim();

  // Score each entry based on keyword matches
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      // Exact phrase match gets highest score
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(" ").length * 3;
      } else {
        // Check individual word matches
        const keywordWords = normalizedKeyword.split(" ");
        const queryWords = normalizedQuery.split(/\s+/);
        for (const kw of keywordWords) {
          if (queryWords.some((qw) => qw.includes(kw) || kw.includes(qw))) {
            score += 1;
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Minimum score threshold
  return bestScore >= 2 ? bestMatch : null;
}

/**
 * Get suggested quick actions
 */
export function getSuggestedActions(): string[] {
  return [
    "How to create an invoice?",
    "What documents can I generate?",
    "How does GST work?",
    "How to add a customer?",
    "Show me navigation guide",
  ];
}
