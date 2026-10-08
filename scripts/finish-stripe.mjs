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
  let next = original;
  for (const [key, value] of Object.entries(map)) {
    if (!value) continue;
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(next)) next = next.replace(re, line);
    else next = next.replace(/\s*$/, `\n${line}\n`);
  }
  return next.endsWith("\n") ? next : `${next}\n`;
}

const pulled = parseEnv(readFileSync(join(root, ".env.vercel.tmp"), "utf8"));
const local = parseEnv(readFileSync(join(root, ".env.local"), "utf8"));
const secret = pulled.STRIPE_SECRET_KEY || local.STRIPE_SECRET_KEY;
if (!secret || secret === "[SENSITIVE]") {
  throw new Error("STRIPE_SECRET_KEY missing from pulled env");
}

const prefix = secret.slice(0, 7);
const live = secret.startsWith("sk_live");
const stripe = new Stripe(secret);
const account = await stripe.accounts.retrieve();

const productName = "Ideia Builders";
const existing = await stripe.products.list({ limit: 30 });
let product = existing.data.find((item) => item.name === productName || item.name === "Vends Hoy");
if (!product) {
  product = await stripe.products.create({
    name: productName,
    description: "Web de negocio: 150 euros al mes",
  });
} else if (product.name !== productName) {
  product = await stripe.products.update(product.id, { name: productName });
}

const prices = await stripe.prices.list({ product: product.id, limit: 30 });
let price = prices.data.find(
  (item) => item.recurring?.interval === "month" && item.unit_amount === 15000 && item.currency === "eur" && item.active,
);
if (!price) {
  price = await stripe.prices.create({
    product: product.id,
    currency: "eur",
    unit_amount: 15000,
    recurring: { interval: "month" },
  });
}

const hookUrl = "https://www.ideia.builders/api/billing/webhook";
const hooks = await stripe.webhookEndpoints.list({ limit: 30 });
const leftovers = [
  "https://vends-hoy.vercel.app/api/billing/webhook",
  "https://ideia.builders/api/billing/webhook",
];
let hook = hooks.data.find((item) => item.url === hookUrl);
let webhookSecret = "";
if (!hook) {
  hook = await stripe.webhookEndpoints.create({
    url: hookUrl,
    enabled_events: ["checkout.session.completed", "customer.subscription.deleted", "invoice.paid", "customer.subscription.updated"],
  });
  webhookSecret = hook.secret || "";
}

for (const url of leftovers) {
  const old = hooks.data.find((item) => item.url === url);
  if (old) await stripe.webhookEndpoints.del(old.id);
}

const localPath = join(root, ".env.local");
const localText = readFileSync(localPath, "utf8");
const patch = {
  STRIPE_SECRET_KEY: secret,
  STRIPE_PRICE_ID: price.id,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pulled.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || pulled.STRIPE_PUBLISHABLE_KEY || local.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};
if (pulled.STRIPE_PUBLISHABLE_KEY) patch.STRIPE_PUBLISHABLE_KEY = pulled.STRIPE_PUBLISHABLE_KEY;
if (webhookSecret) patch.STRIPE_WEBHOOK_SECRET = webhookSecret;
writeFileSync(localPath, serializeLocal(patch, localText));

writeFileSync(
  join(root, ".stripe-ids.tmp"),
  `STRIPE_PRICE_ID=${price.id}\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}\n`,
);

process.stdout.write(
  JSON.stringify({
    ok: true,
    keyPrefix: prefix,
    live,
    chargesEnabled: Boolean(account.charges_enabled),
    payoutsEnabled: Boolean(account.payouts_enabled),
    country: account.country,
    defaultCurrency: account.default_currency,
    productId: product.id,
    priceId: price.id,
    webhookCreated: Boolean(webhookSecret),
    webhookUrl: hook.url,
    webhookStatus: hook.status,
  }) + "\n",
);
