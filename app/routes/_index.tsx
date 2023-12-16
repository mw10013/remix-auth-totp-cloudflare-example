import { Button, Card, CardBody, CardHeader, Link } from "@nextui-org/react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { totps as totpTable, users as userTable } from "~/lib/db/schema";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  const db = drizzle(env.DB);
  const totps = await db.select().from(totpTable);
  const users = await db.select().from(userTable);
  return {
    totps,
    users,
    authenticator,
  };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <Card className="m-8">
      <CardHeader>
        <h1 className="text-bold text-2xl">
          Welcome to Remix Auth Totp Cloudflare Example
        </h1>
      </CardHeader>
      <CardBody>
      <Button
      href="/signin-up"
      as={Link}
      color="primary"
      variant="solid"
    >
      Authorize
    </Button>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardBody>
    </Card>
  );
}
