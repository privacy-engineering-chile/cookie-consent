import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: new URL("./src/index.ts", import.meta.url).pathname,
      name: "CookieConsentCL",
      formats: ["es", "iife"],
      fileName: (format) => `cookie-consent-cl.${format === "es" ? "es" : "iife"}.js`
    },
    rollupOptions: {
      output: {
        exports: "named"
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: []
  }
});
