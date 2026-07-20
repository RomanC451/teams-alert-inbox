import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getHaEntityState,
  getMouseJigglerEntityId,
  setHaSwitch,
} from "@/lib/home-assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const setSchema = z.object({
  on: z.boolean(),
});

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const entityId = getMouseJigglerEntityId();
    const state = await getHaEntityState(entityId);
    return NextResponse.json({
      entityId,
      on: state.state === "on",
      state: state.state,
      name: state.friendlyName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read mouse jiggler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = setSchema.parse(await request.json());
    const entityId = getMouseJigglerEntityId();
    const result = await setHaSwitch(entityId, body.on);
    return NextResponse.json({
      entityId,
      on: result.state === "on",
      state: result.state,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to set mouse jiggler";
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
