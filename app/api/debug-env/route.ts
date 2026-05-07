import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GITHUB_ID: process.env.GITHUB_ID ? "SET" : "MISSING",
    GITHUB_SECRET: process.env.GITHUB_SECRET ? "SET" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "SET" : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT_SET",
    AUTH_URL: process.env.AUTH_URL ?? "NOT_SET",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ?? "NOT_SET",
  });
}
