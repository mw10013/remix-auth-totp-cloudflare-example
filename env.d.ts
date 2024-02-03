/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />

import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: {
      KV: KVNamespace;
      D1: D1Database;
    };
  }
}
