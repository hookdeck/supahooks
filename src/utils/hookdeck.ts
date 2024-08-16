import { WebhookSubscription } from "@/types";
import { Hookdeck, HookdeckClient } from "@hookdeck/sdk";
import { ConnectionUpsertRequest } from "@hookdeck/sdk/api";

const hookdeckClient = new HookdeckClient({
  token: process.env.HOOKDECK_API_KEY!,
});

const hookdeck = new HookdeckClient({ token: process.env.HOOKDECK_API_KEY! });

/**
 * Creates a new webhook subscription by creating a Hookdeck Connection with a Source and Destination.
 *
 * The Hookdeck Source has a URL and authentication and is used for publishing events via Hookdeck.
 *
 * The Hookdeck Destination represents the webhook endpoint, used for receiving events.
 */
export async function createWebhookSubscription({
  id,
  webhookUrl,
  webhookSecret,
}: {
  id: string;
  webhookUrl: string;
  webhookSecret: string;
}) {
  const b64Url = btoa(webhookUrl).replace(/=/g, "_");
  const uniqueSubcriptionName = `${id}__${b64Url}`;

  console.debug(
    "Subscribing: " + JSON.stringify({ uniqueSubcriptionName, webhookUrl })
  );

  const request: ConnectionUpsertRequest = {
    name: `conn_${uniqueSubcriptionName}_${b64Url}`,
    source: {
      name: `src_${uniqueSubcriptionName}`,
    },
    destination: {
      url: webhookUrl,
      name: `dst_${uniqueSubcriptionName}`,
      authMethod: {
        type: "CUSTOM_SIGNATURE",
        config: {
          key: "x-webhook-signature",
          signingSecret: webhookSecret,
        },
      },
    },
  };

  // Workaround as this should be allowed to be undefined
  if (request.destination?.authMethod === undefined) {
    delete request.destination?.authMethod;
  }

  const connection = await hookdeckClient.connection.upsert(request);

  return {
    connection,
  };
}
/**
 * Gets all the webhook subscriptions, represented by Hookdeck Connections,
 * associated with a Hookdeck user.
 */
export async function getWebhookSubscriptions({
  userId,
  id,
}: {
  userId: string;
  id?: string;
}): Promise<WebhookSubscription[]> {
  const connections = await hookdeckClient.connection.list({
    id,
    fullName: userId || undefined, // fuzzy match
  });
  const subscriptions: WebhookSubscription[] = [];

  if (connections.models) {
    connections.models.forEach((connection) => {
      if (connection.destination.url === undefined) {
        console.warn(
          `Skipping connection "${connection.destination.name}" with undefined destination URL`
        );
      } else {
        subscriptions.push({
          connection,
        });
      }
    });
  }

  return subscriptions;
}

/**
 * Gets all the webhook events associated with a Hookdeck connection.
 */
export async function getWebhookEvents({ id }: { id: string }) {
  let events: Hookdeck.Event[] = [];
  const _events = await hookdeckClient.event.list({
    webhookId: id,
  });

  if (_events !== undefined && _events.models !== undefined) {
    events = _events.models;
    for (let i = 0; i < events.length; ++i) {
      // Get details with the body
      events[i] = await hookdeckClient.event.retrieve(events[i].id);
    }
  }

  return events;
}

/**
 * Gets all the webhook delivery attempts associated with a Hookdeck event.
 */
export async function getWebhookAttempts({ eventId }: { eventId: string }) {
  const attempts: Hookdeck.EventAttempt[] = [];
  const attemptsResult = await hookdeckClient.attempt.list({ eventId });
  if (
    attemptsResult.models !== undefined &&
    attemptsResult.count !== undefined
  ) {
    for (let i = 0; i < attemptsResult.count; ++i) {
      let attempt = attemptsResult.models[i];
      if (attempt) {
        // Get details with the body
        attempt = await hookdeckClient.attempt.retrieve(attempt.id);
      }
      if (attempt) {
        attempts.push(attempt);
      }
    }
  }

  return attempts;
}

/**
 * Publishes a webhook with the payload and headers provided.
 *
 * Looks up the underlying Hookdeck Connection, identified by the subscriptionId, and find the URL of the
 * Hookdeck Source to publish the event to. This is done to make use of the Hookdeck infrastructure and features
 * such as authenticating the publish request, rate limiting, retries, and logging.
 *
 * Requests to the Source URL are authenticated with the `x-webhooks-demo-api-key` header with the value being
 * the `PUBLISH_KEY` environment variable.
 */
export async function publishWebhookEvent({
  subscriptionId,
  body,
  headers = {},
}: {
  subscriptionId: string;
  body: unknown;
  headers?: Record<string, string>;
}) {
  const subscriptions = await getWebhookSubscriptions({
    id: subscriptionId,
    userId: "",
  });
  if (subscriptions.length !== 1) {
    throw new Error(
      `Unexpected number of subscriptions found. Expected 1 and got ${subscriptions.length}.`
    );
  }

  const subscription = subscriptions[0];

  const eventHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
    "x-webhooks-demo-api-key": process.env.PUBLISH_KEY!,
  };

  const fetchOptions: RequestInit = {
    method: "POST",
    headers: eventHeaders,
    body: JSON.stringify(body),
  };

  console.debug("Source request: " + JSON.stringify(fetchOptions));
  console.debug("With event: " + JSON.stringify(body));

  const response = await fetch(
    subscription.connection.source.url,
    fetchOptions
  );

  return response;
}

/**
 * Deleting the subscription deletes the underlying Hookdeck Connection and its
 * consituent parts, the Source and Destination.
 */
export async function deleteWebhookSubscription({ id }: { id: string }) {
  console.debug("Unsubscribing: " + JSON.stringify({ id }));

  const connection = await hookdeckClient.connection.retrieve(id);
  await hookdeckClient.connection.delete(id);
  await hookdeckClient.source.delete(connection.source.id);
  await hookdeckClient.destination.delete(connection.destination.id);
}
