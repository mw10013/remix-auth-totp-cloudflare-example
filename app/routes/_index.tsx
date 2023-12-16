import { Button, Card, CardBody, CardHeader, Link } from "@nextui-org/react";

export default function Index() {
  return (
    <div className="mx-auto max-w-sm p-8">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            {/* <p className="text-md">Welcome back</p> */}
            <p className="text-small text-default-500">
              A robust, easy-to-implement TOTP package for 2FA and email
              authentication, designed for Remix Auth
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Button href="/login" as={Link} color="primary" variant="solid">
            Authorize
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
