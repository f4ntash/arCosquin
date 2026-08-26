import { defineConfig } from "vite";
import { readFileSync } from "node:fs";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    https: {
      key: readFileSync(new URL("./certs/key.pem", import.meta.url)),
      cert: readFileSync(new URL("./certs/cert.pem", import.meta.url)),
    },
  },
});