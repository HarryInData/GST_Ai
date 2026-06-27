import { auth } from "@/backend/auth/auth";
import { format } from "date-fns";

/**
 * Get the organization ID from the current session.
 * Throws if not authenticated or no org.
 */
export async function getOrganizationId(): Promise<string> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  if (!session.user.organizationId) {
    throw new Error("No organization found. Please complete onboarding.");
  }
  return session.user.organizationId;
}

/**
 * Get the current user session with organization ID.
 */
export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  return session;
}

/**
 * Format a date consistently across the app
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export function formatDateForInput(date?: Date | string | null): string {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Generate a formatted invoice number from prefix and sequence
 * e.g., "INV", 1 → "INV-0001"
 */
export function generateInvoiceNumber(prefix: string, nextNo: number): string {
  return `${prefix}-${String(nextNo).padStart(4, "0")}`;
}
