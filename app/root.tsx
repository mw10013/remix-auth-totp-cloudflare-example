import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";
import { NextUIProvider } from "@nextui-org/react";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

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
