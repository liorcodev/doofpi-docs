---
title: Zod Validation
description: doofpi uses Zod for runtime schema validation on both input and output.
---

# Zod Validation

doofpi uses [Zod](https://zod.dev) for runtime schema validation. You can define schemas for both
**input** (what the client sends) and **output** (what the handler returns).

## Defining Models

Use `.model()` before `.read()` or `.write()` to attach Zod schemas:

```ts
import { z } from 'zod';

endpoint
  .model({
    input: z.object({ id: z.string().uuid() }),
    output: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email()
    })
  })
  .read(async ({ input }) => {
    return await db.users.findById(input.id);
  });
```

Both `input` and `output` are optional - you can define either, both, or neither.

## Input Validation

When a request arrives, doofpi:

1. Parses the input (from query params for `read`, from JSON body for `write`)
2. Runs `schema.safeParse(input)`
3. If validation fails, throws a `ValidationError` (HTTP 400) with detailed Zod error issues
4. If validation passes, passes the typed, parsed value to your handler as `input`

```ts
endpoint
  .model({
    input: z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20)
    })
  })
  .read(async ({ input }) => {
    // input.page and input.limit are numbers, with defaults applied
    return await db.posts.paginate(input.page, input.limit);
  });
```

### Validation Error Response

When input validation fails, the client receives a `400` response:

```json
{
  "message": "Validation Error",
  "issues": [
    {
      "code": "too_small",
      "path": ["page"],
      "message": "Number must be greater than or equal to 1"
    }
  ]
}
```

## Output Validation

doofpi supports optional output validation. When you define an output schema, doofpi **validates the
handler's return value against the schema** before sending it to the client.

```ts
endpoint
  .model({
    input: z.object({ id: z.string() }),
    output: z.object({
      id: z.string(),
      name: z.string()
      // Note: 'password' is not in the output schema
    })
  })
  .read(async ({ input }) => {
    const user = await db.users.findById(input.id);
    // Even if 'user' contains a password field, it will be stripped
    return user;
  });
```

> **Data Safety** - Output validation is a **security feature**. If your handler returns a field not
> in the schema, Zod strips it silently by default. Use `z.object({...}).strict()` to throw a `500`
> error instead of stripping. Either way, the unexpected field never reaches the client.

When output validation fails (with `.strict()` or a type mismatch), the client receives a `500`
response with `issues` describing what the schema rejected:

```json
{
  "message": "Internal Server Error",
  "issues": [
    { "code": "unrecognized_keys", "path": [], "message": "Unrecognized key: 'password'" }
  ],
  "error": "Output validation failed"
}
```

## Complex Schemas

Zod's full power is available:

```ts
const CreatePostInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
  publishAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'published']).default('draft')
});

endpoint.model({ input: CreatePostInput }).write(async ({ input }) => await db.posts.create(input));
```

## Type Inference

Thanks to Zod, handler argument types are fully inferred:

```ts
endpoint
  .model({
    input: z.object({ id: z.string() }),
    output: z.object({ name: z.string() })
  })
  .read(({ input }) => {
    //     ^? { id: string }
    return { name: 'Alice' };
    //       ^? TypeScript checks { name: string } ✓
  });
```

The client also benefits - you get autocomplete for inputs and the return type of every endpoint.

## Models Without Validation

You can skip `.model()` entirely for endpoints that don't need validated I/O:

```ts
// No input, no output schema - handler result is returned as-is
endpoint.read(() => ({ status: 'ok' }));
```
