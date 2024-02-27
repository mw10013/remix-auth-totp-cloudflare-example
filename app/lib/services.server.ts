import { Buffer } from "node:buffer";
import {
  AppLoadContext,
  createWorkersKVSessionStorage,
  SessionStorage,
} from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp";
import * as schema from "~/lib/db/schema";
import { SessionUser, users } from "~/lib/db/schema";
import { sendAuthEmail } from "~/lib/email.server";

export interface ServicesContext {
  env: AppLoadContext["cloudflare"]["env"];
  db: DrizzleD1Database<typeof schema>;
  auth: ReturnType<typeof createAuth>;
}

export function createServices(context: AppLoadContext) {
  console.log("createServices");
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#smart_self-overwriting_lazy_getters
  const servicesContext: ServicesContext = {
    env: context.cloudflare.env,
    get db() {
      console.log("get db() self-overwriting");
      // @ts-expect-error The operand of a 'delete' operator must be optional. ts(2790)
      delete this.db;
      this.db = drizzle(context.cloudflare.env.D1, {
        schema,
        logger: servicesContext.env.ENVIRONMENT !== "production",
      });
      return this.db;
    },
    get auth() {
      console.log("get auth() self-overwriting");
      // @ts-expect-error The operand of a 'delete' operator must be optional. ts(2790)
      delete this.auth;
      this.auth = createAuth(servicesContext);
      return this.auth;
    },
  };
  return servicesContext;
}

export function createAuth({
  env: { SESSION_SECRET, ENVIRONMENT, RESEND_API_KEY, TOTP_SECRET, KV },
  db,
}: ServicesContext) {
  globalThis.Buffer = Buffer;
  const sessionStorage = createWorkersKVSessionStorage<
    {
      "auth:email": string;
    },
    { "auth:error": { message: string } }
  >({
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
  const authenticator = new Authenticator<SessionUser>(
    sessionStorage as SessionStorage,
  );
  authenticator.use(
    new TOTPStrategy(
      {
        secret: TOTP_SECRET,
        magicLinkPath: "/magic-link",
        sendTOTP: async ({ email, code, magicLink }) => {
          console.log("sendTOTP:", { email, code, magicLink });
          if (ENVIRONMENT != "development") {
            await sendAuthEmail({
              email,
              code,
              magicLink,
              resendApiKey: RESEND_API_KEY,
            });
          }
        },
      },
      async ({ email }) => {
        console.log("totps verify callback: email:", email);
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
