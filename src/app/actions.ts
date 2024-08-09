"use server";

import { HookdeckPubSub, SubscriberAuth } from "@hookdeck/pubsub";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createWebhookSchema = z.object({
  url: z.string().url(),
  authType: z.enum(["Hookdeck"]),
});

const pubsub = new HookdeckPubSub({
  apiKey: process.env.HOOKDECK_API_KEY!,
});

export async function createWebhook(prevState: any, formData: FormData) {
  "use server";

  const username = formData.get("username") as string;
  const webhookUrl = formData.get("url") as string;
  const authType = formData.get("auth_type") as string;

  const validatedFields = createWebhookSchema.safeParse({
    url: webhookUrl,
    authType,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  let webhookUrlAuth: SubscriberAuth | undefined = undefined;
  switch (authType) {
    case "Hookdeck":
      // by leaving webhookUrlAuth undefined, we are using the default Hookdeck authentication
      // For some reason, setting triggers a 500 server error
      // webhookUrlAuth = {
      //   type: "HOOKDECK_SIGNATURE",
      // };
      break;
  }

  try {
    await pubsub.subscribe({
      channelName: `${username}__${btoa(webhookUrl).replace(/=/g, "_")}`,
      url: webhookUrl,
      auth: webhookUrlAuth,
    });
  } catch (error) {
    return {
      success: false,
      message: "Could not create webhook",
    };
  }

  revalidatePath(`/dashboard/${username}`);
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
