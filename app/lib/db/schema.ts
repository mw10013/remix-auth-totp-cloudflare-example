import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// model Totp {
//     id        String   @id @default(uuid())
//     createdAt DateTime @default(now())

//     hash     String  @unique
//     attempts Int     @default(0)
//     active   Boolean @default(true)
//   }

//   model User {
//     id    String @unique @default(uuid())
//     email String @unique

//     createdAt DateTime? @default(now())
//     updatedAt DateTime? @updatedAt
//   }

export const totps = sqliteTable("totps", {
  id: text("id").primaryKey().$default(nanoid),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  hash: text("hash").notNull().unique(),
  attempts: integer("attempts").notNull().default(0),
  active: integer("id", { mode: "boolean" }).notNull().default(true),
});

export type Totp = typeof totps.$inferSelect;
export type InsertTotp = typeof totps.$inferInsert;

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$default(nanoid),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
