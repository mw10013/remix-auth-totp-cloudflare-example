import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { z } from "zod";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp-dev";
import { sendAuthEmail } from "~/lib/email.server";
import { drizzle } from "drizzle-orm/d1";
import { User, totps, users } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export const cloudflareEnvSchema = z.object({
  ENVIRONMENT: z.string().min(1),
  HOST_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  TOTP_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  KV: z.record(z.unknown()).transform((obj) => obj as unknown as KVNamespace),
  DB: z.record(z.unknown()).transform((obj) => obj as unknown as D1Database),
});

export type CloudflareEnv = z.infer<typeof cloudflareEnvSchema>;

export function hookEnv(env: unknown) {
  function assertCloudflareEnv(obj: unknown): asserts obj is CloudflareEnv {
    cloudflareEnvSchema.parse(obj);
  }
  assertCloudflareEnv(env);
  return { env };
}

export function hookAuth({
  SESSION_SECRET,
  ENVIRONMENT,
  RESEND_API_KEY,
  TOTP_SECRET,
  DB,
}: CloudflareEnv) {
  const authSessionStorage = createCookieSessionStorage({
    cookie: {
      name: "_auth",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secrets: [SESSION_SECRET],
      secure: ENVIRONMENT === "production",
    },
  });
  const db = drizzle(DB);
  const authenticator = new Authenticator<User>(authSessionStorage, {
    throwOnError: true,
  });
  authenticator.use(
    new TOTPStrategy(
      {
        secret: TOTP_SECRET,
        magicLinkGeneration: { callbackPath: "/magic-link" },

        storeTOTP: async (data) => {
          console.log("storeTOTP:", data);
          await db.insert(totps).values(data);
        },
        sendTOTP: async ({ email, code, magicLink }) => {
          console.log("sendTOTP:", { email, code, magicLink });
          await sendAuthEmail({
            email,
            code,
            magicLink,
            resendApiKey: RESEND_API_KEY,
          });
        },
        handleTOTP: async (hash, data) => {
          console.log("handleTOTP:", { hash, data });
          const [totp] = await db
            .select()
            .from(totps)
            .where(eq(totps.hash, hash))
            .limit(1);
          invariant(totp, "TOTP not found");
          if (data) {
            const [updatedTotp] = await db
              .update(totps)
              .set(data)
              .where(eq(totps.hash, hash))
              .returning();
            invariant(updatedTotp, "TOTP update not found");
            return updatedTotp;
          }
          return totp;
        },
      },
      async ({ email }) => {
        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            [user] = await db.insert(users).values({ email }).returning();
            if (!user) throw new Error("Unable to create user.");
        }
        return user;
      },
    ),
  );
  return { authenticator };
}
