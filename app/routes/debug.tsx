import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { hookAuth, hookEnv } from "~/lib/hooks.server";
import { users as userTable } from "~/lib/db/schema";
import { useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const totps = await env.KV.list({ prefix: "totp:" });
  const db = drizzle(env.DB);
  const users = await db.select().from(userTable);
  return {
    totps,
    users,
    authenticator,
  };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      Debug
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
