---
outline: deep
---

# Express Adapter Configuration

The `lens` function accepts a single configuration object that controls how Lens integrates with your Express app. This guide provides a clear reference and practical examples to help you set it up quickly.

---

## Configuration Overview

Below are all the available options you can pass to `lens()`.

| Option            | Type                    | Required | Default             | Description                                                                 |
| ----------------- | ----------------------- | -------- | ------------------- | --------------------------------------------------------------------------- |
| **`app`**         | `Express`               | Yes      | -                   | Your Express application instance.                                          |
| **`queryWatcher`**| `QueryWatcherConfig`    | Yes      | -                   | Configuration for the database query watcher.                               |
| **`requestWatcherEnabled`**        | `boolean`                | No       | `true`             |  Weither to enable request watcher or not.                    |
| **`path`**        | `string`                | No       | `/lens`             | The URL path where the Lens dashboard will be available.                    |
| **`appName`**     | `string`                | No       | `Lens`              | The display name for your application in the dashboard.                     |
| **`store`**       | `Store`                 | No       | `BetterSqliteStore` | The storage engine used for persisting Lens data.                           |
| **`isAuthenticated`** | `Promise<boolean>` | No       | `undefined`         | Determines if the current request is authenticated before accessing Lens.   |
| **`getUser`**     | `Promise<UserEntry>`    | No       | `undefined`         | Returns the user associated with the current request.                       |
| **`ignoredPaths`**     | `RegExp[]`    | No       | `[]`         | Array of regex patterns to ignore (Lens routes are ignored by default).
| **`onlyPaths`**     | `RegExp[]`    | No       | `[]`         | Array of regex patterns to only watch (ignore all other routes).

---

## Query Watcher

The `queryWatcher` option enables monitoring of database queries. It’s especially useful for debugging and performance insights.

| Option       | Type                   | Required | Default | Description                                                                 |
| ------------ | ---------------------- | -------- | ------- | --------------------------------------------------------------------------- |
| **`enabled`**| `boolean`              | No       | `false` | Set to `true` to enable query watching.                                     |
| **`handler`**| `QueryWatcherHandler`  | Yes      | -       | Function that processes query data (e.g., from Prisma, Knex, etc.).         |

You are not limited to the built-in handlers.  
You can also implement your own **custom query watcher handler** to support other ORMs, databases, or logging strategies.  
See [Custom Query Watcher Handler](/handlers/query#creating-a-custom-handler) for details.

---

## Example: Prisma Query Watcher

Here’s how to enable query watching with Prisma:

```ts
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const prisma = new PrismaClient({ log: ["query"] });

await lens({
  app,
  path: "/lens", // Dashboard will be served at http://localhost:3000/lens
  appName: "My Express App",
  queryWatcher: {
    enabled: true, // Either to enable or disable query watching
    handler: createPrismaHandler({
      prisma,
      provider: "sql", // query type (e.g., "sql", "mongodb"), used for query formatting
    }),
  },
});
```

## Complete Example: Full Configuration

The following snippet shows __all available__ options in one place, with inline comments:

```ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";
import { DefaultDatabaseStore } from "@lens/store"; // Example store implementation

const app = express();
const prisma = new PrismaClient({ log: ["query"] });

await lens({
  // (Required) Your Express app instance
  app,

  // (Required) Query watcher configuration
  queryWatcher: {
    enabled: true, // Turn on query watching
    handler: createPrismaHandler({
      prisma,
      provider: "sql", // Database provider type (e.g., "sql", "mongodb"), used for query formatting
    }),
  },

  requestWatcherEnabled: true, // Turn on request watcher

  // (Optional) The path where the Lens dashboard will be available
  path: "/lens", // Default: "/lens"

  // (Optional) Display name for your application in the dashboard
  appName: "My Express App", // Default: "Lens"

  // (Optional) Store to persist Lens data
  store: new DefaultDatabaseStore(), // which maps to BetterSqliteStore by default, but can be any store
 
  // (Optional) Array of regex patterns to ignore (Lens routes are ignored by default)
  ignoredPaths: [],

  // (Optional) Array of regex patterns to only watch (ignore all other routes)
  onlyPaths: [],

  // (Optional) Authentication check before accessing Lens
  isAuthenticated: async (req) => {
    // Implement your own authentication checking logic
    // For example: only allow if a header token matches
    const jwtToken = req.headers["authorization"]?.split(" ")[1];

    return jwtToken === getValidJwtToken(jwtToken, jwtSecret);
  },

  // (Optional) Attach user information to Lens events/logs
  getUser: async (req) => {
    // Example: attach user from session or request
    return {
      id: "123", 
      name: "Jane Doe",
      email: "jane@example.com",
    };
  },
});
```
