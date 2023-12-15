import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { z } from "zod";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp-dev";
import { sendAuthEmail } from "~/lib/email.server";

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

interface User {
  id: string;
  email: string;
  //   createdAt: Date | null;
  //   updatedAt: Date | null;
}

export function hookAuth({SESSION_SECRET, ENVIRONMENT, RESEND_API_KEY,TOTP_SECRET, DB}: CloudflareEnv) {
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
        //   await prisma.totp.create({ data });
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
          return {
            hash,
            attempts: 0,
            active: true,
            expiresAt: new Date(Date.now() + 60 * 1000),
          };
        },
      },
      async ({ email }) => {
        return {
          id: "userid789",
          email,
        };
      },
    ),
  );
  return { authenticator };
}
