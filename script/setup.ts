import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

if (!process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY) {
  console.error("Missing HOOKDECK_PRODUCT_UPDATE_WEBHOOK_KEY");
  process.exit(1);
}
if (!process.env.HOOKDECK_PRODUCT_UPDATE_WEBHOOK_URL) {
  console.error("Missing HOOKDECK_PRODUCT_UPDATE_WEBHOOK_URL");
  process.exit(1);
}

const schemaTemplatePath = path.join(
  projectDir,
  "supabase",
  "templates",
  "schema.sql"
);
console.log(`Reading schema template from ${schemaTemplatePath}`);
let schema = fs.readFileSync(schemaTemplatePath, "utf-8");

console.log(
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
console.log(`Writing schema to ${finalSchemaPath}`);
fs.writeFileSync(finalSchemaPath, schema);
