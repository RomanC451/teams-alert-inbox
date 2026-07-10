import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendTeamsReply } from "@/lib/gmail-smtp";
import { insertOutgoingMessage, isDuplicateOfLastMessage } from "@/lib/messages";
import { generateOutgoingMid } from "@/lib/parse-alert";

export const runtime = "nodejs";

const replySchema = z.object({
  to: z.string().email(),
  cid: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = replySchema.parse(await request.json());

    if (await isDuplicateOfLastMessage(body.cid, body.message)) {
      return NextResponse.json({ ok: true, skipped: true, reason: "duplicate" });
    }

    await sendTeamsReply(body.to, body.cid, body.message);

    const alert = await insertOutgoingMessage({
      mid: generateOutgoingMid(),
      cid: body.cid,
      senderName: "You",
      senderEmail: process.env.GMAIL_USER ?? "",
      chat: "",
      message: body.message,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, alert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to send reply";
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
