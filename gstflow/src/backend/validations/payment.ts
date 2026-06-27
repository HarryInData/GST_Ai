import { z } from "zod";

export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "UPI", label: "UPI" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARD", label: "Card" },
] as const;

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Payment date is required"),
  method: z.string().default("CASH"),
  reference: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
