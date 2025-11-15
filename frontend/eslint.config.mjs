import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],

    ignores: [
      "jest.setup.js",
      "tailwind.config.ts",
      "next.config.mjs",
      "public/mockServiceWorker.js",
      ".next/**",
      "node_modules/**",
    ],

    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off", // Allow empty interfaces for shadcn/ui components
      "@typescript-eslint/no-require-imports": "off", // Allow require in config files
    },
  },
]);