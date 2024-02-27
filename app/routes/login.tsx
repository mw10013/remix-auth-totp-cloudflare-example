import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { H3, P, Small } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createServices } from "~/lib/services.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const {
    auth: { authenticator, getSession, commitSession },
  } = createServices(context);
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const session = await getSession(request.headers.get("cookie"));
  const authError = session.get("auth:error");

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
  const {
    auth: { authenticator },
  } = createServices(context);
  await authenticator.authenticate("TOTP", request, {
    // The `successRedirect` route will be used to verify the TOTP code.
    // This could be the current pathname or any other route that renders the verification form.
    successRedirect: "/verify",

    // The `failureRedirect` route will be used to render any possible error.
    failureRedirect: new URL(request.url).pathname,
  });
}

export default function Route() {
  const { authError } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-sm p-8 ">
      <H3>Welcome back</H3>
      <P className="[&:not(:first-child)]:mt-0">
        Login in or sign in to your account.
      </P>
      <Form method="POST" className="mt-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" name="email" id="email" />
        <Small className="mt-1 text-destructive">{authError?.message}</Small>
        <Button type="submit" className="mt-4">
          Continue with Email
        </Button>
      </Form>
    </div>
  );
}
