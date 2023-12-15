-- https://stackoverflow.com/questions/21547616/how-do-i-completely-clear-a-sqlite3-database-without-deleting-the-database-file
-- These commands will not work on D1 local and remote through wrangler.
PRAGMA writable_schema = 1;

DELETE FROM sqlite_master;

PRAGMA writable_schema = 0;

VACUUM;

PRAGMA integrity_check;

