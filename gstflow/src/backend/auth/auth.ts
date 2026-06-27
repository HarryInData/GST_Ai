import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/backend/db/prisma";
import { authConfig } from "@/backend/auth/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn("Missing email or password in credentials");
            return null;
          }

          const email = (credentials.email as string).toLowerCase().trim();
          const password = credentials.password as string;

          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email },
            });
          } catch (dbError) {
            console.error("Database error in authorize callback:", dbError);
            return null;
          }

          if (!user || !user.password) {
            console.warn(`User not found or has no password: ${email}`);
            return null;
          }

          let passwordMatch = false;
          try {
            passwordMatch = await bcrypt.compare(password, user.password);
          } catch (bcryptError) {
            console.error("Password comparison error:", bcryptError);
            return null;
          }

          if (!passwordMatch) {
            console.warn(`Password mismatch for user: ${email}`);
            return null;
          }

          return {
            id: user.id,
            name: user.name || null,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId || null,
          };
        } catch (error) {
          console.error("Unexpected error in authorize callback:", error);
          return null;
        }
      },
    }),
  ],
});
