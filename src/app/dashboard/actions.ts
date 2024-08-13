"use server";

import {
  createWebhookSubscription,
  deleteWebhookSubscription,
} from "@/utils/hookdeck";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createWebhookSchema = z.object({
  url: z.string().url(),
});

const deleteWebhookSchema = z.object({
  id: z.string(),
});

export async function createWebhook(prevState: any, formData: FormData) {
  "use server";

  const userId = formData.get("user_id") as string;
  const webhookUrl = formData.get("url") as string;

  const validatedFields = createWebhookSchema.safeParse({
    url: webhookUrl,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const account = await supabase
    .from("accounts")
    .select("webhook_secret")
    .single();
  if (account.error) {
    return {
      success: false,
      message: "Account not found",
    };
  }

  try {
    await createWebhookSubscription({
      id: userId,
      webhookUrl,
      webhookSecret: account.data.webhook_secret,
    });
  } catch (error) {
    return {
      success: false,
      message: "Could not create webhook",
    };
  }

  revalidatePath(`/dashboard`);
  return {
    success: true,
    message: "",
  };
}

export async function deleteWebhook(prevState: any, formData: FormData) {
  "use server";

  const subscriptionId = formData.get("id") as string;

  const validatedFields = deleteWebhookSchema.safeParse({
    id: subscriptionId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await deleteWebhookSubscription({ id: subscriptionId });
  } catch (error) {
    return {
      success: false,
      message: "Could not delete webhook",
    };
  }

  revalidatePath(`/dashboard`);
  return {
    success: true,
    message: "",
  };
}

export async function triggerTestWebhook(formData: FormData) {
  "use server";

  const url = formData.get("url") as string;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      test: "data",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
