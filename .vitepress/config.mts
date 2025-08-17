import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Lens",
  description:
    "A Nodejs Framework Agonstic Package To Monitor Your Application",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Getting Started",
        collapsed: true,
        items: [
          { text: "What is Lens?", link: "/getting-started/what-is-lens" },
          { text: "Quick Start", link: "/getting-started/quick-start" },
        ],
      },
      {
        text: "Adapters",
        collapsed: false,
        items: [
          {
            text: "Express",
            items: [
              { text: "Installation", link: "/adapters/express/installation" },
              { text: "Configuration", link: "/adapters/express/configuration" },
            ],
          },
          {
            text: "AdonisJS",
            items: [
              { text: "Installation", link: "/adapters/adonis/installation" },
            ],
          },
        ],
      },
      {
        text: "Watchers",
        collapsed: true,
        items: [
          { text: "Query Watcher", link: "/handlers/query" },
        ],
      },
      {
        text: "Extending",
        collapsed: true,
        items: [{ text: "Using @lens/core", link: "/extending/core" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/MohammedElattar/lens" },
    ],
  },
});
