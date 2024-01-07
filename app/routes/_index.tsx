import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="mx-auto max-w-sm p-8">
      <p>
        A robust, easy-to-implement TOTP package for 2FA and email
        authentication, designed for Remix Auth
      </p>
      <Link to="/login" className="btn btn-primary btn-block">
        Authorize
      </Link>
    </div>
  );
}
