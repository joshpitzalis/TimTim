import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["src/features/**/__tests__/content/**/*.test.ts"] } });
