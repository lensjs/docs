# AdonisJS Adapter Installation

To get started with the AdonisJS adapter, you'll need to install the `@lens/adonis-adapter` package.

## Installation

```bash
npm install @lens/core @lens/adonis-adapter
```

## Configuration

After installing the package, run the following command to create the configuration file and register the service provider:

```bash
node ace configure @lens/adonis-adapter
```

This will create a `config/lens.ts` file and add the `LensServiceProvider` to your `adonisrc.ts` file.

Next, you'll need to register the `LensMiddleware` as a global middleware in your `start/kernel.ts` file:

```typescript
// start/kernel.ts
import router from '@adonisjs/core/services/router'
const app = () => import('@adonisjs/core/app')

router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('@lens/adonis-adapter/lens_middleware')
])
```