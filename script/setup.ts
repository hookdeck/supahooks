import { HookdeckClient } from "@hookdeck/sdk";
import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

if (!process.env.HOOKDECK_API_KEY) {
  console.error("Missing HOOKDECK_API_KEY");
  process.exit(1);
}
if (!process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY) {
  console.error("Missing HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY");
  process.exit(1);
}

const log = (...args: any[]) => {
  console.log.apply(console, args);
  console.log();
};

const setup = async () => {
  const hookdeckClient = new HookdeckClient({
    token: process.env.HOOKDECK_API_KEY!,
  });
  const devConnection = await hookdeckClient.connection.upsert({
    source: {
      name: "product-change-webhook",
      verification: {
        type: "api_key",
        configs: {
          headerKey: "x-supabase-api-key",
          apiKey: process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY!,
        },
      },
    },
    destination: {
      name: "cli-product-change-webhook",
      cliPath: "/api/webhooks/product-change",
    },
  });
  log(
    "Created/updated Hookdeck connection for local development",
    devConnection.id
  );

  const schemaTemplatePath = path.join(
    projectDir,
    "supabase",
    "templates",
    "schema.sql"
  );
  log(`Reading schema template from ${schemaTemplatePath}`);
  let schema = fs.readFileSync(schemaTemplatePath, "utf-8");

  log(
    "Replacing HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY and HOOKDECK_PRODUCT_UPDATE_WEBHOOK_URL"
  );
  schema = schema.replace(
    "{{HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY}}",
    process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY!
  );
  schema = schema.replace(
    "{{HOOKDECK_PRODUCT_UPDATE_WEBHOOK_URL}}",
    process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_URL!
  );

  const finalSchemaPath = path.join(projectDir, "supabase", "schema.sql");
  log(`Writing schema to ${finalSchemaPath}`);
  fs.writeFileSync(finalSchemaPath, schema);
};

setup();
