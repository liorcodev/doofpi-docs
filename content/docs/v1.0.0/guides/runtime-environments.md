---
title: Runtime Environments
description:
  doofpi is built on Web Standard Request/Response APIs, making it compatible with Bun, Cloudflare
  Workers, Deno, Vercel, Netlify Edge Functions, and more.
---

# Runtime Environments

doofpi is built on Web Standard `Request`/`Response` APIs, making it compatible with any modern
JavaScript runtime out of the box. This guide covers setup examples for Bun, Cloudflare Workers,
Deno, Vercel, and Netlify.

## Bun

doofpi works natively with Bun's built-in HTTP server:

```ts
// server.ts
import Doofpi from 'doofpi';
import type { Server } from 'bun';

const d = new Doofpi({ root: '/api' })
  .defineEnv<{ DATABASE_URL: string }>() // Optional: define env variables
  .defineExtra<Server>(); // Optional: type the server parameter
// ... define and register routes

Bun.serve({
  port: 3000,
  fetch(req, server) {
    return d.fetch(req, process.env, server); // Pass server as extra
  }
});
```

Or use the simpler format if you don't need the server reference and don't have custom env
variables:

```ts
Bun.serve({
  port: 3000,
  fetch: d.fetch.bind(d)
});
// OR
export default { fetch: d.fetch.bind(d) };
```

Run with:

```bash
bun run server.ts
```

## Cloudflare Workers

Cloudflare Workers provides `env` and `ctx` (ExecutionContext) per-request. Pass them to
`d.fetch()`:

```ts
// worker.ts
import Doofpi from 'doofpi';

const d = new Doofpi({ root: '/api' })
  .defineEnv<Cloudflare.Env>() // Types your KV, D1, R2 bindings
  .defineExtra<ExecutionContext>() // Types the ctx parameter
  .createContext(({ env, req, extra }) => ({
    db: drizzle(env.DB),
    user: null
    // extra is typed as ExecutionContext - use for waitUntil, passThroughOnException, etc.
  }));
// ... define and register routes

export default {
  async fetch(req: Request, env: Cloudflare.Env, ctx: ExecutionContext): Promise<Response> {
    return d.fetch(req, env, ctx); // Pass env and ctx directly
  }
};
```

## Deno

doofpi works with Deno's `Deno.serve()`:

```ts
// server.ts
import Doofpi from 'npm:doofpi';

const d = new Doofpi({ root: '/api' }).defineExtra<typeof Deno>(); // Type the extra parameter as Deno
// ... define and register routes
// ({ extra }) => extra.Deno....

Deno.serve({ port: 3000 }, req => {
  return d.fetch(req, undefined, Deno); // Pass Deno as extra for access to Deno-specific APIs if needed
});
```

## Vercel

Vercel Functions support the Web Standard `Request`/`Response` API natively. Export a `fetch`
handler from a file in your `api/` directory:

```ts
// api/[...slug].ts
import Doofpi from 'doofpi';

const d = new Doofpi({ root: '/api' });
// ... define and register routes

export default { fetch: d.fetch.bind(d) };
```

The `[...slug].ts` naming creates a catch-all route that forwards all requests under `/api/` to
doofpi's router.

## Netlify Edge Functions

Netlify Edge Functions run on a Deno-based runtime and support Web Standard `Request`/`Response`
natively. Place your function in `netlify/edge-functions/` and export a default handler:

```ts
// netlify/edge-functions/api.ts
import type { Config, Context } from '@netlify/edge-functions';
import Doofpi from 'doofpi';

const d = new Doofpi({ root: '/api' });
// ... define and register routes

export default (req: Request) => d.fetch(req);

export const config: Config = { path: '/api/*' };
```

If you need access to Netlify-specific features (geolocation, cookies, `waitUntil`, etc.), pass the
`context` as `extra`:

```ts
import type { Config, Context } from '@netlify/edge-functions';
import Doofpi from 'doofpi';

const d = new Doofpi({ root: '/api' }).defineExtra<Context>();
// ... define and register routes

export default (req: Request, context: Context) => d.fetch(req, undefined, context);

export const config: Config = { path: '/api/*' };
```

Access environment variables via `Netlify.env.get('VAR_NAME')` inside your handlers.
