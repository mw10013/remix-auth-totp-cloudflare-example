import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Auth Totp Cloudflare Example" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="p-8">
      <h1 className="text-bold text-2xl">Welcome to Remix Auth Totp Cloudflare Example</h1>
    </div>
  );
}
