import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  hsnCode: z.string().optional().or(z.literal("")),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  gstRate: z.number().min(0).max(28),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional().or(z.literal("")),
  placeOfSupply: z.string().optional().or(z.literal("")),
  reverseCharge: z.boolean().default(false),
  notes: z.string().optional().or(z.literal("")),
  status: z
    .enum(["DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"])
    .default("DRAFT"),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const INVOICE_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  { value: "SENT", label: "Sent", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "PAID", label: "Paid", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "PARTIAL", label: "Partial", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "OVERDUE", label: "Overdue", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
] as const;
