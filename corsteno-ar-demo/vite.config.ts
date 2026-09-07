import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";

export default defineConfig(({ command, mode }) => {
  const isDev = command === "serve";
  const localHttp = mode === "local-http";

  const keyPath = new URL("./certs/key.pem", import.meta.url);
  const certPath = new URL("./certs/cert.pem", import.meta.url);

  const hasLocalCerts =
    existsSync(keyPath) &&
    existsSync(certPath);

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    server:
      isDev && hasLocalCerts && !localHttp
        ? {
            host: "0.0.0.0",
            https: {
              key: readFileSync(keyPath),
              cert: readFileSync(certPath),
            },
          }
        : {
            host: "0.0.0.0",
            ...(localHttp ? { port: 5175, strictPort: true } : {}),
          },
  };
});
