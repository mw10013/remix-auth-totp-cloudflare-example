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
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  let magicUrl = new URL(request.url);
  magicUrl.pathname = "/magic-link";
  magicUrl.searchParams.set("code", "QWERT");
  console.log({
    magicUrl,
    host: request.headers.get("host"),
    xhost: request.headers.get("X-Forwarded-Host"),
    url: request.url,
  });

  await authenticator.authenticate("TOTP", request, {
    // The `successRedirect` route will be used to verify the OTP code.
    // This could be the current pathname or any other route that renders the verification form.
    successRedirect: "/verify",

    // The `failureRedirect` route will be used to render any possible error.
    // If not provided, ErrorBoundary will be rendered instead.
    failureRedirect: new URL(request.url).pathname,
  });
}

export default function Route() {
  const { authEmail, authError } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Welcome back</p>
            <p className="text-small text-default-500">
              Login in or sign in to your account
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Form method="post" className="space-y-2">
            <Input
              type="email"
              name="email"
              label="Email"
              variant="bordered"
              isRequired
              isInvalid={!!authError}
              errorMessage={authError?.message}
            />
            <Button type="submit" className="w-full" color="primary">
              Continue with Email
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
