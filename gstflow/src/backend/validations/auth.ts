import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Enter a valid 15-character GSTIN"
    )
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  stateCode: z
    .string()
    .min(1, "State code is required")
    .max(2, "State code must be 2 digits"),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  invoicePrefix: z
    .string()
    .min(1, "Invoice prefix is required")
    .max(10, "Invoice prefix must be 10 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and hyphens"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
