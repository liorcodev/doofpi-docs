---
title: Comparison
description: How doofpi compares to tRPC.
---

# Comparison

How does doofpi compare to tRPC?

## What makes doofpi different

doofpi was built to solve specific pain points when deploying type-safe APIs to edge runtimes and
modern platforms:

| Feature                      | doofpi                                                                                         | tRPC v11                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Adapters/glue code**       | ✓ None - `d.fetch` is native `(Request) => Response`                                           | ✗ Requires runtime-specific adapters (`@trpc/server/adapters/...`)                                               |
| **Per-file type exports**    | ✓ Not needed - types infer across file boundaries                                              | ✗ Each sub-router must `export type RouterName`                                                                  |
| **Typed runtime bindings**   | ✓ `defineEnv<T>()` and `defineExtra<T>()` for platform bindings (KV, D1, R2, ExecutionContext) | ✗ Manual typing in context                                                                                       |
| **Routing performance**      | ✓ O(1) hash-based lookups via `extreme-router`                                                 | Pattern matching with iteration                                                                                  |
| **Global lifecycle hooks**   | ✓ `onRequest`, `onResponse`, `onError` - truly global, applied to every endpoint automatically | ✗ Only `onError` at adapter level; no `onRequest`/`onResponse` global hooks - must use per-procedure middlewares |
| **Dependencies**             | 1 runtime dependency (`extreme-router`), Zod optional                                          | Multiple dependencies, includes internals for batching/links                                                     |
| **Configuration complexity** | Minimal - instantiate, register, done                                                          | Links, transformers, batching config                                                                             |

**In short:** doofpi prioritizes **zero ceremony** and **runtime portability** over advanced
features like batching, streaming, and deep framework integrations.

## The key parallels

If you've used tRPC before, many concepts will feel familiar.

| tRPC concept                                  | doofpi equivalent                        | Notes                                                                     |
| --------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| `procedure`                                   | `EndpointBuilder`                        | The fluent builder for defining a single endpoint                         |
| `router({...})`                               | `d.routes({...})`                        | Composes procedures/builders into a route tree                            |
| `procedure.input(z.schema)`                   | `endpoint.model({ input: z.schema })`    | Attach a Zod input schema                                                 |
| `procedure.output(z.schema)`                  | `endpoint.model({ output: z.schema })`   | Attach a Zod output schema                                                |
| `procedure.meta({...})`                       | `endpoint.meta({...})`                   | Attach metadata to an endpoint                                            |
| `.query(handler)`                             | `endpoint.read(handler)` → `GET`         | Read-only endpoint                                                        |
| `.mutation(handler)`                          | `endpoint.write(handler)` → `POST`       | Write endpoint                                                            |
| `createCallerFactory` / `createTRPCClient`    | `createClient<AppRoute>({...})`          | Typed client                                                              |
| Each sub-router must `export type RouterType` | ✓ Not needed - types infer automatically | In doofpi, composition is transparent - no per-file type exports required |

## Choose doofpi when

- You deploy to **edge runtimes** (Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy) or
  **modern runtimes** (Bun, Deno) - `d.fetch` is a **zero-adapter** native `(Request) => Response`
  handler that works everywhere Web Standards are supported
- You want **zero boilerplate** - no adapters to install, no link chains to configure, no per-file
  type exports when splitting routes across files, no generated code
- You need **typed platform bindings** - `defineEnv<>()` and `defineExtra<>()` give you
  **compile-time safety** for runtime-specific APIs (Cloudflare KV/D1/R2, Bun's Server, etc.)
- You value **simplicity and directness** - straightforward routing, explicit read/write semantics,
  minimal configuration
- You want **maximum runtime portability** - write once, deploy **anywhere** without changing a
  single line of server code

## Choose tRPC when

- You are building a **React or Next.js** app and want **deep framework integration** with TanStack
  Query v5 and React Server Components (tRPC v11 has first-class support for prefetching and RSC
  hydration)
- You need **real-time** features - WebSocket subscriptions or **Server-Sent Events** (tRPC v11)
- You need **streaming responses** from queries/mutations via `httpBatchStreamLink` (tRPC v11)
- You need to send **FormData, Blob, or binary payloads** (tRPC v11 supports non-JSON content types)
- You want to use **Valibot or ArkType** for validation instead of Zod
- You need **request batching** or a custom **link/transformer pipeline** (e.g. superjson for
  Date/BigInt serialization)
- You're building a traditional server-rendered app and don't need edge deployment flexibility
