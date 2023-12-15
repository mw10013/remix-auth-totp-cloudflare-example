import type { LinksFunction } from "@remix-run/cloudflare";
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
