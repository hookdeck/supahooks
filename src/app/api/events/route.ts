import { getWebhookEvents } from "@/utils/hookdeck";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const connectionId = request.nextUrl.searchParams.get("id");
  if (connectionId === null) {
    return Response.json({ error: "Missing connection ID" }, { status: 400 });
  }
  const events = await getWebhookEvents({ id: connectionId });
  return Response.json(events);
}
