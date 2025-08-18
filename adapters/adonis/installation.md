# AdonisJS Adapter Installation

The AdonisJS adapter makes it easy to integrate Lens into your AdonisJS app and start monitoring requests, queries, and more.

---

## 1. Install the Package

```bash
npm install @lens/adonis-adapter
```

---

## 2. Run the Configure Command

Lens provides a setup command that wires everything for you:

```bash
node ace configure @lens/adonis-adapter
```

This will automatically:

- Create `config/lens.ts`
- Add the `LensServiceProvider` to `adonisrc.ts`
- Register the Lens middleware in `start/kernel.ts`
- Add Lens environment variables validation inside `start/env.ts`

---

## 3. Verify the Setup

### `adonisrc.ts`
```ts
providers: [
  // ... other providers
  () => import('@lens/adonis-adapter/lens_provider'),
],
```

### `start/kernel.ts`
```ts
import router from '@adonisjs/core/services/router'

router.use([
  // ... other middlewares
  () => import('@lens/adonis-adapter/lens_middleware'),
])
```

### `start/env.ts`
```ts
import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // ... other env variables

  /*
  |--------------------------------------------------------------------------
  | Lens variables
  |--------------------------------------------------------------------------
  */
  LENS_BASE_PATH: Env.schema.string.optional(),
  LENS_ENABLED: Env.schema.boolean.optional(),
  LENS_ENABLE_QUERY_WATCHER: Env.schema.boolean.optional(),
  LENS_ENABLE_REQUEST_WATCHER: Env.schema.boolean.optional(),
})
```

---

## 4. Lens Config File

The `config/lens.ts` file is where you customize Lens behavior:

```ts
import env from '#start/env'
import { defineConfig } from '@lens/adonis-adapter'

const lensConfig = defineConfig({
  appName: env.get('APP_NAME', 'AdonisJs'),
  enabled: env.get('LENS_ENABLED', false),
  path: env.get('LENS_BASE_PATH', 'lens'),

  ignoredPaths: [], // regex patterns to ignore (Lens routes are ignored by default)
  onlyPaths: [], // regex patterns to only watch (ignore all other routes)

  watchers: {
    requests: env.get('LENS_ENABLE_REQUEST_WATCHER', true),
    queries: env.get('LENS_ENABLE_QUERY_WATCHER', true),
  },

  // Optional authentication
  isAuthenticated: async (ctx) => {
    return await ctx.auth?.check()
  },

  // Optional user resolver
  getUser: async (ctx) => {
    const user = ctx.auth?.user
    if (!user) return null

    return {
      id: user.$primaryKeyValue,
      name: user.name,
      email: user.email,
    }
  },
})

export default lensConfig
```

---

## ✅ Try It Out

1. Start your AdonisJS app:
   ```bash
   node ace serve --watch
   ```
2. Open any route in your app to generate requests/queries.  
3. Visit `http://localhost:3333/lens` to explore the Lens dashboard.

That’s it — Lens is now monitoring your AdonisJS app!
