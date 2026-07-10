import { NextRequest, NextResponse } from "next/server";
import { listMessages } from "@/lib/messages";
import { syncAlertsFromImap } from "@/lib/sync-alerts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sync = request.nextUrl.searchParams.get("sync") === "1";
    const synced = sync ? await syncAlertsFromImap(50) : 0;
    const alerts = await listMessages(500);
    return NextResponse.json({ alerts, synced });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.APP_PASSWORD;
  if (!secret) return true;

  const header = request.headers.get("x-app-password");
  const cookie = request.cookies.get("app_password")?.value;
  return header === secret || cookie === secret;
}
