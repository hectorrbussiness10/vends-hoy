import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const env = parseEnv(readFileSync(join(root, ".env.local"), "utf8"));
const dbUrl = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
if (!dbUrl) throw new Error("Missing POSTGRES_URL");
const statements = [
  `create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
)`,
  `create index if not exists login_events_created_at_idx on public.login_events (created_at desc)`,
  `create index if not exists login_events_profile_id_idx on public.login_events (profile_id)`,
  `alter table public.login_events enable row level security`,
];
const stmtFile = join(root, "supabase", ".temp", "stmt.sql");
for (const statement of statements) {
  writeFileSync(stmtFile, `${statement};\n`);
  try {
    execFileSync("npx", ["supabase", "db", "query", "--db-url", dbUrl, "-f", stmtFile, "--yes"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
  } catch (err) {
    const detail = String(err.stderr || err.stdout || err.message).replace(/:[^:@/\s]+@/g, ":***@");
    if (!/already exists/i.test(detail)) throw new Error(detail.slice(0, 400));
  }
}
try {
  unlinkSync(stmtFile);
} catch {
  /* ignore */
}
process.stdout.write("login_events ready\n");
