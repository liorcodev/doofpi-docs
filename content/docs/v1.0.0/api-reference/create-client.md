---
title: createClient
description: Creates a fully typed Proxy client that mirrors your server's route structure.
---

# `createClient`

Creates a fully typed Proxy client that mirrors your server's route structure.

```ts
import { createClient } from 'doofpi';
import type { AppRoute } from './server';

const client = createClient<AppRoute>(options);
```

## Options

```ts
createClient<AppRoute>({
  url:   string
  root?: string
  init?: ClientRequestInit
})
```

| Option | Type                | Required | Description                                                                               |
| ------ | ------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `url`  | `string`            | ✓        | Full URL to your API origin (e.g., `https://api.example.com`)                             |
| `root` | `string`            | -        | Base path - must match the server's `root`. Default: `/doofpi`                            |
| `init` | `ClientRequestInit` | -        | Initial RequestInit options (headers, signal, cache, credentials) applied to all requests |

## Type Parameter

Pass your exported route type as the generic argument:

```ts
import type { AppRoute } from './server';

const client = createClient<AppRoute>({ ... })
```

## Return Value

Returns a `Client<AppRoute>` - a `Proxy` object that mirrors your server route tree.

## Calling Endpoints

### `.read(input?, requestInit?)`

Sends a `GET` request. Input is serialized as `?input=<JSON>` in the query string.

```ts
// No input
const result = await client.status.read();

// With input
const user = await client.user.read({ id: '123' });

// With RequestInit options
const data = await client.user.read(
  { id: '123' },
  {
    headers: { 'X-Trace-Id': 'abc123' },
    signal: AbortSignal.timeout(5000),
    cache: 'no-store'
  }
);
```

**Supported `RequestInit` options:**

| Property      | Type                    | Description                                         |
| ------------- | ----------------------- | --------------------------------------------------- |
| `headers`     | `Record<string,string>` | Per-request headers (merged with init headers)      |
| `signal`      | `AbortSignal`           | Abort signal for cancellation or timeout            |
| `cache`       | `RequestCache`          | Cache mode (`default`, `no-store`, `reload`)        |
| `credentials` | `RequestCredentials`    | Credentials mode (`omit`, `same-origin`, `include`) |

### `.write(input?, requestInit?)`

Sends a `POST` request. Input is serialized as a JSON body.

```ts
// POST with body
const newUser = await client.users.create.write({ name: 'Alice' });

// With request options
await client.users.update.write(
  { id: '1', name: 'Bob' },
  {
    headers: { 'X-Idempotency-Key': 'abc123' },
    signal: AbortSignal.timeout(10000)
  }
);
```

## Examples

### Basic Usage

```ts
import { createClient } from 'doofpi';
import type { AppRoute } from './server';

const client = createClient<AppRoute>({
  url: 'https://api.example.com',
  root: '/api'
});

const users = await client.users.list.read();
const newUser = await client.users.create.write({ name: 'Alice' });
```

### With Global Headers

```ts
const client = createClient<AppRoute>({
  url: 'https://api.example.com',
  root: '/api',
  init: {
    headers: {
      Authorization: 'Bearer token123',
      'X-API-Version': '1'
    }
  }
});
```

### With Abort Signal

```ts
const controller = new AbortController();

const promise = client.longRunning.read(undefined, {
  signal: controller.signal
});

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

## Error Handling

Non-`2xx` responses throw a `DoofpiClientError`:

```ts
import { DoofpiClientError } from 'doofpi';

try {
  await client.user.read({ id: 'invalid' });
} catch (err) {
  if (err instanceof DoofpiClientError) {
    console.error(err.status); // HTTP status code
    console.error(err.message); // Error message
    console.error(err.details); // Optional details
    console.error(err.issues); // ZodIssue[] for validation errors
    console.error(err.error); // Optional underlying error
  }
}
```
