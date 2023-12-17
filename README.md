# Welcome to Remix Auth TOTP - Remix Auth TOTP Example

This repository has been created with the intent to provide a simple example of how to use Remix Auth TOTP on Cloudflare. This example uses Drizzle ORM and Cloudflare D1 SQLite to store and handle the authentication flow.

## Getting Started

- Clone the repository and install its dependencies:

```sh
pnpm install
```

- Get required `.dev.vars` environment variables for Cloudflare:

This example uses [Resend](https://resend.com/overview) to send emails. You can create a free account and get your API key on [here](https://resend.com/api-keys).

> **Note**
> Remember to replace the current `.dev.vars.example` file with your own `.dev.vars` file.

- Run local D1 migrations:

```sh
pnpm run d1:migrate:apply
```

- Run the server:

```sh
pnpm run dev
```

And you're ready to go! 🎉

## Troubleshooting Local Dev

- Console spits out 302's continuously. This may occur after rebuilding local from scratch, espeically the database, and there are stale cookies in the browser. Clearing cookies for the application in the browser should fix.

```sh
[wrangler:inf] GET /verify 302 Found (11ms)
[wrangler:inf] GET /account 302 Found (7ms)
[wrangler:inf] GET /login 302 Found (2ms)
[wrangler:inf] GET /account 302 Found (4ms)
[wrangler:inf] GET /login 302 Found (3ms)
[wrangler:inf] GET /account 302 Found (3ms)
[wrangler:inf] GET /login 302 Found (4ms)
```

# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

You will be utilizing Wrangler for local development to emulate the Cloudflare runtime. This is already wired up in your package.json as the `dev` script:

```sh
# start the remix dev server and wrangler
npm run dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

## Deployment

Cloudflare Pages are currently only deployable through their Git provider integrations.

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages) and after verifying your email address with Cloudflare, go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything).

Configure the "Build command" should be set to `npm run build`, and the "Build output directory" should be set to `public`.
