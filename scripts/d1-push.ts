import { $, glob } from "zx";

/**
 * Push schema to the local d1 database.
 */

// Ensure db created.
await $`pnpm wrangler d1 execute local-d1-dev --local --command "select datetime('now');"`;

const sqliteFiles = await glob("./.wrangler/**/*.sqlite");
console.log({ sqliteFiles });

if (sqliteFiles.length !== 1) {
  console.error("Expected exactly one sqlite file under .wrangler");
  process.exit(1);
}

// Pull to get kv and migration tables.
await $`pnpm drizzle-kit introspect:sqlite --out=./.tmp/drizzle-pull --driver=better-sqlite --url=${sqliteFiles[0]}`;

// d1-push-schema contains app schema along with kv and migrations tables.
await $`pnpm drizzle-kit push:sqlite --schema=./scripts/d1-push-schema.ts --driver=better-sqlite --url=${sqliteFiles[0]} --verbose --strict`;
