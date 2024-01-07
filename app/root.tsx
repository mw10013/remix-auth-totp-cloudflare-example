import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { NextUIProvider } from "@nextui-org/react";
import { Navigation } from "./components/navigation";
import { GenericErrorBoundary } from "~/components/error-boundary";

/**
 * We take simplistic approach to meta and only define it in root.
 * Will need to revisit if meta is needed in child routes.
 * @see <a href="https://remix.run/docs/en/main/route/meta-v2#avoid-meta-in-parent-routes">Avoid meta in parent routes</a>
 */
export const meta: MetaFunction = () => {
  // https://remix.run/docs/en/main/route/meta-v2#avoid-meta-in-parent-routes
  return [
    { title: "Remix Auth TOTP Cloudflare Example" },
    {
      name: "description",
      content:
        "This app is an example of using remix-auth-totp with cloudflare pages and d1.",
    },
  ];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

function Document({
  children,
  lang = "en",
}: {
  children: React.ReactNode;
  lang?: string;
}) {
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased dark">
        <NextUIProvider>
          {/* https://github.com/nextui-org/next-app-template/blob/main/app/layout.tsx */}
          <div className="relative flex h-screen flex-col">
            <div className="navbar bg-base-100">
              <Link to="/" className="link text-xl">Remix Auth TOTP</Link>
            {/* <a className="btn btn-ghost text-xl">daisyUI</a> */}
            </div>
            <Navigation />
            <main className="container mx-auto max-w-7xl grow px-6 pt-16">
              {children}
            </main>
            <ScrollRestoration />
            <Scripts />
            {/* {process.env.NODE_ENV === "development" && <LiveReload />} */}
            <LiveReload />
          </div>
        </NextUIProvider>
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  /**
   * NOTE: `useLoaderData` is not available in the Error Boundary.
   * The loader likely failed to run so we have to do the best we can.
   */
  return (
    <Document>
      <GenericErrorBoundary />
    </Document>
  );
}
