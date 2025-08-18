# Query Watcher Handlers

The `@lens/watcher-handlers` package offers pre-built and customizable **handlers** for processing database queries captured by `@lens/core`. These handlers allow you to monitor SQL or other database queries and view them in the Lens UI.

---

## 📦 Installation

To get started, install the package using your preferred package manager:

```bash
npm install @lens/watcher-handlers
```

---

## Supported Integrations

We provide out-of-the-box support for popular query builders and ORMs.

### Prisma

Integrate Lens with **Prisma** using the `createPrismaHandler`.

**Requirements:**
- `@prisma/client` must be installed in your project.

```bash
npm install @prisma/client
```

**Example (Express + Prisma):**

```typescript
import express from "express";
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

await lens({
  app,
  queryWatcher: {
    enabled: true,
    handler: createPrismaHandler({
      prisma,
      provider: "sql", // "sql", "mongodb", etc.
    }),
  },
});

app.listen(3000);
```

### Kysely

Integrate Lens with **Kysely** using the `createKyselyHandler`.

**Requirements:**
- `kysely` must be installed. This example uses `mysql2`.

```bash
npm install kysely mysql2
```

**Example (Express + Kysely):**

```typescript
import express from "express";
import { lens } from "@lens/express-adapter";
import { Kysely, MysqlDialect } from "kysely";
import mysql from "mysql2";
import { createKyselyHandler, watcherEmitter } from "@lens/watcher-handlers";

const app = express();

// Lens setup
await lens({
  app,
  queryWatcher: {
    enabled: true,
    handler: createKyselyHandler(),
  },
});

// Define your DB schema
interface Database {
  user: {
    name: string;
  };
}

// Setup Kysely with MySQL
const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: "DB_HOST",
      user: "DB_USER",
      password: "DB_PASSWORD",
      database: "DB_NAME",
    }),
  }),
  log(event) {
    if (event.level === "query") {
      watcherEmitter.emit("kyselyQuery", {
        event,
        date: new Date().toISOString(),
      });
    }
  },
});

// Example route
app.get("/add-user", async (_req, res) => {
  await db.insertInto("user").values({ name: "John Doe" }).execute();
  res.send("User added");
});

app.listen(3000);
```

### Sequelize

Integrate Lens with **Sequelize** using the `createSequelizeHandler`.

**Requirements:**
- `sequelize` must be installed.

```bash
npm install sequelize
```

**Example (Express + Sequelize):**

```typescript
import express from "express";
import { lens } from "@lens/express-adapter";
import { Sequelize, DataTypes, Model } from "sequelize";
import { createSequelizeHandler, watcherEmitter } from "@lens/watcher-handlers";

const app = express();

await lens({
  app,
  queryWatcher: {
    enabled: true,
    handler: createSequelizeHandler(),
  },
});

// Initialize Sequelize
const sequelize = new Sequelize("lens", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  benchmark: true, // Required to measure query execution time
  logQueryParameters: true, // Required to capture query parameters
  logging: (sql: string, timing?: number) => {
    // Emit event to notify the handler
    watcherEmitter.emit("sequelizeQuery", {
      sql,
      timing,
    });
  },
});

// Define a model
class User extends Model {}
User.init(
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
  },
  { sequelize, modelName: "User", tableName: "users", timestamps: false },
);

await sequelize.sync();

// Example route
app.get("/add-user", async (_req, res) => {
  await User.create({ name: "John Doe" });
  res.send("User added");
});

app.listen(3000);
```

---

## Creating a Custom Handler

If you use a different database tool or have custom logging requirements, you can create your own handler.

### Handler Structure

A custom handler is a function that returns a `QueryWatcherHandler`. This handler receives an `onQuery` callback, which you invoke whenever a query event occurs.

**Key Considerations:**
- **Filter Unwanted Queries**: Ignore irrelevant queries (e.g., Prisma’s `COMMIT` and `BEGIN`).
- **Interpolate Bindings**: Use `lensUtils.interpolateQuery(sql, params)` to inject parameters into the query string.
- **Format for Readability**: Use `lensUtils.formatSqlQuery(query)` to improve UI display.
- **Specify Query Type**: Set the `type` property (e.g., `sql`, `mongodb`) to customize rendering in the UI.

### Example: Custom Kysely Handler

This example demonstrates how to capture Kysely queries using an `EventEmitter` and report them to Lens.

```typescript
import express from "express";
import { lens } from "@lens/express-adapter";
import { type QueryWatcherHandler } from "@lens/watcher-handlers";
import { lensUtils } from "@lens/core";
import { EventEmitter } from "events";
import { Kysely, MysqlDialect, type LogEvent } from "kysely";
import mysql from "mysql2";

const app = express();
const eventEmitter = new EventEmitter();

// Database schema
interface Database {
  users: { name: string };
}

// Setup Kysely + MySQL
const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    }),
  }),
  log(event) {
    if (event.level === "query") {
      eventEmitter.emit("db:query", {
        date: new Date().toISOString(),
        event,
      });
    }
  },
});

// Custom query watcher handler
function customQueryHandler(): QueryWatcherHandler {
  return async ({ onQuery }) => {
    eventEmitter.on(
      "db:query",
      async (payload: { date: string; event: LogEvent }) => {
        const sql = lensUtils.interpolateQuery(
          payload.event.query.sql,
          payload.event.query.parameters as any[],
        );

        await onQuery({
          query: lensUtils.formatSqlQuery(sql),
          duration: `${payload.event.queryDurationMillis.toFixed(1)} ms`,
          type: "sql",
          createdAt: payload.date,
        });
      },
    );
  };
}

// Lens setup
await lens({
  app,
  queryWatcher: {
    enabled: true,
    handler: customQueryHandler(),
  },
});

// Example route
app.get("/add-user", async (_req, res) => {
  await db.insertInto("users").values({ name: "John Doe" }).execute();
  res.send("User added");
});

app.listen(3000);
```