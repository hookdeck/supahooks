import { randomBytes } from "crypto";
import { createClient } from "./supabase/server";

/**
 * Generates a cryptographically secure webhook secret.
 * @param length The length of the secret in bytes (default is 32 bytes).
 * @returns A hexadecimal string representing the webhook secret.
 */
export function generateWebhookSecret(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

export async function checkAccountsTable() {
  let result: { error: null | string; data: null | any } = {
    error: null,
    data: null,
  };

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { error: "User not found" };
  }

  const account = await supabase
    .from("accounts")
    .select("*")
    .eq("owner_id", data.user.id)
    .limit(1)
    .single();

  console.log("No account exists for user", data.user.id, ". Creating one...");

  if (!account.data) {
    const webhookSecret = generateWebhookSecret();
    const accountInsert = await supabase
      .from("accounts")
      .insert({ owner_id: data.user.id, webhook_secret: webhookSecret });

    if (accountInsert.error === null) {
      result.data = result.data;
    } else {
      console.error("Error inserting account", accountInsert.error);
      result.error = "Error creating account";
    }
  }

  return result;
}
