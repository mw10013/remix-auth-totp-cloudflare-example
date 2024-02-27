import { $, glob } from "zx";

/**
 * Reset the local d1 database violently.
 * Run any migrations.
 */

await $`rm -rf ./.wrangler`;

// Create db.
// await $`pnpm wrangler d1 execute local-d1-dev --local --command "select datetime('now');"`;
// https://github.com/cloudflare/workers-sdk/issues/5092
await $`pnpm wrangler d1 execute local-d1-dev --local --command "pragma foreign_keys = ON;"`;

const migrationFiles = await glob("./drizzle/*.sql");
console.log({ migrationFiles });
if (migrationFiles.length > 0) {
  await $`wrangler d1 migrations apply local-d1-dev --local`;
  // await $`pnpm d1:seed`;
}

const sqliteFiles = await glob("./.wrangler/**/*.sqlite");
console.log({ sqliteFiles });
if (sqliteFiles.length !== 1) {
  console.error("Expected exactly one sqlite file under .wrangler");
  process.exit(1);
}

const statements = `
.schema
pragma table_list`;
await $`echo ${statements} | sqlite3 ${sqliteFiles[0]}`;

console.log(`sqlite3 ${sqliteFiles[0]}`);
