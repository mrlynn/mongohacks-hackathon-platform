import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectToDatabase();
        const user = await UserModel.findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Store the real admin identity
        (session.user as unknown as { role: string }).role =
          token.role as string;
        (session.user as unknown as { id: string }).id = token.id as string;

        // Check for impersonation cookie
        try {
          const cookieStore = await cookies();
          const impersonateUserId = cookieStore.get("impersonate_user_id")?.value;

          if (impersonateUserId && (token.role === "admin" || token.role === "super_admin")) {
            await connectToDatabase();
            const impersonatedUser = await UserModel.findById(impersonateUserId)
              .select("-passwordHash")
              .lean();

            if (impersonatedUser) {
              // Swap session to impersonated user, but keep admin info
              (session.user as unknown as { id: string }).id =
                impersonatedUser._id.toString();
              session.user.name = impersonatedUser.name;
              session.user.email = impersonatedUser.email;
              (session.user as unknown as { role: string }).role =
                impersonatedUser.role;
              // Flag that this is an impersonated session
              (session.user as unknown as { isImpersonating: boolean }).isImpersonating = true;
              (session.user as unknown as { realAdminId: string }).realAdminId =
                token.id as string;
            }
          }
        } catch {
          // If cookies() fails (e.g., in non-request context), skip impersonation
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
