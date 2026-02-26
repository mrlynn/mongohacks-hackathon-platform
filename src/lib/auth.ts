import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { sendEmail } from "@/lib/email/email-service";
import { twoFactorCodeEmail } from "@/lib/email/templates";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      id: "credentials",
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
        }).select("+twoFactorCode +twoFactorExpiry");

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // If 2FA is enabled, generate and send code instead of signing in
        if (user.twoFactorEnabled) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const hashedCode = crypto
            .createHash("sha256")
            .update(code)
            .digest("hex");

          user.twoFactorCode = hashedCode;
          user.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
          await user.save();

          const template = twoFactorCodeEmail(user.name, code);
          sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          }).catch(() => {});

          // Return null to prevent sign-in; client checks 2FA status separately
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
    Credentials({
      id: "magic-link",
      name: "magic-link",
      credentials: {
        token: { type: "text" },
        email: { type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !credentials?.email) {
          return null;
        }

        await connectToDatabase();
        const hashedToken = crypto
          .createHash("sha256")
          .update(credentials.token as string)
          .digest("hex");

        const user = await UserModel.findOne({
          email: (credentials.email as string).toLowerCase(),
        }).select("+magicLinkToken +magicLinkExpiry");

        if (!user || !user.magicLinkToken || !user.magicLinkExpiry) {
          return null;
        }

        if (user.magicLinkToken !== hashedToken) {
          return null;
        }

        if (user.magicLinkExpiry < new Date()) {
          return null;
        }

        // Clear the token
        user.magicLinkToken = undefined;
        user.magicLinkExpiry = undefined;
        await user.save();

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
        // NextAuth v5 uses 'sub' as the standard user ID field
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Store the real admin identity
        (session.user as unknown as { role: string }).role =
          token.role as string;
        (session.user as unknown as { id: string }).id = (token.id || token.sub) as string;

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
              // Preserve real admin role so guards remain functional while impersonating
              (session.user as unknown as { realAdminRole: string }).realAdminRole =
                token.role as string;
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
