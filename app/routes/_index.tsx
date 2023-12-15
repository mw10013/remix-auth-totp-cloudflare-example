import { Card, CardBody, CardHeader } from "@nextui-org/react";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Auth Totp Cloudflare Example" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Card className="m-8">
      <CardHeader>
        <h1 className="text-bold text-2xl">
          Welcome to Remix Auth Totp Cloudflare Example
        </h1>
      </CardHeader>
      <CardBody>
        <p>Make beautiful websites regardless of your design experience.</p>
      </CardBody>
    </Card>
  );
}
