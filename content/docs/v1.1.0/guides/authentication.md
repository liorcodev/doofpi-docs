---
title: Authentication & Authorization
description:
  Learn how to implement authentication and role-based access control using doofpi's middleware and
  metadata system.
---

# Authentication & Authorization

This guide shows you how to implement authentication and authorization patterns using doofpi's
[context and middleware](/docs/guides/context-and-middleware) system.

## Basic Authentication Middleware

The simplest approach is to create a middleware that directly modifies context:

```ts
const authEndpoint = d.endpointBuilder.middleware(async ({ req, ctx, throwError }) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throwError({ status: 401, message: 'Unauthorized' });

  const user = await verifyJwt(token);
  if (!user) throwError({ status: 401, message: 'Unauthorized' });

  ctx.user = user;
});

const appRoute = d.routes({
  me: authEndpoint.read(async ({ ctx }) => {
    // ctx.user is guaranteed by middleware
    return await ctx.db.users.findById(ctx.user.id);
  }),
  profile: authEndpoint.read(({ ctx }) => ctx.user),
  settings: authEndpoint.read(({ ctx }) => ctx.user.settings)
});
```

This works well for simple apps where all protected routes have the same requirements.

## Role-Based Access Control (RBAC)

For more complex apps with different access levels, use the **smart middleware pattern** - define
metadata that describes auth requirements, then write one middleware that reacts to it.

### Step 1: Define Auth Metadata

```ts
type Meta = {
  auth?: {
    required: boolean;
    roles?: ('admin' | 'user')[];
  };
};

const d = new Doofpi({ root: '/api' }).defineMeta<Meta>().createContext(async ({ req }) => ({
  db: createDbClient(),
  user: {} as User // shape declared, populated by middleware
}));
```

### Step 2: Write Smart Authorization Middleware

```ts
const baseEndpoint = d.endpointBuilder.middleware(async ({ req, meta, ctx, throwError }) => {
  // Skip auth if not required
  if (!meta?.auth?.required) return;

  // Authenticate
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throwError({ status: 401, message: 'Unauthorized' });

  const user = await verifyJwt(token).catch(() => null);
  if (!user) throwError({ status: 401, message: 'Unauthorized' });

  ctx.user = user;

  // Check roles
  if (meta.auth.roles && !meta.auth.roles.includes(user.role)) {
    throwError({ status: 403, message: 'Forbidden' });
  }
});
```

All auth logic is centralized in one place. The middleware reads `meta.auth` to decide what to
enforce.

### Step 3: Create Specialized Builders

Use `.defaultMeta()` to create endpoint builders with different default auth requirements:

```ts
// Public - no auth required by default
const publicEndpoint = baseEndpoint;

// Protected - any authenticated user
const protectedEndpoint = baseEndpoint.defaultMeta({
  auth: { required: true, roles: ['user', 'admin'] }
});

// Admin only
const adminEndpoint = baseEndpoint.defaultMeta({
  auth: { required: true, roles: ['admin'] }
});
```

### Step 4: Use Specialized Builders in Routes

Your routes become declarative and self-documenting:

```ts
const appRoute = d.routes({
  // Public routes
  status: publicEndpoint.read(() => ({ ok: true })),
  health: publicEndpoint.read(() => ({ status: 'healthy' })),

  // User routes (authenticated)
  profile: protectedEndpoint.read(({ ctx }) => ctx.user),
  posts: {
    list: protectedEndpoint.read(async () => await db.posts.findAll()),
    create: protectedEndpoint
      .model({ input: z.object({ title: z.string(), body: z.string() }) })
      .write(async ({ input, ctx }) => await db.posts.create({ ...input, authorId: ctx.user.id }))
  },

  // Admin routes
  admin: {
    users: adminEndpoint.read(async () => await db.users.findAll()),
    banUser: adminEndpoint
      .model({ input: z.object({ id: z.string() }) })
      .write(async ({ input }) => await db.users.ban(input.id))
  }
});
```

## Per-Endpoint Override

Use `.meta()` to override or extend default metadata for specific endpoints:

```ts
const appRoute = d.routes({
  // Allow partners to access this endpoint
  partnerData: protectedEndpoint
    .meta({ auth: { required: true, roles: ['user', 'admin', 'partner'] } })
    .read(() => getPartnerData()),

  // Public endpoint with custom metadata
  login: publicEndpoint
    .meta({ rateLimit: 5 })
    .model({ input: z.object({ email: z.string(), password: z.string() }) })
    .write(async ({ input }) => {
      const token = await authenticateUser(input);
      return { token };
    })
});
```

## Organizing Auth Builders

Export your builders from a shared file for consistency across your project:

```ts
// doofpi.ts
import Doofpi from 'doofpi';
import type { Meta, User } from './types';

export const d = new Doofpi({ root: '/api' })
  .defineMeta<Meta>()
  .defineEnv<Env>()
  .createContext(async ({ env }) => ({
    db: createDbClient(env.DATABASE_URL),
    user: {} as User // shape declared, populated by middleware
  }));

const baseEndpoint = d.endpointBuilder.middleware(authMiddleware);

export const publicEndpoint = baseEndpoint;
export const protectedEndpoint = baseEndpoint.defaultMeta({
  auth: { required: true, roles: ['user', 'admin'] }
});
export const adminEndpoint = baseEndpoint.defaultMeta({
  auth: { required: true, roles: ['admin'] }
});
```

Then import and use in your routes:

```ts
// routes/users.ts
import { protectedEndpoint, adminEndpoint } from './doofpi';

export const usersRoute = {
  me: protectedEndpoint.read(({ ctx }) => ctx.user),
  list: adminEndpoint.read(async () => await db.users.findAll())
};
```
