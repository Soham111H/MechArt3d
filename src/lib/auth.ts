// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const isGoogleConfigured =
  !!process.env.GOOGLE_CLIENT_ID &&
  !process.env.GOOGLE_CLIENT_ID.includes("placeholder") &&
  !!process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_SECRET.includes("placeholder");

const AUTH_SECRET = process.env.AUTH_SECRET;

if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
    throw new Error('AUTH_SECRET is required and must be at least 32 characters long. Please generate one using `openssl rand -hex 32`');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────
    ...(isGoogleConfigured
      ? [
          Google({
            clientId:     process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                prompt:        "select_account",
                access_type:   "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),

    // ── Email + Password ──────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const emailStr    = (credentials.email as string).toLowerCase().trim();
        const passwordStr = credentials.password as string;

        // ── Brute-force lockout check ──────────────────────────────────
        const { getLockStatus, recordFailedAttempt, resetAttempts, formatLockExpiry } = await import("@/lib/security/brute-force");
        const lockStatus = await getLockStatus(emailStr);

        if (lockStatus.locked && lockStatus.lockedUntil) {
          throw new Error(formatLockExpiry(lockStatus.lockedUntil));
        }

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email: emailStr } });
        } catch {
          throw new Error("Database connection failed. Please try again.");
        }

        if (!user) {
          // Still record attempt for non-existent accounts (prevents enumeration)
          await recordFailedAttempt(emailStr);
          throw new Error("Invalid email or password");
        }
        if (!user.passwordHash) {
          throw new Error("This account uses Google Sign-In. Please use the Google button.");
        }

        // bcrypt.compare uses constant-time comparison internally
        const isValid = await bcrypt.compare(passwordStr, user.passwordHash);

        if (!isValid) {
          const status = await recordFailedAttempt(emailStr);
          // Log to LoginHistory
          try {
            await prisma.loginHistory.create({
              data: {
                userId: user.id,
                status: status.locked ? "BLOCKED" : "FAILED_PWD",
                ip: null,
                device: null,
              }
            });
          } catch { /* non-fatal */ }

          if (status.locked && status.lockedUntil) {
            throw new Error(formatLockExpiry(status.lockedUntil));
          }
          throw new Error("Invalid email or password");
        }

        // ── Successful login — reset attempts ──────────────────────────
        await resetAttempts(emailStr);

        return {
          id:    user.id,
          email: user.email,
          name:  user.name  ?? "",
          image: user.avatar ?? null,
          role:  user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * REAL-WORLD Google Account Linking Flow:
     *
     * Case 1 — New Google user (no existing account):
     *   → Adapter creates user + account → sign in normally ✅
     *
     * Case 2 — Google email matches existing Google-linked account:
     *   → Sign in normally ✅
     *
     * Case 3 — Google email matches existing email/password account (NOT yet linked):
     *   → Store pending link token → redirect to /auth/link-account
     *   → User enters their password to CONFIRM they own the account
     *   → On success: Google account gets linked → sign in ✅
     *   This matches GitHub, GitLab, Notion behavior.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      try {
        const existingUser = await prisma.user.findUnique({
          where:   { email: user.email! },
          include: { accounts: { where: { provider: "google" } } },
        });

        if (!existingUser) {
          // Case 1: Completely new user — let adapter handle creation
          (user as any).role = "USER";
          return true;
        }

        if (existingUser.accounts.length > 0) {
          // Case 2: Google already linked — normal sign-in
          (user as any).role = existingUser.role;
          (user as any).id   = existingUser.id;
          return true;
        }

        // Case 3: Email exists but Google NOT yet linked
        // → Store Google account data temporarily, redirect to link page
        const pendingToken = crypto.randomBytes(32).toString("hex");

        // Delete any previous pending link for this email
        await prisma.otpCode.deleteMany({
          where: { identifier: user.email!, type: "GOOGLE_LINK_PENDING" },
        });

        // Save pending link data (token + google account info)
        await prisma.otpCode.create({
          data: {
            identifier: user.email!,
            codeHash:   JSON.stringify({
              token:             pendingToken,
              providerAccountId: account.providerAccountId,
              access_token:      account.access_token  ?? null,
              refresh_token:     account.refresh_token ?? null,
              expires_at:        account.expires_at    ?? null,
              token_type:        account.token_type    ?? null,
              scope:             account.scope         ?? null,
              id_token:          account.id_token      ?? null,
              googleName:        user.name             ?? null,
              googleImage:       user.image            ?? null,
            }),
            type:      "GOOGLE_LINK_PENDING",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
          },
        });

        // Redirect to link-account page
        return `/auth/link-account?token=${pendingToken}&email=${encodeURIComponent(user.email!)}`;
      } catch (err) {
        console.error("[auth] Google signIn callback error:", err);
        return true; // fail-open: don't lock user out
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id     = (user as any).id ?? user.id;
        token.role   = (user as any).role ?? "USER";
        token.avatar = (user as any).avatar ?? null;
      }
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { role: true, avatar: true, name: true, email: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.avatar = dbUser.avatar;
            token.name = dbUser.name;
            token.email = dbUser.email;
          }
        } catch { /* keep cached */ }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id     = token.id as string;
        session.user.role   = token.role as string;
        (session.user as any).avatar = token.avatar as string | null;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        await prisma.loginHistory.create({
          data: { userId: user.id, status: "SUCCESS" },
        });
      } catch (err) {
        console.warn("[auth] Login history write failed:", (err as Error).message);
      }
    },
  },

  debug: false,
});
