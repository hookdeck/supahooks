"use server";

import { stripWebhookHeaders } from "@/utils";
import {
  createWebhookSubscription,
  deleteWebhookSubscription,
  publishWebhookEvent,
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

const testTriggerWebhookSchema = z.object({
  subscription_id: z.string(),
  headers: z.string(),
  body: z.string(),
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
    console.error("Error deleting webhook", error);

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

export async function triggerTestWebhook(prevState: any, formData: FormData) {
  "use server";

  const subscriptionId = formData.get("subscription_id") as string;
  const headers = formData.get("headers") as string;
  const body = formData.get("body") as string;

  const validatedFields = testTriggerWebhookSchema.safeParse({
    subscription_id: subscriptionId,
    headers,
    body,
  });

  if (!validatedFields.success) {
    console.error(
      "Error validating in triggerTestWebhook",
      validatedFields.error.flatten().fieldErrors
    );
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const headersObj = JSON.parse(headers) as Record<string, string>;
  const allowedHeaders = stripWebhookHeaders(headersObj);

  console.log("Triggering webhook", subscriptionId, allowedHeaders, body);
  const bodyObj = JSON.parse(body);

  const response = await publishWebhookEvent({
    subscriptionId,
    body: bodyObj,
    headers: allowedHeaders,
  });

  if (response.ok) {
    return {
      success: true,
      message: "Webhook triggered successfully",
    };
  } else {
    console.error("Error triggering webhook", response);
    return {
      success: false,
      message: "Could not trigger webhook",
    };
  }
}
