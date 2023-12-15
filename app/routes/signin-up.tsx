import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { sendAuthEmail } from "~/lib/email.server";
import { hookAuth, hookEnv } from "~/lib/hooks.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);
  return {
    authenticator,
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = hookEnv(context.env);
  const { authenticator } = hookAuth(env);

  await sendAuthEmail({
    email: "mw10013@gmail.com",
    code: "123456",
    magicLink: "/magic-link",
    resendApiKey: env.RESEND_API_KEY,
  });
  return {
    authenticator,
  };
}

export default function Route() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const error = null;
  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Instant Sign In/Up</p>
            <p className="text-small text-default-500">
              Sign in or create an account with just your email.
            </p>
            {error && (
              <small className="mt-2 text-small text-danger-500">{error}</small>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <Form method="post">
            {/* {formServerError && formServerError.formErrors.length > 0 && (
                <small className="text-small text-danger-500">
                  {formServerError.formErrors.join(". ")}
                </small>
              )} */}
            <Input
              type="email"
              name="email"
              label="Email"
              variant="bordered"
              // validationState={
              //   formServerError?.fieldErrors.email ? "invalid" : undefined
              // }
              // errorMessage={
              //   formServerError?.fieldErrors.email
              //     ? formServerError.fieldErrors.email.join(", ")
              //     : ""
              // }
            />
            <div className="space-y-2 py-2">
              <div className="flex flex-col items-center"></div>
              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </Form>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <pre>{JSON.stringify(actionData, null, 2)}</pre>
        </CardBody>
      </Card>
    </div>
  );
}
