import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { z } from "zod";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp";
import { sendAuthEmail } from "~/lib/email.server";
import { drizzle } from "drizzle-orm/d1";
import { User, totps, users } from "~/lib/db/schema";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export const cloudflareEnvSchema = z.object({
  ENVIRONMENT: z.string().min(1),
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
  KV,
  DB,
}: CloudflareEnv) {
  const sessionStorage = createCookieSessionStorage({
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
  const authenticator = new Authenticator<User>(sessionStorage, {
    throwOnError: true,
  });
  const period = 120; // number of seconds the TOTP will be valid.
  authenticator.use(
    new TOTPStrategy(
      {
        secret: TOTP_SECRET,
        magicLinkGeneration: { callbackPath: "/magic-link" },
        customErrors: {
          // invalidTotp: "Expired TOTP code",
        },
        totpGeneration: {
          period,
        },

        storeTOTP: async (data) => {
          console.log("storeTOTP:", data);
          await KV.put(`totp:${data.hash}`, JSON.stringify(data), {
            expirationTtl: period,
          });
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
          const totpJson = await KV.get(`totp:${hash}`);
          if (!totpJson) return null;
          const totp = JSON.parse(totpJson);
          if (data) {
            const list = await KV.list({ prefix: `totp:${hash}` });
            if (list.keys.length === 1 && list.keys[0].expiration) {
              const updatedTotp = { ...totp, ...data };
              console.log("updatedTotp:", updatedTotp);
              console.log("key:", list.keys[0]);
              const now = Math.floor(Date.now() / 1000);
              await KV.put(`totp:${hash}`, JSON.stringify(updatedTotp), {
                expirationTtl: Math.max(list.keys[0].expiration - now, 60), // >= 60 seconds
              });
              return updatedTotp;
            }
            return null;
          }
          console.log("totp:", totp);
          return totp;
        },
      },
      async ({ email }) => {
        console.log("totps verify callback: email:", email);
        let [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) {
          [user] = await db.insert(users).values({ email }).returning();
          if (!user) throw new Error("Unable to create user.");
        }
        return user;
      },
    ),
  );
  return {
    authenticator,
    getSession: sessionStorage.getSession,
    commitSession: sessionStorage.commitSession,
    destroySession: sessionStorage.destroySession,
  };
}
