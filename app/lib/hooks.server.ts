import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { z } from "zod";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp-dev";

export const cloudflareEnvSchema = z.object({
  ENVIRONMENT: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  //   KV: z.record(z.unknown()).transform((obj) => obj as unknown as KVNamespace),
  //   DB: z.record(z.unknown()).transform((obj) => obj as unknown as D1Database),
  // SMN_R2: z.record(z.unknown()).transform((obj) => obj as unknown as R2Bucket),
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

export function hookAuth(env: CloudflareEnv) {
  const authSessionStorage = createCookieSessionStorage({
    cookie: {
      name: "_auth",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secrets: [env.SESSION_SECRET],
      secure: env.ENVIRONMENT === "production",
    },
  });
  const authenticator = new Authenticator<User>(authSessionStorage, {
    throwOnError: true,
  });
  authenticator.use(
    new TOTPStrategy(
      {
        secret: "SECRET",
        magicLinkGeneration: { callbackPath: "/magic-link" },

        storeTOTP: async (data) => {
          console.log("storeTOTP:", data);
        },
        sendTOTP: async ({ email, code, magicLink }) => {
          console.log("sendTOTP:", { email, code, magicLink });
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
