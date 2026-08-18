import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    // Integration tests read DATABASE_URL/JWT_SECRET etc. from .env — load
    // it explicitly so `npm run test:integration` works on a clean shell.
    setupFiles: ["dotenv/config"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});