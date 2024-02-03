import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { H3 } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { users } from "~/lib/db/schema";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  console.log("account: loader:", { sessionUser, authenticator });
  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator, getSession, destroySession } = hookAuth(env);
  const sessionUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  // Delete user.
  const db = drizzle(env.D1);
  await db.delete(users).where(eq(users.id, sessionUser.id));

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
  return (
    <div className="mx-auto max-w-sm p-8">
      <H3>My account</H3>
      <div className="flex flex-col gap-2 mt-4">
        <Form method="POST">
          <Button type="submit" variant="destructive" className="w-full">
            Remove account
          </Button>
        </Form>
        <Form method="POST" action="/logout">
          <Button type="submit" className="w-full">
            Log out
          </Button>
        </Form>
      </div>
    </div>
  );
}