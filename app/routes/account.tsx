import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin-up",
  });

  //   const user = await prisma.user.findUnique({ where: { id: session.id } })
  //   if (!user) return redirect('/login')

  //   return json({ user } as const)
  return { authenticator, session };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      Account
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
