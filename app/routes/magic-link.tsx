import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.cloudflare.env);
  const { authenticator } = hookAuth(env);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/account",
    failureRedirect: "/login",
  });
}
