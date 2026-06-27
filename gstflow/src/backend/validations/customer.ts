import { z } from "zod";

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .max(200, "Customer name must be 200 characters or less"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  gstin: z
    .string()
    .regex(gstinRegex, "Enter a valid 15-character GSTIN")
    .optional()
    .or(z.literal("")),
  billingAddress: z
    .string()
    .min(5, "Billing address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  shippingAddress: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required").optional().or(z.literal("")),
  state: z.string().min(2, "State is required").optional().or(z.literal("")),
  stateCode: z
    .string()
    .max(2, "State code must be 2 digits")
    .optional()
    .or(z.literal("")),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .optional()
    .or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// Validate GSTIN format (exportable for real-time checks)
export function validateGSTIN(gstin: string): {
  valid: boolean;
  error?: string;
} {
  if (!gstin || gstin.length === 0) return { valid: true };
  if (gstin.length !== 15) return { valid: false, error: "GSTIN must be exactly 15 characters" };
  if (!gstinRegex.test(gstin)) return { valid: false, error: "Invalid GSTIN format" };

  // Verify checksum (basic check: state code must be 01-37)
  const stateCode = parseInt(gstin.substring(0, 2), 10);
  if (stateCode < 1 || stateCode > 37) {
    return { valid: false, error: "Invalid state code in GSTIN" };
  }

  return { valid: true };
}
