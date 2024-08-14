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
      name: userId,
    });
  }

  return subscriptions;
}

export async function getWebhookEvents({ id }: { id: string }) {
  const events: Hookdeck.Event[] = [];
  const eventResults = await pubsub.getEvents({ subscriptionId: id });

  for (let i = 0; i < eventResults.length; ++i) {
    const event = eventResults[i];
    // Get details with the body
    const eventResult = await hookdeck.event.retrieve(event.id);
    if (eventResult) {
      events.push(eventResult);
    }
  }

  return events;
}

export async function getWebhookAttempts({ eventId }: { eventId: string }) {
  const attempts: Hookdeck.EventAttempt[] = [];
  const attemptsResult = await hookdeck.attempt.list({ eventId });
  for (let i = 0; i < (attemptsResult.count || 0); ++i) {
    const attempt = attemptsResult.models![i];
    if (attempt) {
      // Get details with the body
      const attemptResult = await hookdeck.attempt.retrieve(attempt.id);
      if (attemptResult) {
        attempts.push(attemptResult);
      }
    }
  }

  return attempts;
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
