import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createServices } from "~/lib/services.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const {
    auth: { authenticator },
  } = createServices(context);
  await authenticator.authenticate("TOTP", request, {
    successRedirect: "/account",
    failureRedirect: "/login",
  });
}
