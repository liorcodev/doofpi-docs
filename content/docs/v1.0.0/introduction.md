---
title: Introduction
description:
  doofpi is a modern, lightweight TypeScript framework for building fully type-safe APIs with no
  code generation.
---

# Introduction

**doofpi** is a lightweight TypeScript framework based on web standards for building end-to-end
type-safe APIs - no code generation, no build steps, no separate schema files to maintain

## How It Works

Define your API on the server, export only the **type**, and consume it on the client with full
inference:

```ts
// server.ts
export type AppRoute = typeof appRoute; // ← the only thing shared

// client.ts
const client = createClient<AppRoute>(options);
const res = await client.greeting.write({ name: 'Developer' }); // fully typed ✓
```

Server and client stay in sync - enforced by the compiler, not by discipline.

## What's Included

| Feature                       | Details                                                   |
| ----------------------------- | --------------------------------------------------------- |
| **Type-safe client**          | Proxy-based, mirrors your route tree with full inference  |
| **Input & output validation** | Optional Zod schemas on both ends                         |
| **Middleware**                | Per-endpoint chains with typed context, meta, and headers |
| **Lifecycle hooks**           | `onRequest`, `onResponse`, `onError`                      |
| **Web Standard compatible**   | Bun, Cloudflare Workers, Vercel, Netlify, Deno, and more  |
| **Zero codegen**              | No CLI, no generated files, no build step                 |

## Quality & Testing

doofpi is thoroughly tested with **100% code coverage** across all core functionality, including
routing, validation, middleware, error handling, context management, and client operations.

## Explore the Docs

- [Quick Start](/docs/quick-start) - get a typed API running in minutes
- [Core Concepts](/docs/core-concepts/routing) - routing, read/write, validation, client
- [Guides](/docs/guides/context-and-middleware) - context, middleware, error handling, runtime setup
- [API Reference](/docs/api-reference/doofpi-class) - full `Doofpi`, `EndpointBuilder`,
  `createClient` reference
- [Comparison](/docs/comparison) - how doofpi compares to tRPC
