import { WebhookSubscription } from "@/types";
import { HookdeckPubSub } from "@hookdeck/pubsub";
import { Hookdeck, HookdeckClient } from "@hookdeck/sdk";

const pubsub = new HookdeckPubSub({
  apiKey: process.env.HOOKDECK_API_KEY!,
  publishAuth: {
    type: "api_key",
    configs: {
      apiKey: process.env.PUBLISH_KEY!,
      headerKey: "x-webhooks-demo-api-key",
    },
  },
});

const hookdeck = new HookdeckClient({ token: process.env.HOOKDECK_API_KEY! });

export async function createWebhookSubscription({
  id,
  webhookUrl,
  webhookSecret,
}: {
  id: string;
  webhookUrl: string;
  webhookSecret: string;
}) {
  const subscription = await pubsub.subscribe({
    channelName: `${id}__${btoa(webhookUrl).replace(/=/g, "_")}`,
    url: webhookUrl,
    auth: {
      type: "CUSTOM_SIGNATURE",
      config: {
        key: "x-webhook-signature",
        signingSecret: webhookSecret,
      },
    },
  });

  return subscription;
}

export async function getWebhookSubscriptions({
  userId,
  id,
}: {
  userId: string;
  id?: string;
}): Promise<WebhookSubscription[]> {
  let subscriptions;

  // id identifies a specific connection in Hookdeck so the userId can be ignored
  if (id !== undefined) {
    subscriptions = await pubsub.getSubscriptions({
      subscriptionId: id,
    });
  } else {
    subscriptions = await pubsub.getSubscriptions({
      channelName: userId,
    });
  }

  return subscriptions;
}

export async function getWebhookEvents({ id }: { id: string }) {
  return await pubsub.getEvents({ subscriptionId: id, includeBody: true });
}

export async function getWebhookAttempts({ eventId }: { eventId: string }) {
  return pubsub.getDeliveryAttempts({ eventId, includeBody: true });
}

export async function publishWebhookEvent({
  subscriptionId,
  type,
  body,
  headers,
}: {
  subscriptionId: string;
  type: string;
  body: unknown;
  headers: Record<string, string>;
}) {
  const subscriptions = await pubsub.getSubscriptions({ subscriptionId });
  if (subscriptions.length !== 1) {
    throw new Error(
      `Unexpected number of subscriptions found. Expected 1 and got ${subscriptions.length}.`
    );
  }

  const subscription = subscriptions[0];
  const channel = await pubsub.channel({ name: subscription.channelName });

  const response = await channel.publish({
    type,
    headers,
    data: body,
  });

  return response;
}

export async function deleteWebhookSubscription({ id }: { id: string }) {
  await pubsub.unsubscribe({ id });
}
