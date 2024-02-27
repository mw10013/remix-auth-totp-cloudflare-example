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

- Console spits out 302's continuously. This may occur after rebuilding local from scratch, especially the database, and there are stale cookies in the browser. Clearing cookies for the application in the browser should fix.

```sh
[wrangler:inf] GET /verify 302 Found (11ms)
[wrangler:inf] GET /account 302 Found (7ms)
[wrangler:inf] GET /login 302 Found (2ms)
[wrangler:inf] GET /account 302 Found (4ms)
[wrangler:inf] GET /login 302 Found (3ms)
[wrangler:inf] GET /account 302 Found (3ms)
[wrangler:inf] GET /login 302 Found (4ms)
```

## Deployment

- Go to your [Cloudflare](https://www.cloudflare.com/) account.
- Use [Deplay a Remix Site](https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/#deploying-with-cloudflare-pages) as reference.
- Workers & Pages | Overview | Create application button | Pages tab | Connect to Git button
  - Follow the Cloudflare workflow to link the repo.
  - Set up builds and deployments form
    - Framework preset: Remix
    - Build command: pnpm run build
    - Build output directory: build/client
- Workers & Pages | Overview | remix-auth-totp-cloudflare-example | Settings | Environment variables (for Production and Preview)
  - See .dev.vars.example and wrangler.toml for reference.
  - ENVIRONMENT = production | preview (ie. specify production for Production and preview for Preview)
  - SESSION_SECRET
  - TOTP_SECRET
  - RESEND_API_KEY
- Workers & Pages | Overview | remix-auth-totp-cloudflare-example | Settings | Functions | Compatibility date
  - Specify `2024-02-03` for Production and Preview
- Workers & Pages | Overview | remix-auth-totp-cloudflare-example | Settings | Functions | Compatibility flags
  - Specify `nodejs_compat` for Production and Preview
- Workers & Pages | KV | Create a namespace
  - Namespace name: ratce-kv-prod | ratce-kv-preview (ie. create 2 kv's)
- Workers & Pages | Overview | remix-auth-totp-cloudflare-example | Settings | Functions | KV namespace bindings
  - Production: KV = ratce-kv-prod
  - Preview: KV = ratce-kv-preview
- Workers & Pages | D1 | Create database | Dashboard
  - Database name: ratce-d1-prod | ratce-d1-preview (ie. create 2 databases)
  - Note database id's for wrangler.toml.
- Workers & Pages | Overview | remix-auth-totp-cloudflare-example | Settings | Functions | D1 database bindings
  - Production: D1 = ratce-d1-prod
  - Preview: D1 = ratce-d1-preview
- wrangler.toml
  - [[env.prod.d1_databases]]
    - databse_id = "<d1 id for ratce-d1-prod>"
  - [[env.preview.d1_databases]]
    - databse_id = "<d1 id for ratce-d1-preview>"
- Apply migrations
  - `pnpm run d1:migrate:apply:prod`
  - `pnpm run d1:migrate:apply:preview`

## Etc

```sh
pnpm wrangler d1 info ratce-d1-prod
pnpm wrangler d1 info ratce-d1-preview

# dev
pnpm wrangler d1 execute ratce-d1-dev --local --command "select * from d1_migrations;"
pnpm wrangler d1 execute ratce-d1-dev --local --command "select * from users;"
pnpm wrangler d1 execute ratce-d1-dev --local --command "select * from totps;"

# prod
pnpm wrangler d1 execute ratce-d1-prod --command "select * from d1_migrations;"
pnpm wrangler d1 execute ratce-d1-prod --command "select * from users;"
pnpm wrangler d1 migrations list ratce-d1-prod --env prod

# preview
pnpm wrangler d1 execute ratce-d1-preview --command "select * from d1_migrations;"
pnpm wrangler d1 execute ratce-d1-preview --command "select * from users;"
pnpm wrangler d1 migrations list ratce-d1-preview --env preview
```
