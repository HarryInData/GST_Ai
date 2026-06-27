"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/backend/db/prisma";
import { signIn } from "@/backend/auth/auth";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  onboardingSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type OnboardingInput,
} from "@/backend/validations/auth";
import { AuthError } from "next-auth";

// ─── LOGIN ──────────────────────────────────────────────

export async function loginAction(values: LoginInput) {
  try {
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { email: rawEmail, password } = validatedFields.data;
    const email = rawEmail.toLowerCase().trim(); // Normalize email

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (signInError) {
      if (signInError instanceof AuthError) {
        switch (signInError.type) {
          case "CredentialsSignin":
            return { error: "Invalid email or password" };
          default:
            console.error("Sign-in error:", signInError);
            return { error: "Authentication failed. Please try again." };
        }
      }
      console.error("Unexpected sign-in error:", signInError);
      return { error: "Authentication failed. Please try again." };
    }

    // Check if user has an organization (onboarding completed)
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { organizationId: true },
      });

      if (!user?.organizationId) {
        return { success: true, redirect: "/onboarding" };
      }

      return { success: true, redirect: "/dashboard" };
    } catch (dbError) {
      console.error("Database error checking user organization:", dbError);
      return { error: "Failed to retrieve user information." };
    }
  } catch (error) {
    console.error("Unexpected error in loginAction:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// ─── REGISTER ───────────────────────────────────────────

export async function registerAction(values: RegisterInput) {
  try {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { name, email: rawEmail, password } = validatedFields.data;
    const email = rawEmail.toLowerCase().trim(); // Normalize email

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return { error: "An account with this email already exists" };
      }
    } catch (dbError) {
      console.error("Database error checking existing user:", dbError);
      return { error: "Database error. Please try again later." };
    }

    let hashedPassword: string;
    try {
      // Hash password
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return { error: "Error processing password. Please try again." };
    }

    try {
      // Create user with ADMIN role (first user of an org)
      await prisma.user.create({
        data: {
          name: name.trim(),
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });
    } catch (createError) {
      console.error("User creation error:", createError);
      return { error: "Failed to create account. Please try again." };
    }

    // Auto sign in (optional - disable for now)
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      return { success: true, redirect: "/onboarding" };
    } catch (signInError) {
      console.warn("Automatic sign-in failed after registration:", signInError);
      // Account created successfully, user can login manually
      return {
        success: true,
        redirect: "/login",
        message: "Account created! Please log in.",
      };
    }
  } catch (error) {
    console.error("Unexpected error in registerAction:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

// ─── FORGOT PASSWORD ────────────────────────────────────

export async function forgotPasswordAction(values: ForgotPasswordInput) {
  const validatedFields = forgotPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email" };
  }

  const { email } = validatedFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal whether email exists
    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  }

  // Generate reset token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  // Delete existing tokens
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // TODO: Send email with reset link
  // For now, log the token (remove in production)
  console.log(`Password reset token for ${email}: ${token}`);
  console.log(
    `Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
  );

  return {
    success: true,
    message:
      "If an account exists with this email, you will receive a password reset link.",
  };
}

// ─── ONBOARDING (BUSINESS PROFILE SETUP) ────────────────

export async function onboardingAction(
  userId: string,
  values: OnboardingInput,
) {
  const validatedFields = onboardingSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields. Please check your inputs." };
  }

  const {
    businessName,
    gstin,
    address,
    city,
    state,
    stateCode,
    pincode,
    phone,
    email,
    invoicePrefix,
  } = validatedFields.data;

  try {
    // Check if GSTIN already exists
    if (gstin) {
      const existingOrg = await prisma.organization.findUnique({
        where: { gstin },
      });
      if (existingOrg) {
        return { error: "An organization with this GSTIN already exists" };
      }
    }

    // Create organization and link to user
    const organization = await prisma.organization.create({
      data: {
        name: businessName,
        gstin: gstin || null,
        address,
        city,
        state,
        stateCode,
        pincode,
        phone: phone || null,
        email: email || null,
        invoicePrefix,
        users: {
          connect: { id: userId },
        },
      },
    });

    return { success: true, organizationId: organization.id };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Failed to set up business profile. Please try again." };
  }
}
