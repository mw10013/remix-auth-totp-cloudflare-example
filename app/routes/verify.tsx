import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { H3, P, Small } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createServices } from "~/lib/services.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const {
    env: { KV },
    auth: { authenticator, getSession, commitSession },
  } = createServices(context);
  await authenticator.isAuthenticated(request, {
    successRedirect: "/account",
  });

  const session = await getSession(request.headers.get("cookie"));
  const authEmail = session.get("auth:email");
  if (!authEmail) return redirect("/login");
  const authError = session.get("auth:error");

  // WARNING: To demo without implementing email so don't copy/past.
  const simulateEmail = await KV.get(`simulateEmail:${authEmail}`);

  // Commit session to clear any `flash` error message.
  return json(
    { authError, simulateEmail },
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
  const url = new URL(request.url);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: url.pathname,
    failureRedirect: url.pathname,
  });
}

export default function Route() {
  const { authError, simulateEmail } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto max-w-sm p-8">
      <H3>Please check your inbox</H3>
      <P>We have sent you a magic link email.</P>
      <Form method="POST" className="mt-2 space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input type="text" name="code" id="code" />
        <Small className="mt-1 text-destructive">{authError?.message}</Small>
        <Button type="submit">Continue</Button>
      </Form>
      <P>{simulateEmail}</P>
    </div>
  );
}
