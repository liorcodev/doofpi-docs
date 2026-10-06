---
title: Read, Write, Download & Upload
description:
  doofpi maps API intent to four simple verbs - read, write, download, and upload - instead of raw HTTP methods.
---

# Read, Write, Download & Upload

Instead of exposing raw HTTP method names, doofpi maps API intent to four simple verbs: **read**,
**write**, **download**, and **upload**.

## The Four Verbs

| Method              | HTTP               | Intent                                                     |
| ------------------- | ------------------- | ----------------------------------------------------------- |
| `.read(handler)`    | `GET`               | Fetch data without side effects                            |
| `.write(handler)`   | `POST` by default   | Create, update, or delete data                             |
| `.download(handler)`| `GET`               | Return raw bytes/files, bypassing JSON handling            |
| `.upload(handler)`  | `POST`              | Accept a raw request body, bypassing JSON handling         |

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

## Download Endpoints

A `download` endpoint creates a `GET` handler like `read`, but the returned value is sent to the
client **as-is** - no JSON serialization, no `model.output` validation. Use it for files, raw
bytes, or any response you want full control over:

```ts
const appRoute = d.routes({
  file: endpoint
    .model({ input: z.object({ fileId: z.string() }) })
    .download(({ input }) => {
      const bytes = new Uint8Array([1, 2, 3, 4]);
      return new Response(bytes, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${input.fileId}.bin"`
        }
      });
    }),
  // Download also works without a model - returning raw bytes directly
  avatar: endpoint.download(() => new Uint8Array([137, 80, 78, 71]))
});
```

A `download` handler may return a `Response` or any `BodyInit` (e.g. `Uint8Array`, `Blob`, `string`).
When a plain `BodyInit` is returned, doofpi wraps it in a `Response` using the handler's `headers`
object. When a `Response` is returned, any headers set on the handler's `headers` object are merged
in without overwriting headers already present on that `Response`.

**Client usage:**

```ts
// download -> always resolves to the raw Response, never JSON-parsed
const doc = await client.file.download({ fileId: 'abc123' });
const blob = await doc.blob();

// download without a model -> no input argument required
const avatar = await client.avatar.download();
const arrayBuffer = await avatar.arrayBuffer();
```

## Upload Endpoints

An `upload` endpoint creates a `POST` handler - the write-side twin of `download`. The request
body is left **completely untouched** by doofpi, so the handler reads it raw (e.g. via
`req.arrayBuffer()` or `req.formData()`). If a `model.input` schema is set, `input` is still parsed
from the query string, just like `read`/`download`:

```ts
const appRoute = d.routes({
  receipt: endpoint
    .model({ input: z.object({ filename: z.string() }) })
    .upload(async ({ input, req }) => {
      const bytes = new Uint8Array(await req.arrayBuffer());
      return JSON.stringify({ filename: input.filename, size: bytes.byteLength });
    })
});
```

Like `download`, an `upload` handler may return a `Response` or any `BodyInit` - the response is
sent to the client as-is, bypassing JSON serialization and `model.output` validation.

**Client usage:**

```ts
// upload -> raw body payload as the 2nd argument, and a raw (never-JSON-parsed) response back
const res = await client.receipt.upload({ filename: 'photo.png' }, new Uint8Array([1, 2, 3]));
const result = await res.text();
```

## Handler Arguments

`read`, `write`, `download`, and `upload` handlers all receive the same arguments object:

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

`read` and `write` handlers can return:

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

> `download` and `upload` handlers are the exception - they must return a `Response` or `BodyInit`
> (see [Download Endpoints](#download-endpoints) and [Upload Endpoints](#upload-endpoints) above),
> which is sent as-is with no serialization.

