---
title: Error Handling
description:
  doofpi provides built-in error classes that map to HTTP status codes and a global error handler
  hook.
---

# Error Handling

doofpi provides a built-in error system through the `throwError` function and a global error handler
hook for customizing error responses.

## Built-In Error Classes

```ts
import { DoofpiError } from 'doofpi';
```

### Error Types

| Error Name              | Default Status | When It's Thrown                      |
| ----------------------- | -------------- | ------------------------------------- |
| `DoofpiError`           | Custom         | Base class for any HTTP error         |
| `ValidationError`       | `400`          | Input validation failure (automatic)  |
| _(output mismatch)_     | `500`          | Output validation failure (automatic) |
| `NotFoundError`         | `404`          | No route matches (automatic)          |
| `MethodNotAllowedError` | `405`          | Wrong HTTP method (automatic)         |
| `InternalServerError`   | `500`          | Unexpected errors (automatic)         |

> **Note:** The specific error classes (`ValidationError`, `NotFoundError`, etc.) are internal - use
> the `throwError` function in handlers instead.

### Using `throwError` in Handlers

All handlers receive a `throwError` function that throws a `DoofpiError` and never returns:

```ts
throwError({
  status: 403,
  message: 'Forbidden',
  details: { reason: 'Insufficient permissions' } // Optional
});
```

| Property  | Type                 | Required | Description                  |
| --------- | -------------------- | -------- | ---------------------------- |
| `status`  | `number`             | ✓        | HTTP status code             |
| `message` | `string`             | ✓        | Human-readable error message |
| `issues`  | `z.core.$ZodIssue[]` | -        | Optional Zod issues          |
| `details` | `unknown`            | -        | Optional extra details       |
| `error`   | `unknown`            | -        | Optional underlying error    |

### Using `DoofpiError` Class

You can also throw `DoofpiError` directly (outside handlers):

```ts
import { DoofpiError } from 'doofpi';

throw new DoofpiError({ status: 403, message: 'Forbidden' });
```

## Throwing in Handlers

```ts
const appRoute = d.routes({
  user: endpoint
    .model({ input: z.object({ id: z.string() }) })
    .read(async ({ input, throwError }) => {
      const user = await db.users.findById(input.id);

      if (!user) throwError({ status: 404, message: `User ${input.id} not found` });

      if (user.isBanned) throwError({ status: 403, message: 'Account suspended' });

      return user;
    })
});
```

## Throwing in Middleware

Errors thrown in middleware propagate the same way - the handler **does not run**:

```ts
const endpoint = d.endpointBuilder.middleware(async ({ req, throwError }) => {
  if (!req.headers.get('Authorization')) {
    throwError({ status: 401, message: 'Unauthorized' });
  }
});
```

> For auth patterns that rely on a context user, see
> [Context & Middleware →](/docs/guides/context-and-middleware).

## Global Error Handler

Use `.onError()` to hook into every error - log it, format the response, or return extra data:

```ts
d.onError(({ error, req, url, path, headers, env, ctx, extra }) => {
  console.error(`[${req.method}] ${path}`, error.message);

  // Return an ErrorShape to customize the response
  return {
    status: error.status,
    message: error.message,
    details: ctx.user?.role === 'admin' ? error.details : undefined
  };
});
```

If `onError` returns an object with both `message` and `status`, it replaces the default error
response. The `status` property is used as the HTTP status code, and the rest becomes the response
body.

### Handler Arguments

| Property  | Type         | Description                                                             |
| --------- | ------------ | ----------------------------------------------------------------------- |
| `error`   | `ErrorShape` | The error object with `message`, `status`, `issues`, `details`, `error` |
| `req`     | `Request`    | The raw Web `Request`                                                   |
| `url`     | `URL`        | The parsed URL object                                                   |
| `path`    | `string`     | The matched route path                                                  |
| `headers` | `Headers`    | Response headers (can be modified)                                      |
| `env`     | `Env`        | Environment variables or runtime bindings                               |
| `ctx`     | `Ctx`        | Your context object                                                     |
| `extra`   | `Extra`      | Runtime-specific data                                                   |

## Handling Unknown Errors

If a handler throws something that is not a `DoofpiError`, doofpi wraps it in an
`InternalServerError` (status `500`) and sets `error.error` to the original thrown value. Inside
`onError`, `error` is typed as `ErrorShape` - check `error.status === 500` to detect these cases:

```ts
d.onError(({ error }) => {
  if (error.status === 500) {
    console.error('Unexpected error:', error.error); // Original caught error
  }

  return { status: error.status, message: 'Something went wrong' };
});
```

> **Note:** The return value must include `status` alongside `message` for doofpi to use it as the
> response. A return without `status` is treated as `void` and the default error response is used
> instead.

## Default Error Response

Without a custom `onError` handler, doofpi returns:

```json
{ "message": "User not found" }
```

For input validation errors:

```json
{
  "message": "Validation Error",
  "issues": [
    { "code": "invalid_type", "path": ["name"], "message": "Expected string, received number" }
  ]
}
```

For output validation errors (handler returned data that doesn't match the output schema):

```json
{
  "message": "Internal Server Error",
  "issues": [
    { "code": "unrecognized_keys", "path": [], "message": "Unrecognized key: 'password'" }
  ],
  "error": "Output validation failed"
}
```
