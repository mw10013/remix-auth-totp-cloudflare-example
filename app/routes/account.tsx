import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/lib/db/schema";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin-up",
  });
  const db = drizzle(env.DB);
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) return redirect("/signin-up");
  return { user, authenticator, session };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      Account
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
