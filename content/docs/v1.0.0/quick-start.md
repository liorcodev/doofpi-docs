---
title: Quick Start
description: Get a fully type-safe API running in under 5 minutes.
---

# Quick Start

Get a fully type-safe API running in under 5 minutes.

> This guide uses **Bun**, but doofpi works on any runtime that supports Web Standard
> `Request`/`Response` APIs.

## Installation

::InstallTabs{package="doofpi"}
::

**Optional: Add Zod** for input/output validation and type inference:

::InstallTabs{package="zod"}
::

Zod (v4+) is used with `.model()` to define input/output schemas - the client infers types from
these schemas.

---

## Step 1: Create the Server

```ts
// server.ts
import Doofpi from 'doofpi';
import { z } from 'zod';

// Create a doofpi instance with a root path
const d = new Doofpi({ root: '/api' });

// Get the endpoint builder - the fluent interface for defining endpoints
const endpoint = d.endpointBuilder;

// Define your routes
const appRoute = d.routes({
  greeting: endpoint.read(() => 'Hello, Developer!'), // GET - simple read endpoint
  welcome: endpoint // POST - write endpoint with input/output validation
    .model({
      input: z.object({ name: z.string() }),
      output: z.object({ message: z.string() })
    })
    .write(({ input }) => ({ message: `Welcome, ${input.name}!` }))
});

// Register the route (mounts it at the root path)
d.register(appRoute);

// Export ONLY the type
export type AppRoute = typeof appRoute;

// Export the fetch handler - compatible with Bun, Workers, Deno
export default { fetch: d.fetch.bind(d) };
```

Start the server with Bun:

```bash
bun run server.ts
```

---

## Step 2: Create the Client

```ts
// client.ts
import { createClient } from 'doofpi';
import type { AppRoute } from './server'; // Import TYPE only

const client = createClient<AppRoute>({
  url: 'http://localhost:3000',
  root: '/api' // Must match the server's root
});

// GET - calls /api.greeting
const greeting = await client.greeting.read();
console.log(greeting); // "Hello, Developer!"

// POST - calls /api.welcome
// TypeScript enforces { name: string } and returns { message: string }
const welcome = await client.welcome.write({ name: 'liorcodev' });
console.log(welcome.message); // "Welcome, liorcodev!"
```

---

## What's Next?

- [Routing →](/docs/core-concepts/routing) - Learn how routes and nested routes work
- [Read & Write →](/docs/core-concepts/read-and-write) - Understand the HTTP semantics
- [Zod Validation →](/docs/core-concepts/zod-validation) - Deep dive into input/output validation
- [Context & Middleware →](/docs/guides/context-and-middleware) - Core concepts for dependency
  injection and request interception
- [Authentication & Authorization →](/docs/guides/authentication) - Build secure APIs with
  role-based access control
