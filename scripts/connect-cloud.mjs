import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    let value = line.slice(eq + 1);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, eq)] = value;
  }
  return out;
}

function serializeLocal(map, original) {
  const keys = new Set([...Object.keys(parseEnv(original)), ...Object.keys(map)]);
  let next = original;
  for (const key of keys) {
    if (!(key in map)) continue;
    const line = `${key}=${map[key]}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(next)) next = next.replace(re, line);
    else next = next.replace(/\s*$/, `\n${line}\n`);
  }
  return next.endsWith("\n") ? next : `${next}\n`;
}

const pulled = parseEnv(readFileSync(join(root, ".env.vercel.tmp"), "utf8"));
const localPath = join(root, ".env.local");
const localText = readFileSync(localPath, "utf8");
const local = parseEnv(localText);
const keep = new Set(["NEXT_PUBLIC_APP_URL", "APP_SECRET", "AI_GATEWAY_API_KEY", "VERCEL_TOKEN", "OPENAI_API_KEY", "GITHUB_TOKEN"]);
const merged = { ...local };
for (const [key, value] of Object.entries(pulled)) {
  if (!value) continue;
  if (keep.has(key) && local[key]) continue;
  if (!merged[key]) merged[key] = value;
}
writeFileSync(localPath, serializeLocal(merged, localText));

const dbUrl = pulled.POSTGRES_URL_NON_POOLING || pulled.POSTGRES_URL;
if (!dbUrl) throw new Error("Missing POSTGRES_URL");

function redact(text) {
  return String(text)
    .replace(dbUrl, "[db]")
    .replace(/:[^:@/\s]+@/g, ":***@")
    .replace(/postgres\.[a-z0-9]+:[^@\s]+/gi, "postgres.[redacted]");
}

const schema = readFileSync(join(root, "supabase", "schema.sql"), "utf8");
const statements = schema
  .split(";")
  .map((chunk) =>
    chunk
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim(),
  )
  .filter(Boolean);

const stmtFile = join(root, "supabase", ".temp", "stmt.sql");
let applied = 0;
for (const statement of statements) {
  writeFileSync(stmtFile, `${statement};\n`);
  try {
    execFileSync("npx", ["supabase", "db", "query", "--db-url", dbUrl, "-f", stmtFile, "--yes"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    applied += 1;
  } catch (err) {
    const detail = redact(`${err.stderr || ""}\n${err.stdout || ""}\n${err.message || ""}`);
    if (/already exists/i.test(detail)) {
      applied += 1;
      continue;
    }
    throw new Error(`SQL failed (${applied}/${statements.length}): ${detail.slice(0, 400)}`);
  }
}
try {
  unlinkSync(stmtFile);
} catch {
  /* ignore */
}

const stripe = new Stripe(pulled.STRIPE_SECRET_KEY);
const existing = await stripe.products.list({ limit: 20 });
let product = existing.data.find((item) => item.name === "Vends Hoy");
if (!product) {
  product = await stripe.products.create({
    name: "Vends Hoy",
    description: "Web de negocio: 150 euros al mes",
  });
}
const prices = await stripe.prices.list({ product: product.id, limit: 20 });
let price = prices.data.find((item) => item.recurring?.interval === "month" && item.unit_amount === 15000 && item.currency === "eur");
if (!price) {
  price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: 15000,
    recurring: { interval: "month" },
  });
}

const hooks = await stripe.webhookEndpoints.list({ limit: 20 });
const hookUrl = "https://vends-hoy.vercel.app/api/billing/webhook";
let hook = hooks.data.find((item) => item.url === hookUrl);
let webhookSecret = "";
if (!hook) {
  hook = await stripe.webhookEndpoints.create({
    url: hookUrl,
    enabled_events: ["checkout.session.completed", "customer.subscription.deleted"],
  });
  webhookSecret = hook.secret || "";
}

const idsPath = join(root, ".stripe-ids.tmp");
writeFileSync(
  idsPath,
  `STRIPE_PRICE_ID=${price.id}\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}\nSTRIPE_PRODUCT_ID=${product.id}\n`,
);

const localAfter = readFileSync(localPath, "utf8");
const localMap = parseEnv(localAfter);
localMap.STRIPE_PRICE_ID = price.id;
if (webhookSecret) localMap.STRIPE_WEBHOOK_SECRET = webhookSecret;
writeFileSync(localPath, serializeLocal(localMap, localAfter));

process.stdout.write(
  JSON.stringify({
    ok: true,
    supabaseUrlSet: Boolean(pulled.NEXT_PUBLIC_SUPABASE_URL),
    sqlStatements: applied,
    stripePriceId: price.id,
    stripeProductId: product.id,
    webhookCreated: Boolean(webhookSecret),
    webhookExists: Boolean(hook),
  }) + "\n",
);
