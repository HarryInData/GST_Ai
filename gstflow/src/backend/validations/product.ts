import { z } from "zod";

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const PRODUCT_UNITS = [
  "NOS",
  "KG",
  "GM",
  "LTR",
  "ML",
  "MTR",
  "CM",
  "SQM",
  "BOX",
  "PKT",
  "SET",
  "PCS",
  "HRS",
  "DAYS",
] as const;

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be 200 characters or less"),
  description: z.string().optional().or(z.literal("")),
  hsnCode: z
    .string()
    .min(4, "HSN code must be at least 4 digits")
    .max(8, "HSN code must be at most 8 digits")
    .regex(/^[0-9]+$/, "HSN code must contain only numbers")
    .optional()
    .or(z.literal("")),
  sku: z.string().optional().or(z.literal("")),
  unit: z.string().default("NOS"),
  price: z
    .number()
    .min(0, "Price must be positive"),
  purchasePrice: z
    .number()
    .min(0, "Purchase price must be positive")
    .optional()
    .default(0),
  gstRate: z
    .number()
    .refine((v) => [0, 5, 12, 18, 28].includes(v), "Invalid GST rate"),
  stock: z.number().int("Stock must be a whole number").min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
