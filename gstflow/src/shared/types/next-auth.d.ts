import { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: string;
  organizationId: string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: string;
    organizationId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    organizationId?: string | null;
  }
}
