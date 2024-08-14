import { getWebhookAttempts } from "@/utils/hookdeck";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("id");
  if (eventId === null) {
    return Response.json({ error: "Missing event ID" }, { status: 400 });
  }
  const events = await getWebhookAttempts({ eventId });
  return Response.json(events);
}
