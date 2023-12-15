import { z } from "zod";

export const cloudflareEnvSchema = z.object({
  ENVIRONMENT: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),
  //   KV: z.record(z.unknown()).transform((obj) => obj as unknown as KVNamespace),
  //   DB: z.record(z.unknown()).transform((obj) => obj as unknown as D1Database),
  // SMN_R2: z.record(z.unknown()).transform((obj) => obj as unknown as R2Bucket),
});

export type CloudflareEnv = z.infer<typeof cloudflareEnvSchema>;

export function hookCloudflareEnv(env: unknown) {
  function assertCloudflareEnv(obj: unknown): asserts obj is CloudflareEnv {
    cloudflareEnvSchema.parse(obj);
  }
  assertCloudflareEnv(env);
  return env;
}

