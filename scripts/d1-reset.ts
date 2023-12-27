import { $, glob } from "zx";

/**
 * Reset the local d1 database in .wrangler and apply migrations.
 * This will only work locally
 */

const sqliteFiles = await glob("./.wrangler/**/*.sqlite");
console.log({ sqliteFiles });

if (sqliteFiles.length !== 1) {
  console.error("Expected exactly one sqlite file under .wrangler");
  process.exit(1);
}

await $`sqlite3 ${sqliteFiles[0]} < scripts/reset-sqlite.sql`;
await $`wrangler d1 migrations apply ratce-d1-dev --local`;
await $`sqlite3 ${sqliteFiles[0]} "pragma table_list;"`;
