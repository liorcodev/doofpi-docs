---
title: Read & Write
description:
  doofpi maps API intent to two simple verbs - read and write - instead of raw HTTP methods.
---

# Read & Write

Instead of exposing raw HTTP method names, doofpi maps API intent to two simple verbs: **read** and
**write**.

## The Two Verbs

| Method            | HTTP              | Intent                          |
| ----------------- | ----------------- | ------------------------------- |
| `.read(handler)`  | `GET`             | Fetch data without side effects |
| `.write(handler)` | `POST` by default | Create, update, or delete data  |

This mirrors the **read/write** mental model that's intuitive for TypeScript developers, while
mapping cleanly to HTTP semantics under the hood.

## Read Endpoints

A `read` endpoint creates a `GET` handler. Input is passed via query parameters:

```ts
// No input
const appRoute = d.routes({
  status: endpoint.read(() => ({ ok: true, timestamp: Date.now() }))
});

// With input
const appRoute = d.routes({
  user: endpoint
    .model({ input: z.object({ id: z.string() }) })
    .read(async ({ input }) => await db.users.findById(input.id))
});
```

**Client usage:**

```ts
const status = await client.status.read();

// Input is automatically sent as ?input={"id":"123"}
const user = await client.user.read({ id: '123' });
```

## Write Endpoints

A `write` endpoint defaults to `POST`. The input is sent as a JSON body:

```ts
const appRoute = d.routes({
  createUser: endpoint
    .model({
      input: z.object({ name: z.string(), email: z.string().email() }),
      output: z.object({ id: z.string(), name: z.string() })
    })
    .write(async ({ input }) => await db.users.create(input))
});
```

**Client usage:**

```ts
const user = await client.createUser.write({ name: 'Alice', email: 'alice@example.com' });
```

## Handler Arguments

Both `read` and `write` handlers receive the same arguments object:

```ts
endpoint.read(({ input, ctx, req, url, env, extra, path, headers, meta, throwError }) => {
  // input      - validated + typed input from the request
  // ctx        - your context object (from createContext)
  // req        - the raw Web Request object
  // url        - parsed URL object
  // env        - environment variables or runtime bindings (e.g., Cloudflare Workers KV, D1)
  // extra      - runtime-specific data (e.g., Cloudflare Workers ctx)
  // path       - the matched route path string
  // headers    - Response headers object you can mutate
  // meta       - the route's metadata (if any)
  // throwError - function to throw DoofpiError with custom status/message
});
```

### Mutating Response Headers

```ts
endpoint.read(({ headers }) => {
  headers.set('Cache-Control', 'public, max-age=60');
  return { data: 'cached response' };
});
```

### Throwing Errors

```ts
endpoint
  .model({ input: z.object({ postId: z.string() }) })
  .read(async ({ input, ctx, throwError }) => {
    const post = await ctx.db.posts.findById(input.postId);
    if (!post) {
      throwError({ status: 404, message: 'Post not found' });
    }

    return post;
  });
```

## Return Values

Handlers can return:

- **Plain objects / arrays** → serialized as `application/json`
- **Strings / numbers / booleans** → serialized as `text/plain`
- **`null` or `undefined`** → empty response body (no content)
- **Promises** of any of the above

```ts
endpoint.read(() => 'Hello'); // text/plain
endpoint.read(() => ({ ok: true })); // application/json
endpoint.read(() => Promise.resolve([1, 2, 3])); // application/json
endpoint.read(() => null); // empty response
endpoint.read(() => undefined); // empty response
```
