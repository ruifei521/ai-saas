import { NextResponse } from "next/server";

export async function GET() {
  const nextauthUrl = process.env.NEXTAUTH_URL ?? "NOT_SET";
  const authUrl = process.env.AUTH_URL ?? "NOT_SET";
  const githubId = process.env.GITHUB_ID ?? "NOT_SET";
  const authSecret = process.env.AUTH_SECRET ?? "NOT_SET";
  
  // Check for hidden characters
  const nextauthUrlChars = nextauthUrl !== "NOT_SET" ? Array.from(nextauthUrl).map(c => c.charCodeAt(0)) : [];
  const githubIdChars = githubId !== "NOT_SET" ? Array.from(githubId).slice(0, 20).map(c => c.charCodeAt(0)) : [];
  
  // Try URL parsing
  let urlParseResult = "NOT_TESTED";
  if (nextauthUrl !== "NOT_SET") {
    try {
      const u = new URL(nextauthUrl);
      urlParseResult = `OK: origin=${u.origin} href=${u.href}`;
    } catch (e) {
      const err = e as Error;
      urlParseResult = `ERROR: ${err.message}`;
    }
  }
  
  return NextResponse.json({
    GITHUB_ID_SET: !!process.env.GITHUB_ID,
    GITHUB_SECRET_SET: !!process.env.GITHUB_SECRET,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    NEXTAUTH_URL,
    AUTH_URL,
    nextauthUrlChars,
    githubIdChars,
    urlParseResult,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ?? "NOT_SET",
  });
}
