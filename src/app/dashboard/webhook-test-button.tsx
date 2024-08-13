"use client";

import { WebhookSubscription } from "@/types";
import { triggerTestWebhook } from "./actions";
import { FormButton } from "./form-button";

export default function WebhookTestButton({
  subscription,
}: {
  subscription: WebhookSubscription;
}) {
  return (
    <form action={triggerTestWebhook}>
      <input
        type="hidden"
        name="url"
        value={subscription.connection.source.url}
      />
      <FormButton states={["Test", "Testing..."]} />
    </form>
  );
}
