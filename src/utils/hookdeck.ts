import { WebhookSubscription } from "@/types";
import { HookdeckPubSub } from "@hookdeck/pubsub";

const pubsub = new HookdeckPubSub({
  apiKey: process.env.HOOKDECK_API_KEY!,
});

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
}: {
  userId: string;
}): Promise<WebhookSubscription[]> {
  let subscriptions = await pubsub.getSubscriptions({
    name: userId,
  });

  return subscriptions;
}

export async function deleteWebhookSubscription({ id }: { id: string }) {
  const pubsub = new HookdeckPubSub({
    apiKey: process.env.HOOKDECK_API_KEY!,
  });

  await pubsub.unsubscribe({ id });
}
