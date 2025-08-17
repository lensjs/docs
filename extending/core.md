# @lens/core

The `@lens/core` package is the heart of Lens. It provides the core functionality for monitoring and debugging your applications.

## Key Features

- **Extensible Architecture**: Lens is designed to be extensible, allowing you to create custom adapters, stores, and watchers.
- **Framework Agnostic**: The core package is framework agnostic, allowing it to be used with any Node.js framework.
- **Database Monitoring**: Lens provides powerful tools for monitoring database queries and performance.
- **Real-time UI**: Lens includes a real-time UI for visualizing the data collected from your application.

## Core Concepts

- **`Lens`**: The main class that orchestrates the different components of Lens. This is the entry point for configuring and starting Lens.
- **`LensAdapter`**: An abstract class for creating adapters to integrate Lens with different web frameworks. Adapters are responsible for hooking into the framework's request/response lifecycle and serving the Lens UI.
- **`LensStore`**: An abstract class for creating stores to persist the data collected by Lens. The default store uses `better-sqlite3`.
- **`LensWatcher`**: A class for creating watchers to monitor various aspects of your application, such as database queries and HTTP requests.