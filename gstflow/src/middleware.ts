import NextAuth from "next-auth";
import { authConfig } from "@/backend/auth/auth.config";

// Use only the edge-compatible config for middleware
// This avoids importing Prisma (which requires Node.js runtime)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
