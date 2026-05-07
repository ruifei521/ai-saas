import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: DB connection
  try {
    const userCount = await prisma.user.count();
    results.dbTest = "OK";
    results.userCount = userCount;
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    results.dbTest = "FAILED";
    results.dbError = e.message;
    results.dbStack = e.stack?.substring(0, 500);
  }

  // Test 2: Check env vars that matter for auth
  results.GITHUB_ID = process.env.GITHUB_ID ? process.env.GITHUB_ID.substring(0, 8) + "..." : "MISSING";
  results.GITHUB_SECRET = process.env.GITHUB_SECRET ? "SET(len=" + process.env.GITHUB_SECRET.length + ")" : "MISSING";
  results.AUTH_SECRET = process.env.AUTH_SECRET ? "SET(len=" + process.env.AUTH_SECRET.length + ")" : "MISSING";
  results.DATABASE_URL = process.env.DATABASE_URL ? "SET(len=" + process.env.DATABASE_URL.length + ")" : "MISSING";

  // Test 3: Try NextAuth initialization manually
  try {
    const { Auth } = await import("@auth/core");
    const GitHub = (await import("@auth/core/providers/github")).default;
    const { PrismaAdapter } = await import("@auth/prisma-adapter");

    const config = {
      trustHost: true,
      secret: process.env.AUTH_SECRET,
      adapter: PrismaAdapter(prisma),
      providers: [GitHub({
        clientId: process.env.GITHUB_ID || "",
        clientSecret: process.env.GITHUB_SECRET || "",
      })],
      basePath: "/api/auth",
    };

    // Create a mock request for signin/github
    const request = new Request("https://ai-saas-two-neon.vercel.app/api/auth/signin/github");
    
    const response = await Auth(request, config as any);
    results.authStatus = response.status;
    results.authHeaders = Object.fromEntries(response.headers.entries());
    const body = await response.text();
    results.authBody = body.substring(0, 500);
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    results.authTest = "FAILED";
    results.authError = e.message;
    results.authStack = e.stack?.substring(0, 800);
  }

  return NextResponse.json(results);
}
