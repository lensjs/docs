# Express Adapter

The **Express adapter** integrates LensJS into your Express app.

---

## 1. Install Packages

Install the Express adapter:

```bash
npm install @lens/express-adapter @lens/core
```

👉 If you want to use pre-built watcher handlers (e.g., Prisma), also install:

```bash
npm install @lens/watcher-handlers
```

---

## 2. Minimal Setup (with Prisma Query Watcher)

Since the query watcher is required, here’s a minimal setup using Prisma:

```ts
import { lens } from "@lens/express-adapter";
import { createPrismaHandler } from "@lens/watcher-handlers";
import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const port = 3000;
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

app.get("/hello-world", async (_req, res) => {
  await prisma.user.create({ data: { name: "Alice" } });
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

### ✅ Try it out
1. Start your app.  
2. Visit `http://localhost:3000/hello-world` → logs a request + query.  
3. Visit `http://localhost:3000/lens` → open the Lens dashboard.  

---

## 3. Next Steps

- Explore more options in the [Configuration Guide](./configuration.md)  
