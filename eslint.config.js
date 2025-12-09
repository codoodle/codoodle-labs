import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

import eslintJs from "@eslint/js";
import eslintTs from "@typescript-eslint/eslint-plugin";
import eslintTsParser from "@typescript-eslint/parser";
import eslintImport from "eslint-plugin-import";
import eslintPrettierConfig from "eslint-plugin-prettier/recommended";

import eslintReact from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";

import eslintVue from "eslint-plugin-vue";
import eslintVueParser from "vue-eslint-parser";

export default defineConfig([
  // JavaScript recommended
  eslintJs.configs.recommended,

  // TypeScript recommended
  ...eslintTs.configs["flat/recommended"],

  // Import plugin recommended
  eslintImport.flatConfigs.recommended,
  eslintImport.flatConfigs.typescript,

  // Shared package configuration
  {
    name: "shared",
    files: ["apps/**/*.{js,ts,tsx,vue}", "packages/**/*.{js,ts,tsx,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: ["apps/*/tsconfig.app.json", "packages/*/tsconfig.app.json"],
        },
        node: true,
      },
    },
  },

  // React recommended
  {
    name: "react",
    files: ["apps/react/**/*.{ts,tsx}"],
    extends: [
      eslintReact.configs.flat.recommended,
      eslintReact.configs.flat["jsx-runtime"],
      eslintReactHooks.configs.flat["recommended-latest"],
    ],
    languageOptions: {
      parser: eslintTsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: ["apps/react/tsconfig.app.json"],
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Vue recommended
  {
    name: "vue",
    files: ["apps/vue/**/*.{js,ts,vue}"],
    extends: [eslintVue.configs["flat/recommended"]],
    languageOptions: {
      parser: eslintVueParser,
      parserOptions: {
        parser: eslintTsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },

  // Vue pages exceptions
  {
    name: "vue-pages",
    files: ["apps/vue/src/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },

  // Legacy grid: allow legacy patterns without touching source
  {
    name: "legacy-grid",
    files: ["packages/legacy-grid/**/*.{ts,js}"],
    languageOptions: {
      parser: eslintTsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["packages/legacy-grid/tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off",
    },
  },

  // Prettier recommended
  eslintPrettierConfig,

  // Global ignore patterns
  globalIgnores([
    "**/vite.config.ts",
    "**/*.d.ts",
    "**/dist/**",
    "**/build/**",
    "**/node_modules/**",
    "**/.git/**",
    "**/.vscode/**",
    "**/.idea/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.nuxt/**",
    "**/.cache/**",
    "**/public/mockServiceWorker.js",
    "eslint.config.js",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
  ]),
]);
