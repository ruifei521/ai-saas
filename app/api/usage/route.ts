import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUsageInfo } from "@/lib/usage";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = await getUsageInfo(session.user.id);
  return NextResponse.json(info);
}
