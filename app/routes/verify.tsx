import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator, getSession, commitSession } = hookAuth(env);
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const session = await getSession(request.headers.get("cookie"));
  const authEmail = session.get("auth:email");
  if (!authEmail) return redirect("/login");
  const authError = session.get(authenticator.sessionErrorKey) as {
    message: string;
  } | null;

  // Commit session to clear any `flash` error message.
  return json(
    { authError },
    {
      headers: {
        "set-cookie": await commitSession(session),
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
  const { authError } = useLoaderData<typeof loader>();
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
          <Form method="post" className="space-y-2">
            <Input
              type="text"
              name="code"
              label="Code"
              isRequired
              variant="bordered"
              isInvalid={!!authError}
              errorMessage={authError?.message}
            />
            <div className="flex justify-end">
              <Button type="submit" className="w-full" color="primary">
                Continue
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
