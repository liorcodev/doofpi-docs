---
title: Routing
description:
  doofpi uses a dot-notation path system to map your TypeScript object structure to complete static
  endpoint paths.
---

# Routing

doofpi uses a **dot-notation path system** to map your TypeScript object structure to URL paths.
Your route tree is just a plain object - each complete object path becomes a single static endpoint.

## Defining Routes

Use `d.routes()` to define a route object. This is a type-helper that enables correct TypeScript
inference:

```ts
const appRoute = d.routes({
  users: endpoint.read(async () => await db.users.findAll()),
  posts: endpoint.read(async () => await db.posts.findAll())
});
```

Then register the route to mount it:

```ts
d.register(appRoute); // Mounts at root (e.g., /api)
```

This creates:

| Endpoint | URL              |
| -------- | ---------------- |
| `users`  | `GET /api.users` |
| `posts`  | `GET /api.posts` |

> **URL Format** - doofpi uses a **dot-separated path** format (`/api.users`), not slash-separated
> (`/api/users`). Each complete object path like `api.users` maps to a single static endpoint - this
> is not segment-based routing. The entire path is treated as one endpoint, not as individual
> segments.

## Nested Routes

You can nest route objects to create hierarchies:

```ts
const appRoute = d.routes({
  auth: {
    login: endpoint.write(({ input }) => createSession(input)),
    logout: endpoint.write(({ ctx }) => destroySession(ctx.user)),
    me: endpoint.read(({ ctx }) => ctx.user)
  },
  workspace: {
    list: endpoint.read(async () => await db.workspaces.findAll()),
    create: endpoint
      .model({ input: z.object({ name: z.string() }) })
      .write(async ({ input }) => await db.workspaces.create(input))
  }
});
```

| Endpoint           | URL                          |
| ------------------ | ---------------------------- |
| `auth.login`       | `POST /api.auth.login`       |
| `auth.logout`      | `POST /api.auth.logout`      |
| `auth.me`          | `GET /api.auth.me`           |
| `workspace.list`   | `GET /api.workspace.list`    |
| `workspace.create` | `POST /api.workspace.create` |

## Splitting Routes into Files

As your API grows, split routes into separate files for organization:

```ts
// routes/auth.ts
import { endpoint } from '../doofpi';
import { z } from 'zod';

const authRoute = {
  login: endpoint
    .model({ input: z.object({ email: z.string(), password: z.string() }) })
    .write(({ input }) => authenticate(input)),
  logout: endpoint.write(({ ctx }) => destroySession(ctx.user)),
  me: endpoint.read(({ ctx }) => ctx.user)
};

export default authRoute;
```

```ts
// routes/app.ts
import { d } from '../doofpi';
import authRoute from './auth';
import workspaceRoute from './workspace';

const appRoute = d.routes({
  auth: authRoute,
  workspace: workspaceRoute
});

export type AppRoute = typeof appRoute;
export default appRoute;
```

> **Tip** - Organize your server code in a `doofpi.ts` file exporting the instance,
> `endpointBuilder`, and `routes` helper. This scales well as the project grows.

```ts
// doofpi.ts
import Doofpi from 'doofpi';

export const d = new Doofpi({ root: '/api' });
export const endpoint = d.endpointBuilder;
export const routes = d.routes;
```
