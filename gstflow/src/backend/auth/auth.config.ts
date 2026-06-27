import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      try {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
        const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");
        const isOnAuth =
          nextUrl.pathname.startsWith("/login") ||
          nextUrl.pathname.startsWith("/register") ||
          nextUrl.pathname.startsWith("/forgot-password");

        if (isOnDashboard || isOnOnboarding) {
          if (isLoggedIn) return true;
          return false; // Redirect to login
        }

        if (isOnAuth && isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      } catch (error) {
        console.error("Error in authorized callback:", error);
        return false;
      }
    },
    jwt({ token, user }) {
      try {
        if (user) {
          token.role = user.role || "STAFF";
          token.organizationId = user.organizationId || null;
        }
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },
    session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.sub || "";
          session.user.role = (token.role as string) || "STAFF";
          session.user.organizationId =
            (token.organizationId as string | null) || null;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig;
