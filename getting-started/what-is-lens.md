# What is Lens?

**LensJS** is a lightweight, framework-agnostic monitoring toolkit for Node.js.  
It helps you **observe your application in real time** by tracking requests, queries, and custom events — all through a simple and intuitive API.

---

## 🚀 Key Features

- **Lightweight** → minimal overhead, easy to integrate.  
- **Framework Agnostic** → works with any Node.js framework (currently Express and AdonisJS).
- **Extensible** → build custom watchers and adapters on top of `@lens/core`.  
- **Developer-Friendly Dashboard** → inspect requests, queries, and events in your browser.  

---

## ⚙️ How It Works

Lens uses **adapters** to connect to your framework (e.g., Express, AdonisJS).  
These adapters collect and forward data (like requests and queries) to the Lens dashboard, where you can analyze performance and debug issues.

```mermaid
flowchart LR
    A[ Node.js App ] --> B[Adapter]
    B --> C[@lens/core]
    C --> D[Lens Dashboard]
```

---

## 🤔 Why Lens?

Other monitoring tools are often:  
- Too heavy for small/medium projects  
- Tied to a single framework  
- Hard to extend or customize  

**LensJS** solves this by being:  
- **Simple** → fast setup, minimal config  
- **Universal** → works with multiple frameworks  
- **Hackable** → extend with your own adapters & watchers & store

---

## 🙌 Contributing

We welcome contributions!  
- Open an issue if you find a bug or have an idea  
- Submit a PR to improve features or docs  

See the [Contributing Guide](../contributing/dev-setup.md) to get started.

---

## 📄 License

Lens is licensed under the **MIT License**. See the LICENSE file for details.  

---

👨‍💻 Project by [Mohammed Elattar](https://github.com/MohammedElattar).  
⭐ If you find Lens useful, please give it a star on GitHub — it really helps!  
