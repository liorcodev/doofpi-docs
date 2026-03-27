---
title: EndpointBuilder
description: The fluent builder API for defining typed endpoints in doofpi.
---

# `EndpointBuilder`

`EndpointBuilder` is the fluent interface for defining typed endpoints. Access it via
`d.endpointBuilder`.

> **Note:** `d.endpointBuilder` is a getter that returns a **new** `EndpointBuilder` instance on
> every access. Always assign it to a variable before chaining - otherwise each access starts a
> fresh builder with no middleware, model, or meta.

```ts
// correct - store it first
const endpoint = d.endpointBuilder;
const protectedEndpoint = endpoint.middleware(authMiddleware);

// wrong - each d.endpointBuilder call is a different instance
d.endpointBuilder.middleware(authMiddleware); // discarded, middleware not kept
const handler = d.endpointBuilder.read(...); // fresh builder, no middleware
```

## Methods

### `.read(handler)`

Creates a `GET` endpoint.

```ts
endpoint.read(() => 'Hello, World!');
endpoint.read(async ({ input, ctx }) => await db.users.findById(input.id));
```

The handler receives `{ input, ctx, req, url, env, extra, path, headers, meta, throwError }`.

---

### `.write(handler)`

Creates a `POST` endpoint.

```ts
endpoint.write(async ({ input, ctx }) => await db.users.create(input));
```

---

### `.model(schemas)`

Attaches Zod input and/or output schemas. Must be called **before** `.read()` or `.write()`.

```ts
endpoint
  .model({
    input: z.object({ name: z.string(), email: z.string().email() }),
    output: z.object({ id: z.string(), name: z.string() })
  })
  .write(async ({ input }) => await db.users.create(input));
```

Both `input` and `output` are optional - you can define either or both.

---

### `.middleware(fn)`

Attaches a middleware function that runs before every handler built with this builder. Returns
`this` to allow chaining.

```ts
const authEndpoint = endpoint.middleware(async ({ req, ctx, throwError }) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const user = token ? await verifyJwt(token).catch(() => null) : null;
  if (!user) throwError({ status: 401, message: 'Unauthorized' });
  ctx.user = user;
});
```

---

### `.meta(metadata)`

Attaches metadata to a **single endpoint**. The metadata is merged with any default metadata set via
`.defaultMeta()`. Used for per-endpoint overrides.

```ts
endpoint
  .meta({ rateLimit: 10, docs: { title: 'Sensitive action' } })
  .write(({ input }) => performAction(input));
```

---

### `.defaultMeta(metadata)`

Sets **persistent default metadata** for all endpoints created with this builder. When called on a
builder that already has default metadata, returns a new `EndpointBuilder` instance with the new
metadata:

```ts
const adminEndpoint = endpoint.defaultMeta({
  auth: { required: true, roles: ['admin'] }
});

// Calling defaultMeta again creates a new instance
const superAdminEndpoint = adminEndpoint.defaultMeta({
  auth: { required: true, roles: ['superadmin'] }
});
```

---

## Handler Arguments

Every handler (`.read()` and `.write()`) receives a single object:

| Property     | Type               | Description                                                                                |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------ |
| `input`      | `Inferred<Schema>` | Validated, typed input from the request                                                    |
| `ctx`        | `Context`          | Your context object from `createContext`                                                   |
| `req`        | `Request`          | The raw Web Request                                                                        |
| `url`        | `URL`              | Parsed URL object                                                                          |
| `env`        | `Env`              | Environment variables or runtime bindings (e.g., Cloudflare Workers KV, D1)                |
| `extra`      | `Extra`            | Runtime-specific data (e.g., Cloudflare Workers `ctx`)                                     |
| `path`       | `string`           | The matched route path string                                                              |
| `headers`    | `Headers`          | Mutable response Headers object                                                            |
| `meta`       | `Meta`             | The endpoint's metadata (optional - only present if set via `.meta()` or `.defaultMeta()`) |
| `throwError` | `Function`         | Throw DoofpiError with custom status/msg                                                   |

### Middleware Arguments

Middleware functions receive the same arguments as handlers **except `input`** - input parsing
happens after middleware runs:

| Property     | Type       | Description                                            |
| ------------ | ---------- | ------------------------------------------------------ |
| `ctx`        | `Context`  | Your context object from `createContext`               |
| `req`        | `Request`  | The raw Web Request                                    |
| `url`        | `URL`      | Parsed URL object                                      |
| `env`        | `Env`      | Environment variables or runtime bindings              |
| `extra`      | `Extra`    | Runtime-specific data (e.g., Cloudflare Workers `ctx`) |
| `path`       | `string`   | The matched route path string                          |
| `meta`       | `Meta`     | The endpoint's metadata                                |
| `headers`    | `Headers`  | Mutable response Headers object                        |
| `throwError` | `Function` | Throw DoofpiError with custom status/msg               |

## Chaining Example

```ts
const protectedEndpoint = d.endpointBuilder
  .middleware(loggingMiddleware)
  .middleware(authMiddleware);

const adminEndpoint = protectedEndpoint.defaultMeta({
  auth: { required: true, roles: ['admin'] }
});

const appRoute = d.routes({
  status: d.endpointBuilder.read(() => ({ ok: true })),

  profile: protectedEndpoint.read(({ ctx }) => ctx.user),

  admin: {
    users: adminEndpoint
      .model({ output: z.array(UserSchema) })
      .read(async () => await db.users.findAll())
  }
});
```
