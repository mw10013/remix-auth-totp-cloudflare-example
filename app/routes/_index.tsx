import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const key = "__my-key__";

export async function loader({ context }: LoaderFunctionArgs) {
  const { KV } = context.env;
  const value = await KV.get(key);
  return json({ value });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { KV: myKv } = context.env;

  if (request.method === "POST") {
    const formData = await request.formData();
    const value = formData.get("value") as string;
    await myKv.put(key, value);
    return null;
  }

  if (request.method === "DELETE") {
    await myKv.delete(key);
    return null;
  }

  throw new Error(`Method not supported: "${request.method}"`);
}

export default function Index() {
  const { value } = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-2 py-6">
      <h1 className="text-lg font-semibold">Welcome to Remix</h1>
      {value ? (
        <>
          <p>Value: {value}</p>
          <Form method="DELETE">
            <Button>Delete</Button>
          </Form>
        </>
      ) : (
        <>
          <p>No value</p>
          <Form method="POST" className="flex flex-col gap-2">
            <Label htmlFor="value">Set value: </Label>
            <Input type="text" name="value" id="value" required />
            <Button>Save</Button>
          </Form>
        </>
      )}
    </div>
  );
}
