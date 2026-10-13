// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  build: {
    format: "file",
  },
  vite: {
    server: {
      proxy: {
        "/api": "http://localhost:3000",
        "/uploads": "http://localhost:3000",
      },
    },
  },
});
