import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Link as RemixLink,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NextUIProvider,
} from "@nextui-org/react";

/**
 * We take simplistic approach to meta and only define it in root.
 * Will need to revisit if meta is needed in child routes.
 * @see <a href="https://remix.run/docs/en/main/route/meta-v2#avoid-meta-in-parent-routes">Avoid meta in parent routes</a>
 */
export const meta: MetaFunction = () => {
  // https://remix.run/docs/en/main/route/meta-v2#avoid-meta-in-parent-routes
  return [
    { title: "Remix Auth Totp Cloudflare Example" },
    {
      name: "description",
      content:
        "This app is an example of using remix-auth-totp with cloudflare pages, d1, and kv.",
    },
  ];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

function Navigation() {
  return (
    <Navbar>
      <NavbarBrand>
        <Link
          as={RemixLink}
          to="/"
          className="font-bold text-inherit"
          color="foreground"
        >
          Remix Auth TOTP
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Link
            as={RemixLink}
            to="/signin-up"
            color="foreground"
            underline="hover"
          >
            Sign In/Up
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased dark">
        <NextUIProvider>
          {/* https://github.com/nextui-org/next-app-template/blob/main/app/layout.tsx */}
          <div className="relative flex h-screen flex-col">
            <Navigation />
            <main className="container mx-auto max-w-7xl grow px-6 pt-16">
              <Outlet />
            </main>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        </NextUIProvider>
      </body>
    </html>
  );
}
