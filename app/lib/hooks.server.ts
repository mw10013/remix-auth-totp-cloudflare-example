import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import { z } from "zod";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp";
import { sendAuthEmail } from "~/lib/email.server";
import { drizzle } from "drizzle-orm/d1";
import { SessionUser, users } from "~/lib/db/schema";
import { eq } from "drizzle-orm";

export const cloudflareEnvSchema = z.object({
  ENVIRONMENT: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  TOTP_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  KV: z.record(z.unknown()).transform((obj) => obj as unknown as KVNamespace),
  D1: z.record(z.unknown()).transform((obj) => obj as unknown as D1Database),
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
  D1,
}: CloudflareEnv) {
  const sessionStorage = createWorkersKVSessionStorage({
    kv: KV,
    cookie: {
      name: "_auth",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secrets: [SESSION_SECRET],
      secure: ENVIRONMENT === "production",
    },
  });
  const authenticator = new Authenticator<SessionUser>(sessionStorage, {
    throwOnError: true,
  });
  authenticator.use(
    new TOTPStrategy(
      {
        secret: TOTP_SECRET,
        magicLinkGeneration: { callbackPath: "/magic-link" },

        createTOTP: async (data, expiresAt) => {
          console.log("createTOTP:", { data, expiresAt });
          await KV.put(`totp:${data.hash}`, JSON.stringify(data), {
            expirationTtl: Math.max(
              (expiresAt.getTime() - Date.now()) / 1000,
              60,
            ), // >= 60 secs per Cloudflare KV
          });
        },
        readTOTP: async (hash) => {
          console.log("readTOTP:", hash);
          const totpJson = await KV.get(`totp:${hash}`);
          return totpJson ? JSON.parse(totpJson) : null;
        },
        updateTOTP: async (hash, data, expiresAt) => {
          console.log("updateTOTP:", { hash, data, expiresAt });
          const totpJson = await KV.get(`totp:${hash}`);
          if (!totpJson) throw new Error("TOTP not found");
          const totp = JSON.parse(totpJson);
          await KV.put(`totp:${hash}`, JSON.stringify({ ...totp, ...data }), {
            expirationTtl: Math.max(
              (expiresAt.getTime() - Date.now()) / 1000,
              60,
            ), // >= 60 secs per Cloudflare KV
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
      },
      async ({ email }) => {
        console.log("totps verify callback: email:", email);
        const db = drizzle(D1);
        let [user] = await db
          .select({ id: users.id, email: users.email })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        if (!user) {
          [user] = await db
            .insert(users)
            .values({ email })
            .returning({ id: users.id, email: users.email });
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
