"use client";

import { createWebhook } from "./actions";
import { useFormState } from "react-dom";
import { FormButton } from "./form-button";
import { useEffect, useRef } from "react";

const allowedAuthTypes = ["Hookdeck"];

const initialState = {
  message: "",
  success: false,
};

export default function WebhookRegistrationForm({
  userId,
}: {
  userId: string;
}) {
  const [state, formAction] = useFormState(createWebhook, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="flex flex-row gap-6 w-full items-end"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="url">Webhook URL</label>
        <input
          type="url"
          name="url"
          required
          className="text-slate-900 min-w-[550px] rounded-md p-2"
          placeholder="https://example.test/webhooks"
        />
        {state?.errors?.url && (
          <p className="text-red-500">{state.errors.url}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="auth_type">Webhook Authentication</label>
        <select
          name="auth_type"
          className="text-slate-900 rounded-md p-2 border-1"
        >
          {allowedAuthTypes.map((authType) => (
            <option key={authType} value={authType}>
              {authType}
            </option>
          ))}
        </select>
        {state?.errors?.authType && (
          <p className="text-red-500">{state.errors.authType}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input type="hidden" name="user_id" value={userId} />
        <FormButton
          states={["Create", "Creating..."]}
          className="p-2 w-[95px]"
        />
      </div>
      {state?.success === false && (
        <p className="text-red-500">{state.message}</p>
      )}
    </form>
  );
}
