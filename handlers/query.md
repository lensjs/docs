# Query Watcher Handlers

The `@lens/watcher-handlers` package provides **pre-built and
customizable handlers** for capturing and processing database queries
observed by `@lens/core`.\
These handlers let you monitor queries (SQL, MongoDB, etc.) and
visualize them in the **Lens UI**.

------------------------------------------------------------------------

## 🚀 Installation

Install via npm:

``` bash
npm install @lens/watcher-handlers
```

------------------------------------------------------------------------

## 🔌 Supported Integrations

We provide ready-to-use integrations for **Prisma**, **Kysely**, and
**Sequelize**.

### 1. Prisma

Capture queries from **Prisma** using `createPrismaHandler`.

**Requirements:**

``` bash
npm install @prisma/client
```

**Example (Express + Prisma):**

``` ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient({ log: ["query"] });

await lens({
  app,
  handlers: {
    query: {
      enabled: true,
      handler: createPrismaHandler({
        prisma,
        provider: "mysql",
      }),
    },
  },
});

app.listen(3000);
```

------------------------------------------------------------------------

### 2. Kysely

Capture queries from **Kysely** using `createKyselyHandler`.

**Requirements:**

``` bash
npm install kysely mysql2
```

**Example (Express + Kysely):**

``` ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { Kysely, MysqlDialect } from "kysely";
import mysql from "mysql2";
import { createKyselyHandler, watcherEmitter } from "@lens/watcher-handlers";

const app = express();

await lens({
  app,
  handlers: {
    query: {
      enabled: true,
      handler: createKyselyHandler({ provider: "mysql" }),
    },
  },
});

interface Database {
  user: { name: string };
}

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

app.get("/add-user", async (_req, res) => {
  await db.insertInto("user").values({ name: "John Doe" }).execute();
  res.send("User added");
});

app.listen(3000);
```

------------------------------------------------------------------------

### 3. Sequelize

Capture queries from **Sequelize** using `createSequelizeHandler`.

**Requirements:**

``` bash
npm install sequelize
```

**Example (Express + Sequelize):**

``` ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { Sequelize, DataTypes, Model } from "sequelize";
import { createSequelizeHandler, watcherEmitter } from "@lens/watcher-handlers";

const app = express();

await lens({
  app,
  handlers: {
    query: {
      enabled: true,
      handler: createSequelizeHandler({ provider: "mysql" }),
    },
  },
});

const sequelize = new Sequelize("DB_NAME", "DB_USER", "DB_PASSWORD", {
  host: "localhost",
  dialect: "mysql",
  benchmark: true,
  logQueryParameters: true,
  logging: (sql: string, timing?: number) => {
    watcherEmitter.emit("sequelizeQuery", { sql, timing });
  },
});

class User extends Model {}
User.init(
  { name: { type: DataTypes.STRING(100), allowNull: false } },
  { sequelize, modelName: "User", tableName: "users", timestamps: false },
);

await sequelize.sync();

app.get("/add-user", async (_req, res) => {
  await User.create({ name: "John Doe" });
  res.send("User added");
});

app.listen(3000);
```

------------------------------------------------------------------------

## 🛠 Creating a Custom Handler

If you're using another ORM/query builder, you can write your own
handler.

### Handler Basics

-   Return a `QueryWatcherHandler`.
-   Call `onQuery` whenever you capture a query.
-   Use `lensUtils` to:
    -   `interpolateQuery(sql, params)` → inject parameters into SQL.
    -   `formatSqlQuery(query)` → format SQL for better UI display.
    -   `now()` → timestamp.

### Example: Custom Kysely Handler

``` ts
import express from "express";
import { lens } from "@lens/express-adapter";
import { type QueryWatcherHandler } from "@lens/watcher-handlers";
import { lensUtils, LensALS, lensEmitter } from "@lens/core";
import { EventEmitter } from "events";
import { Kysely, MysqlDialect, type LogEvent } from "kysely";
import mysql from "mysql2";

const app = express();

// create a custom EventEmitter to capture queries
const eventEmitter = new EventEmitter();

interface Database {
  users: { name: string };
}

const db = new Kysely<Database>({
  dialect: new MysqlDialect({
    pool: mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    }),
  }),
  logging: (sql: string, timing?: number) => {
    eventEmitter.emit("customQuery", { sql, timing });
  },
});

function customQueryHandler(): QueryWatcherHandler {
  const kyselyHandlerCallback = (store?: LensALS) =>
    eventEmitter.on("customQuery", async (payload: { sql: string; timing?: number }) => {
      const queryPayload = {
        query: lensUtils.formatSqlQuery(payload.sql),
        duration: `${payload.timing ?? 0} ms`,
        type: "mysql",
        createdAt: lensUtils.now(),
      };
      lensEmitter.emit("query", { ...queryPayload, store });
    });

  return {
    listen: (store) => () => kyselyHandlerCallback(store),
    clean: (store) => () => eventEmitter.removeListener("customQuery", kyselyHandlerCallback(store)),
  };
}

await lens({
  app,
  handlers: {
    query: { enabled: true, handler: customQueryHandler() },
  },
});

app.get("/add-user", async (_req, res) => {
  await db.insertInto("users").values({ name: "John Doe" }).execute();
  res.send("User added");
});

app.listen(3000);
```

------------------------------------------------------------------------

## ✅ Summary

-   Use built-in handlers for Prisma, Kysely, and Sequelize.\
-   Or create a custom handler for your own DB client.\
-   Queries are automatically captured and displayed in the Lens UI.
