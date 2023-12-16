import { Button } from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { users } from "~/lib/db/schema";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const db = drizzle(env.DB);
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) return redirect("/login");
  return { user, authenticator, session };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator, getSession, destroySession } = hookAuth(env);
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const db = drizzle(env.DB);
  const [user] = await db.select().from(users).where(eq(users.id, session.id));
  if (!user) return redirect("/login");

  // Delete user.
  await db.delete(users).where(eq(users.id, session.id));

  // Destroy session.
  return redirect("/", {
    headers: {
      "set-cookie": await destroySession(
        await getSession(request.headers.get("cookie")),
      ),
    },
  });
}

export default function Route() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div>
      Account
      <Form method="POST" autoComplete="off">
        <Button type="submit" color="primary">
          Remove account
        </Button>
      </Form>
      <Form method="POST" action="/logout" autoComplete="off">
        <Button type="submit" color="secondary">
          Log out
        </Button>
      </Form>
    </div>
  );
}
