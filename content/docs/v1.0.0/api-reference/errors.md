---
title: Errors
description: Built-in error classes for doofpi - server-side throwing and client-side catching.
---

# Errors

doofpi exports error classes for server-side throwing and client-side catching.

## Server-Side Errors

### `throwError` Function

The recommended way to throw errors in handlers is using the `throwError` function:

```ts
endpoint.read(({ throwError }) => {
  throwError({
    status: 403,
    message: 'Forbidden',
    details: { reason: 'Insufficient permissions' }
  });
});
```

### `DoofpiError`

Base error class. Can be imported and thrown directly:

```ts
import { DoofpiError } from 'doofpi';

throw new DoofpiError({
  status: 403,
  message: 'Forbidden',
  details: { reason: 'Insufficient permissions' }
});
```

| Property  | Type                 | Required | Description                  |
| --------- | -------------------- | -------- | ---------------------------- |
| `status`  | `number`             | ✓        | HTTP status code             |
| `message` | `string`             | ✓        | Human-readable error message |
| `issues`  | `z.core.$ZodIssue[]` | -        | Optional Zod issues          |
| `details` | `unknown`            | -        | Optional extra details       |
| `error`   | `unknown`            | -        | Optional underlying error    |

---

### Internal Error Types

The following errors are thrown automatically by doofpi. You cannot import them, but they appear in
`onError` handlers:

#### `ValidationError`

Thrown automatically when Zod **input** validation fails. HTTP `400`.

> **Note:** Output validation failures throw a plain `DoofpiError` with status `500`, not a
> `ValidationError`. The response body includes `message: 'Internal Server Error'` and an `issues`
> array with the Zod schema violations.

Response body:

```json
{
  "message": "Validation Error",
  "issues": [{ "code": "custom", "path": ["email"], "message": "Email already taken" }]
}
```

#### `NotFoundError`

HTTP `404`. Thrown when no route matches the request path.

#### `MethodNotAllowedError`

HTTP `405`. Thrown automatically when:

- A read endpoint receives POST
- A write endpoint receives GET
- An endpoint receives other unsupported methods (e.g., PUT, DELETE, etc.)

#### `InternalServerError`

HTTP `500`. Thrown when output validation fails or when wrapping any non-`DoofpiError` thrown in a
handler. Access the original error via `error.error`, or for output validation failures, access Zod
issues via `error.issues`.

```ts
d.onError(({ error, req, url, path, headers, env, ctx, extra }) => {
  if (error.status === 500 && error.error) {
    console.error('Cause:', error.error); // The original thrown value
  }
});
```

---

## Client-Side Error

### `DoofpiClientError`

Thrown by `createClient` when the server returns a non-`2xx` response.

```ts
import { DoofpiClientError } from 'doofpi';

try {
  await client.user.read({ id: 'invalid' });
} catch (err) {
  if (err instanceof DoofpiClientError) {
    err.status; // HTTP status code (number)
    err.message; // Error message (string)
    err.details; // Optional details from server
    err.issues; // z.core.$ZodIssue[] if it was a validation error
    err.error; // Optional underlying error
  }
}
```

| Property  | Type                 | Description                        |
| --------- | -------------------- | ---------------------------------- |
| `status`  | `number`             | HTTP status code from the server   |
| `message` | `string`             | Error message                      |
| `details` | `unknown`            | Optional extra details from server |
| `issues`  | `z.core.$ZodIssue[]` | Zod issues (if `ValidationError`)  |
| `error`   | `unknown`            | Optional underlying error          |

## Type Utilities

### `InferContext`

Extracts the context type from a typed `Doofpi` instance:

```ts
import type { InferContext } from 'doofpi';
import { d } from './doofpi';

type AppContext = InferContext<typeof d>;
// { user: User, db: DbClient }
```

### `MiddlewareHandler`

Type for standalone middleware functions:

```ts
import type { MiddlewareHandler, InferContext } from 'doofpi';

type AppMeta = { auth?: { required: boolean } };
type AppContext = InferContext<typeof d>;
type Env = { DATABASE_URL: string };

const authMiddleware: MiddlewareHandler<AppMeta, Env, AppContext> = async ({ ctx, throwError }) => {
  if (unauthorized) throwError({ status: 401, message: 'Unauthorized' });
};
```
