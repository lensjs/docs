# Query Watcher Handlers

The `@lens/watcher-handlers` package provides pre-built and customizable **handlers** for processing database queries collected by the watchers in `@lens/core`.  

These handlers let you capture queries (SQL or other) and display them in the Lens monitoring UI.

---

## 📦 Installation

```bash
npm install @lens/watcher-handlers
```

---

## Built-in Prisma Integration

If you’re using **Prisma**, you can plug it in directly with the provided `createPrismaHandler`.

### Requirements
- Install `@prisma/client` in your project.

```bash
npm install @prisma/client
```

### Example (Express + Prisma)

```ts
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
      provider: "sql", // query type ("sql", "mongodb", etc.)
    }),
  },
});

// Your application code here
app.listen(3000);
```

---

## Creating a Custom Handler

Sometimes you need to integrate with a different database (e.g., **Kysely**, **Knex**) or a custom logging system.  
In that case, you can create your own handler.

### Handler Type

A custom handler must return a `QueryWatcherHandler` function.  
That function receives an `onQuery` callback, which you call whenever a query event happens.

### ⚠️ Things to Consider
- **Ignore unwanted queries** → e.g., Prisma’s `COMMIT` and `BEGIN`.  
- **Interpolate SQL bindings** → use `lensUtils.interpolateQuery(sql, params)` to inject parameter values.  
- **Format queries for UI readability** → use `lensUtils.formatSqlQuery(query)`.  
- **Query type** → Based on executed query type (e.g., sql, mongodb, etc.), you can customize the UI display.

---

## 💡 Example: Kysely with MySQL

This example shows how to capture queries from **Kysely**, forward them via an `EventEmitter`, and report them to Lens.

```ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { type QueryWatcherHandler } from "@lens/watcher-handlers";
import { lensUtils } from "@lens/core";
import { EventEmitter } from "events";
import { Kysely, MysqlDialect, type LogEvent } from "kysely";
import mysql from "mysql2";

const app = express();
const port = 3000;

// EventEmitter for query events
export const eventEmitter = new EventEmitter();

// Database schema
interface Database {
  users: {
    name: string;
  };
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

// Custom query watcher
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
          duration: `${payload.event.queryDurationMillis.toFixed(1)} ms`, // rounded to 1 decimal
          type: "sql", // Kysely is SQL-based
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```
