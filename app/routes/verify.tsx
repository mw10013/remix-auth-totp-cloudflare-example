import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { totps as totpTable } from "~/lib/db/schema";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator, getSession, commitSession } = hookAuth(env);
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const cookie = await getSession(request.headers.get("cookie"));
  const authEmail = cookie.get("auth:email");
  const authError = cookie.get(authenticator.sessionErrorKey);

  if (!authEmail) return redirect("/login");

  const db = drizzle(env.DB);
  const totps = await db.select().from(totpTable);

  // Commit session to clear any `flash` error message.
  return json(
    { cookie, authEmail, authError, totps },
    {
      headers: {
        "set-cookie": await commitSession(cookie),
      },
    },
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: url.pathname,
    failureRedirect: url.pathname,
  });
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const { authEmail, authError } = data;
  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Please check your inbox </p>
            <p className="text-small text-default-500">
              We've sent you a magic link email.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Form method="post">
            <Input
              type="text"
              name="code"
              label="Code"
              isRequired
              variant="bordered"
              isInvalid={!!authError}
              errorMessage={authError?.message}
            />
            <div className="space-y-2 py-2">
              <div className="flex flex-col items-center"></div>
              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </Form>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </CardBody>
      </Card>
    </div>
  );
}
