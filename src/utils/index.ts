import { randomBytes } from "crypto";

/**
 * Generates a cryptographically secure webhook secret.
 * @param length The length of the secret in bytes (default is 32 bytes).
 * @returns A hexadecimal string representing the webhook secret.
 */
export function generateWebhookSecret(length: number = 32): string {
  return `sec_${randomBytes(length).toString("hex")}`;
}

const STRIP_HEADER_MATCHES = [
  "x-hookdeck-",
  "content-length",
  "x-webhooks-demo-api-key",
];

export function stripWebhookHeaders(headers: Record<string, string>) {
  const allowedHeaders: Record<string, string> = {};
  for (const header in headers) {
    if (
      !STRIP_HEADER_MATCHES.some(
        (stripMatch) => header.indexOf(stripMatch) !== -1
      )
    ) {
      allowedHeaders[header] = headers[header];
    }
  }
  return allowedHeaders;
}
