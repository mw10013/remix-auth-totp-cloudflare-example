import { Link } from "@remix-run/react";
import { Large, Muted } from "~/components/typography";
import { Button } from "~/components/ui/button";

export default function Index() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-2 p-8 text-center">
      <Large className="text-balance">
        Robust, easy-to-implement TOTP for email authentication
      </Large>
      <Muted>Designed for Remix Auth</Muted>
      <Button asChild className="self-center">
        <Link to="/login">Authorize</Link>
      </Button>
    </div>
  );
}
