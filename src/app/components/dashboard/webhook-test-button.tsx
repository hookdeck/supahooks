"use client";

import { WebhookSubscription } from "@/types";
import { triggerTestWebhook } from "../../dashboard/actions";
import { FormButton, FormButtonPropsStates } from "./form-button";
import { useFormState } from "react-dom";

import { MdError } from "react-icons/md";
import { useCallback } from "react";

export default function WebhookTestButton({
  className,
  buttonStates = ["Test", "Testing..."],
  subscription,
  headers,
  body,
  disabled = false,
}: {
  className?: string;
  buttonStates?: FormButtonPropsStates;
  subscription: WebhookSubscription;
  headers: Record<string, string>;
  body: unknown;
  disabled?: boolean;
}) {
  const [state, formAction] = useFormState(triggerTestWebhook, null);
  const getErrorMessage = useCallback(() => {
    if (state) {
      if (state.errors) {
        return Object.values(state.errors)
          .map((error) => error.toString())
          .join(",");
      }
      if (state.success === false) {
        return state.message;
      }
      return undefined;
    }
  }, [state]);
  const errorMsg = getErrorMessage();

  let formButtonStates: FormButtonPropsStates = buttonStates;
  if (errorMsg !== undefined) {
    formButtonStates = [
      <MdError key={subscription.connection.id} className="inline" />,
      "Retrying...",
    ];
  }

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="subscription_id"
        value={subscription.connection.id}
      />
      <input type="hidden" name="headers" value={JSON.stringify(headers)} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />
      <FormButton
        states={formButtonStates}
        className={`${className}`}
        title={errorMsg}
        disabled={disabled}
      />
    </form>
  );
}
