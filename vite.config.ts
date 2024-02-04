import {
  unstable_cloudflarePreset as cloudflare,
  unstable_vitePlugin as remix,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      // crypto: "crypto-browserify",
      // stream: "node:stream",
      // events: "node:events",
      // crypto: "node:crypto",
    },
  },
  plugins: [
    remix({
      presets: [cloudflare()],
    }),
    tsconfigPaths(),
  ],
  ssr: {
    // noExternal: ["remix-auth-totp-dev"],
    // noExternal: ["remix-auth-totp-dev", "cipher-base", "readable-stream", "cipher-base@1.0.4"],
    // noExternal: true,
    // external: ["node:stream", "node:events"],
    resolve: {
      externalConditions: ["workerd", "worker"],
    },
  },
});
