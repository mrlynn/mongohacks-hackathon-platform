import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    partnerId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      partnerId?: string;
      isImpersonating?: boolean;
      realAdminId?: string;
      realAdminRole?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    partnerId?: string;
  }
}
