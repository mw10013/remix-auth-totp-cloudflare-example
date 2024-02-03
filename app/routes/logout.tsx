import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  return await authenticator.logout(request, { redirectTo: "/" });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  return await authenticator.logout(request, { redirectTo: "/" });
}
