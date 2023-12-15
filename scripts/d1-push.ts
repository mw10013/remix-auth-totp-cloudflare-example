import { $, glob } from "zx";

/**
 * Push schema to the local d1 database in .wrangler.
 * This will only work locally.
 * Push seems to delete the _cf_KV and d1_migrations tables.
 * wrangler d1 migrations list [database_name] --local
 * seems to restore them, but push and migrations are not compatible.
 */

const sqliteFiles = await glob("./.wrangler/**/*.sqlite");
console.log({ sqliteFiles });

if (sqliteFiles.length !== 1) {
  console.error("Expected exactly one sqlite file under .wrangler");
  process.exit(1);
}

await $`drizzle-kit push:sqlite --schema=./app/lib/db/schema.ts --driver=better-sqlite --url=${sqliteFiles[0]} --verbose`;
