---
title: Doofpi Class
description: The main class that orchestrates your API. Instantiate it once per application.
---

# `class Doofpi`

The main class that orchestrates your API. Instantiate it once per application.

```ts
import Doofpi from 'doofpi'

const d = new Doofpi(options?)
```

## Constructor

```ts
new Doofpi(options?: Partial<DoofpiOptions>)
```

| Option | Type     | Default     | Description                      |
| ------ | -------- | ----------- | -------------------------------- |
| `root` | `string` | `'/doofpi'` | The base URL path for all routes |

```ts
const d = new Doofpi({ root: '/api' });
```

## Generic Type Parameters

Types are set via the fluent `.defineMeta<Meta>()`, `.defineEnv<Env>()`, `.defineExtra<Extra>()`,
and `.createContext()` methods rather than passing type parameters to the constructor directly:

```ts
const d = new Doofpi({ root: '/api' })
  .defineMeta<Meta>()
  .defineEnv<Env>()
  .defineExtra<Extra>()
  .createContext(createAppContext);
```

| Parameter | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| `Meta`    | Shape of route metadata objects                                          |
| `Env`     | Shape of environment variables                                           |
| `Ctx`     | Shape of the context returned by `createContext`                         |
| `Extra`   | Shape of extra runtime-specific data (e.g., `ctx` in Cloudflare Workers) |

---

## Configuration Methods

### `.defineMeta<Meta>()`

Type helper to define the metadata shape for endpoints and middleware.

```ts
type Meta = {
  auth?: { required: boolean; roles?: string[] };
  rateLimit?: number;
};

const d = new Doofpi({ root: '/api' }).defineMeta<Meta>();
```

---

### `.defineEnv<Env>()`

Type helper to define the environment variables shape.

```ts
const d = new Doofpi({ root: '/api' }).defineEnv<{ DATABASE_URL: string }>();
```

---

### `.defineExtra<Extra>()`

Type helper to define the shape of runtime-specific extra data (e.g., Cloudflare Workers
`ExecutionContext`).

```ts
const d = new Doofpi({ root: '/api' }).defineEnv<Env>().defineExtra<ExecutionContext>();
```

---

### `.createContext(fn)`

Defines the context creator function. Runs once per request.

```ts
d.createContext(async ({ req, url, path, env, extra }) => {
  const user = await getUserFromRequest(req);
  return { user, db: createDb(env.DATABASE_URL) };
});
```

The handler receives `{ req, url, path, env, extra }`.

**Returns:** `Doofpi` instance (fluent, with the context type inferred).

> **Note:** All lifecycle methods (`.createContext`, `.onRequest`, `.onResponse`, `.onError`) can
> only be called once each. Calling any of them more than once throws an error.

---

## Routing Methods

### `.endpointBuilder`

A getter that returns a **new** `EndpointBuilder` instance on every access. Always assign it to a
variable before chaining methods - otherwise each access starts a fresh builder and any middleware,
model, or meta you attached is discarded.

```ts
// correct
const endpoint = d.endpointBuilder;
const handler = endpoint.read(() => 'Hello');

// wrong - two different instances
d.endpointBuilder.middleware(authMiddleware); // thrown away
const handler = d.endpointBuilder.read(() => 'Hello'); // no middleware
```

See [EndpointBuilder →](/docs/api-reference/endpoint-builder) for the full API.

---

### `.routes(definitions)`

Type helper that returns the route object with proper inference.

```ts
const appRoute = d.routes({
  users: endpoint.read(async () => await db.users.findAll())
});
```

---

### `.register(route)`

Mounts a route object onto the router at the `root` path.

```ts
d.register(appRoute);
```

---

### `.fetch(request, env?, extra?)`

The main fetch handler. Compatible with Bun, Cloudflare Workers, Vercel, Netlify Edge Functions,
Deno, and more.

```ts
// Signature
async fetch(req: Request, env?: Env, extra?: Extra): Promise<Response>
```

**Parameters:**

| Parameter | Type      | Required | Description                                            |
| --------- | --------- | -------- | ------------------------------------------------------ |
| `req`     | `Request` | Yes      | The Web Standard Request object                        |
| `env`     | `Env`     | No       | Runtime environment variables/bindings                 |
| `extra`   | `Extra`   | No       | Runtime-specific data (e.g., Cloudflare Workers `ctx`) |

**Examples:**

```ts
export default { fetch: d.fetch.bind(d) };

// Cloudflare Workers - define Extra type and pass env and ctx
const d = new Doofpi({ root: '/api' }).defineEnv<Env>().defineExtra<ExecutionContext>();

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    return d.fetch(req, env, ctx);
  }
};

// Bun with custom env
Bun.serve({
  fetch: req => d.fetch(req, process.env)
});
```

---

## Lifecycle Hooks

### `.onRequest(handler)`

Hook that executes after context creation but before route matching. Useful for request logging,
rate limiting, or early validation.

```ts
d.onRequest(({ req, url, path, env, ctx, extra, headers, throwError }) => {
  console.log(`[${req.method}] ${path}`);
  ctx.startTime = Date.now().getTime();
  // Example: Rate limiting using context
  if (!rateLimitAllowed(ctx.ip)) {
    headers.set('Retry-After', '60');
    throwError({ status: 429, message: 'Too many requests' });
  }

  // Example: Add a custom header to the request context
  req.headers.set('X-Request-Id', crypto.randomUUID());
});
```

The handler receives `{ req, url, path, env, ctx, extra, headers, throwError }`.

---

### `.onError(handler)`

Hook into every error that occurs. The handler receives the error object, request details, and
context.

```ts
d.onError(({ error, req, url, path, headers, env, ctx, extra }) => {
  console.error(`[${req.method}] ${path}`, error.message);
  // Optionally
  return {
    status: error.status,
    message: error.message,
    issues: ctx?.user ? error.issues : undefined, // Only include validation issues for authenticated users
    details: ctx?.isAdmin ? error.details : undefined // Only include error details for admins,
    error: ctx?.isAdmin ? error : undefined // Only include full error object for admins
  };
});
```

The handler receives `{ error, req, url, path, headers, env, ctx, extra }` and can optionally return
an object with `status` and `message` (required) and `issues`, `details`, `error` (optional) to
customize the error response.

See [Error Handling →](/docs/guides/error-handling).

---

### `.onResponse(handler)`

Hook into every response before it's sent (both successful and error responses).

```ts
d.onResponse(({ req, res, env, ctx, extra }) => {
  const time = Date.now().getTime() - ctx.startTime;
  console.log(`[${req.method}] ${req.url} - ${res.status} - ${time}ms`);

  // Example: Add a custom header to every response
  res.headers.set('X-Powered-By', 'Doofpi');
});
```

The handler receives `{ req, res, env, ctx, extra }`.
