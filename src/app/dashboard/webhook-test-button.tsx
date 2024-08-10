"use client";

import { triggerTestWebhook } from "./actions";
import { Subscription } from "@hookdeck/pubsub";
import { FormButton } from "./form-button";

export default function WebHookTestButton({
  subscription,
}: {
  subscription: Subscription;
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
