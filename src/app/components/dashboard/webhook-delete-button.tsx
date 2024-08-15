"use client";

import { deleteWebhook } from "../../dashboard/actions";
import { FormButton } from "./form-button";
import { useFormState } from "react-dom";
import { useState } from "react";
import { WebhookSubscription } from "@/types";

import { FaRegTrashCan } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";

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
          className={`button p-2 w-[80px]`}
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </button>
      )}
      {confirmDelete && (
        <>
          <FormButton
            className="bg-red-600 w-[35px]"
            states={[
              <FaRegTrashCan
                key={`trash_${subscription.connection.id}`}
                className="inline"
              />,
              "...",
            ]}
          />
          <button
            className={`button w-[35px]`}
            onClick={() => setConfirmDelete(false)}
          >
            <FaUndo className="inline" />
          </button>
        </>
      )}
      {!state.success && <p>{state.message}</p>}
      {state.errors && state.errors.id && <p>{state.errors.id.join(", ")}</p>}
    </form>
  );
}
