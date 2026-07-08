import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteConversationByCid } from "@/lib/messages";

export const runtime = "nodejs";

const deleteSchema = z.object({
  cid: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = deleteSchema.parse(await request.json());
    const deleted = await deleteConversationByCid(body.cid);
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to delete conversation";
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
