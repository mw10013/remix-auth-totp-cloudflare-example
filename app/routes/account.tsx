import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
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
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">My account</p>
            <p className="text-small text-default-500"></p>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          <Form method="POST" autoComplete="off">
            <Button type="submit" className="w-full" color="primary">
              Remove account
            </Button>
          </Form>
          <Form method="POST" action="/logout" autoComplete="off">
            <Button type="submit" className="w-full" color="secondary">
              Log out
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
