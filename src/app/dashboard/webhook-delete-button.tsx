"use client";

import { deleteWebhook } from "./actions";
import { FormButton } from "./form-button";
import { useFormState } from "react-dom";
import { useState } from "react";
import { WebhookSubscription } from "@/types";

const initialState = {
  message: "",
  success: false,
};

export default function WebhookDeleteButton({
  subscription,
}: {
  subscription: WebhookSubscription;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, formAction] = useFormState(deleteWebhook, initialState);

  return (
    <form action={formAction} className="flex flex-row gap-2">
      <input type="hidden" name="id" value={subscription.connection.id} />
      {!confirmDelete && (
        <button
          className={`bg-slate-700 p-1 rounded-md cursor-pointer h-full w-[80px]`}
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </button>
      )}
      {confirmDelete && (
        <FormButton
          states={["Confirm", "Deleting..."]}
          className="bg-red-600"
        />
      )}
      {!state.success && <p>{state.message}</p>}
      {state.errors && state.errors.id && <p>{state.errors.id.join(", ")}</p>}
    </form>
  );
}
