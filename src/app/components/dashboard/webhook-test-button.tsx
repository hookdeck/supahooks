"use client";

import { WebhookSubscription } from "@/types";
import { triggerTestWebhook } from "../../dashboard/actions";
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
        name="subscription_id"
        value={subscription.connection.id}
      />
      <input type="hidden" name="headers" value={JSON.stringify({})} />
      <input
        type="hidden"
        name="body"
        value={JSON.stringify({ example: "data" })}
      />
      <FormButton states={["Test", "Testing..."]} className=" w-[80px]" />
    </form>
  );
}
