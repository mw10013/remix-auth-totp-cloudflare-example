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
      <h2>Please check your inbox</h2>
      <p>We've sent you a magic link email.</p>
      <Form method="POST" className="space-y-2">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Code</span>
          </div>
          <input
            type="text"
            name="code"
            className="input input-bordered w-full max-w-xs"
          />
          <div className="label">
            <span className="label-text-alt text-error">
              {authError?.message}
            </span>
          </div>
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Continue
        </button>
      </Form>
    </div>
  );
}
