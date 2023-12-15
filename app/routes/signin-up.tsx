import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hookCloudflareEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = hookCloudflareEnv(context.env);
  return {
    env,
  };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      Sign In/Up
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
