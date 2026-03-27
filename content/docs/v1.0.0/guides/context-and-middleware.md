---
title: Context & Middleware
description:
  Core concepts - context for dependency injection and middleware for request interception.
---

# Context & Middleware

This guide covers the foundational building blocks of doofpi: **context** (for dependency injection)
and **middleware** (for request interception).

## Context

Context is how doofpi injects shared dependencies - like a database connection, authenticated user,
or parsed environment variables - into every request handler.

### Defining Context

Use `.createContext()` on your `Doofpi` instance:

```ts
const d = new Doofpi({ root: '/api' })
  .defineEnv<{ DATABASE_URL: string }>() // optional, for typed env
  .createContext(async ({ env }) => ({
    db: createDbClient(env.DATABASE_URL),
    user: {} as User // shape declared, populated by middleware
  }));
```

The context creator receives:

| Property | Type      | Description                                                                 |
| -------- | --------- | --------------------------------------------------------------------------- |
| `req`    | `Request` | The raw Web Request                                                         |
| `url`    | `URL`     | Parsed URL object                                                           |
| `path`   | `string`  | Matched route path                                                          |
| `env`    | `Env`     | Environment variables or runtime bindings (e.g., Cloudflare Workers KV, D1) |
| `extra`  | `Extra`   | Runtime-specific data (e.g., Cloudflare Workers `ctx`)                      |

### Using Context in Handlers

The `ctx` object is available in every handler, fully typed:

```ts
const appRoute = d.routes({
  users: d.endpointBuilder.read(async ({ ctx }) => {
    return await ctx.db.users.findAll();
  })
});
```

### Inferring the Context Type

Use `InferContext` to extract the context type:

```ts
import type { InferContext } from 'doofpi';
import { d } from './doofpi';

type AppContext = InferContext<typeof d>;
// { user: User, db: DbClient }
```

## Middleware

Middleware is a function that runs before every handler. Use `.middleware()` on an
`EndpointBuilder`:

```ts
const endpoint = d.endpointBuilder.middleware(
  async ({ req, ctx, path, headers, env, extra, throwError }) => {
    console.log(`[${req.method}] ${path}`);
  }
);
```

### Middleware Parameters

Middleware receives:

| Property     | Description                               |
| ------------ | ----------------------------------------- |
| `req`        | The raw Web `Request`                     |
| `url`        | Parsed URL object                         |
| `ctx`        | Your context object (mutable)             |
| `path`       | The matched route path                    |
| `headers`    | Mutable response headers                  |
| `env`        | Environment variables or runtime bindings |
| `extra`      | Runtime-specific data                     |
| `throwError` | Function to throw DoofpiError             |

### Modifying Context

Middleware can mutate the `ctx` object to add data for handlers:

```ts
const endpoint = d.endpointBuilder.middleware(async ({ ctx, req }) => {
  ctx.requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
});

const appRoute = d.routes({
  status: endpoint.read(({ ctx }) => ({
    ok: true,
    requestId: ctx.requestId
  }))
});
```

### Chaining Multiple Middlewares

Middlewares run in the order they are added:

```ts
const endpoint = d.endpointBuilder
  .middleware(loggingMiddleware)
  .middleware(authMiddleware)
  .middleware(rateLimitMiddleware);
```

Each middleware has access to the context modifications made by previous middlewares in the chain.
This allows you to build composable middleware pipelines where each step enriches the context for
the next.
