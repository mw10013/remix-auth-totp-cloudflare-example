import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
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

  // Commit session to clear any `flash` error message.
  return json(
    { authEmail, authError },
    {
      headers: {
        "set-cookie": await commitSession(cookie),
      },
    },
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const currentPath = url.pathname;
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);

  await authenticator.authenticate("TOTP", request, {
    // The `successRedirect` route will be used to verify the OTP code.
    // This could be the current pathname or any other route that renders the verification form.
    successRedirect: "/verify",

    // The `failureRedirect` route will be used to render any possible error.
    // If not provided, ErrorBoundary will be rendered instead.
    failureRedirect: currentPath,
  });
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const { authEmail, authError } = data;
  const error = null;
  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Instant Sign In/Up</p>
            <p className="text-small text-default-500">
              Sign in or create an account with just your email.
            </p>
            {error && (
              <small className="mt-2 text-small text-danger-500">{error}</small>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <Form method="post">
            <Input
              type="email"
              name="email"
              label="Email"
              required
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
