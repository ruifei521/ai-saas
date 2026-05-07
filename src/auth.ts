import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GitHubProvider from "next-auth/providers/github";

// Debug: log env var availability at module load time
console.log("[auth] GITHUB_ID:", process.env.GITHUB_ID ? "SET" : "MISSING");
console.log("[auth] GITHUB_SECRET:", process.env.GITHUB_SECRET ? "SET" : "MISSING");
console.log("[auth] AUTH_SECRET:", process.env.AUTH_SECRET ? "SET" : "MISSING");
console.log("[auth] NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "MISSING");
console.log("[auth] DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // TEMP: Disable PrismaAdapter to isolate Configuration error
  // adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  debug: true,
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

// Re-export types for use elsewhere
export type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null };