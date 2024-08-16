import { getWebhookSubscriptions, publishWebhookEvent } from "@/utils/hookdeck";
import { verifyWebhookSignature } from "@hookdeck/sdk/webhooks/helpers";

type ProductChange = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: ProductRecord;
  schema: string;
  old_record?: ProductRecord | null;
};
type ProductRecord = {
  id: number;
  price: number;
  title: string;
  owner_id: string;
  created_at: string;
  description: string;
  stock_count: number;
};

export async function POST(request: Request) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const rawBody = await request.text();
  try {
    console.debug("=============================>");
    const result = await verifyWebhookSignature({
      headers,
      rawBody,
      signingSecret: process.env.HOOKDECK_SIGNING_SECRET!,
      config: {
        checkSourceVerification: true,
      },
    });

    if (!result.isValidSignature) {
      return Response.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (e) {
    console.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.error(e);
  }

  console.debug("xxxxxxxxxxxxxxxxxxxxxxxx");

  const change = JSON.parse(rawBody) as ProductChange;

  const sendEvent = {
    // Change type to an event type and remove schema
    type: `product.${change.type.toLowerCase()}`,
    record: {
      // Remove owner_id
      id: change.record.id,
      price: change.record.price,
      title: change.record.title,
      created_at: change.record.created_at,
      description: change.record.description,
      stock_count: change.record.stock_count,
    },
    // Remove owner_id from old_record if a record is set
    old_record: change.old_record
      ? {
          id: change.old_record.id,
          price: change.old_record.price,
          title: change.old_record.title,
          created_at: change.old_record.created_at,
          description: change.old_record.description,
          stock_count: change.old_record.stock_count,
        }
      : null,
  };

  const ownerUserId = change.record.owner_id;
  const subscriptions = await getWebhookSubscriptions({ userId: ownerUserId });
  subscriptions.forEach(async (subscription) => {
    await publishWebhookEvent({
      subscriptionId: subscription.connection.id,
      body: sendEvent,
    });
  });

  return Response.json({ success: true, publishCount: subscriptions.length });
}
