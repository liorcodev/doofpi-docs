---
title: Client
description: The doofpi client is a fully typed Proxy that mirrors your server route structure.
---

# Client

The doofpi client is a **fully typed Proxy**. It mirrors your server's route structure and gives you
autocomplete and type checking for every endpoint.

## Creating a Client

```ts
import { createClient } from 'doofpi';
import type { AppRoute } from './server';

const client = createClient<AppRoute>({
  url: 'http://localhost:3000',
  root: '/api' // Must match what the server was configured with
});
```

## Calling Endpoints

Access endpoints by chaining keys, then call `.read()` or `.write()`:

```ts
// Server route: { users: { list: endpoint.read(...), create: endpoint.write(...) } }

const users = await client.users.list.read();
const newUser = await client.users.create.write({ name: 'Alice' });
```

### Read (GET)

```ts
// No input
const result = await client.status.read();

// With input - sent as ?input={"id":"123"}
const user = await client.user.read({ id: '123' });

// With custom request options
const data = await client.data.read(undefined, {
  headers: { 'X-Custom': 'value' },
  signal: AbortSignal.timeout(5000)
});
```

### Write (POST)

```ts
// Sends JSON data as POST request
const user = await client.users.create.write({ name: 'Alice', email: 'alice@example.com' });
```

## Configuration Options

```ts
const client = createClient<AppRoute>({
  url: 'https://api.example.com',
  root: '/api',

  // Initial request options applied to all requests
  init: {
    headers: {
      Authorization: 'Bearer my-token',
      'X-API-Version': '1'
    }
  }
});
```

### Dynamic Headers

To compute headers dynamically at request time, build your client inside a function:

```ts
function getClient() {
  return createClient<AppRoute>({
    url: 'https://api.example.com',
    root: '/api',
    init: {
      headers: {
        Authorization: `Bearer ${getTokenFromStorage()}`
      }
    }
  });
}
```

## Per-Request Options

Options from `createClient` init and per-request options are **merged**, with per-request options
taking precedence:

```ts
const res = await client.profile.read(undefined, {
  headers: { 'X-Trace-Id': crypto.randomUUID() }
});
```

## Error Handling

If the server returns a non-`2xx` response, the client throws a `DoofpiClientError`:

```ts
import { DoofpiClientError } from 'doofpi';

try {
  const user = await client.user.read({ id: 'invalid' });
} catch (err) {
  if (err instanceof DoofpiClientError) {
    console.error(err.status); // e.g. 404
    console.error(err.message); // e.g. "User invalid not found"
    console.error(err.details); // extra details (if any)
    console.error(err.issues); // ZodIssue[] (if validation error)
    console.error(err.error); // underlying error (if any)
  }
}
```

## Cross-Package Usage

The most common pattern is server and client in separate packages:

```
apps/
  server/    ← registers routes, exports AppRoute type
  web/       ← imports AppRoute type, creates client
packages/
  api-types/ ← optional: re-export AppRoute for sharing
```
