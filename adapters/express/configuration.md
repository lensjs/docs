# Express Adapter Configuration

The `lens` function accepts a single configuration object that controls how Lens integrates with your Express app.  
This guide provides a clear reference and practical examples to help you set it up quickly.

---

## Configuration Overview

Below are all the available options you can pass to `lens()`:

| Option                 | Type                   | Required | Default             | Description                                                                 |
| ---------------------- | ---------------------- | -------- | ------------------- | --------------------------------------------------------------------------- |
| **`app`**              | `Express`              | Yes      | -                   | Your Express application instance.                                          |
| **`handlers`**         | `ExpressWatcherHandlers` | No      | `undefined`         | Configuration for watcher handlers.                                         |
| **`requestWatcherEnabled`** | `boolean`          | No       | `true`              | Whether to enable the request watcher.                                      |
| **`path`**             | `string`               | No       | `/lens`             | The URL path where the Lens dashboard will be available.                    |
| **`appName`**          | `string`               | No       | `Lens`              | Display name for your app in the dashboard.                                 |
| **`store`**            | `Store`                | No       | `BetterSqliteStore` | Storage engine for persisting Lens data.                                    |
| **`isAuthenticated`**  | `Promise<boolean>`     | No       | `undefined`         | Checks if the current request is authenticated before accessing Lens.       |
| **`getUser`**          | `Promise<UserEntry>`   | No       | `undefined`         | Returns the user associated with the current request.                       |
| **`ignoredPaths`**     | `RegExp[]`             | No       | `[]`                | Array of regex patterns to ignore (Lens routes are ignored by default).     |
| **`onlyPaths`**        | `RegExp[]`             | No       | `[]`                | Array of regex patterns to watch exclusively (ignore all other routes).     |

---

## Example: Prisma Query Watcher

Here’s how to enable query watching with **Prisma**:

```ts
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const prisma = new PrismaClient({ log: ["query"] });

await lens({
  app,
  path: "/lens", // Dashboard available at http://localhost:3000/lens
  appName: "My Express App",
  handlers: {
    query: {
      enabled: true, // Enable query watching
      handler: createPrismaHandler({
        prisma,
        provider: "sql", // "sql", "mongodb", etc.
      }),
    },
  },
});
```

---

## Complete Example: Full Configuration

This snippet shows **all available options**, with inline comments:

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
  handlers: {
    query: {
      enabled: true, // Enable query watching
      handler: createPrismaHandler({
        prisma,
        provider: "sql", // Database provider type ("sql", "mongodb", etc.)
      }),
    },
  },

  // (Optional) Enable request watcher (default: true)
  requestWatcherEnabled: true,

  // (Optional) Path for the Lens dashboard
  path: "/lens", // Default: "/lens"

  // (Optional) Display name for your app in the dashboard
  appName: "My Express App", // Default: "Lens"

  // (Optional) Store implementation (default: BetterSqliteStore)
  store: new DefaultDatabaseStore(),

  // (Optional) Paths to ignore
  ignoredPaths: [/^\/health/, /^\/metrics/],

  // (Optional) Paths to exclusively watch
  onlyPaths: [/^\/api/],

  // (Optional) Authentication check before accessing Lens
  isAuthenticated: async (req) => {
    const jwtToken = req.headers["authorization"]?.split(" ")[1];
    return jwtToken === getValidJwtToken(jwtToken, jwtSecret);
  },

  // (Optional) Attach user information to Lens events/logs
  getUser: async (req) => {
    return {
      id: "123",
      name: "Jane Doe",
      email: "jane@example.com",
    };
  },
});
```
