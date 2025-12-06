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
    files: ["packages/**/*.{js,ts,tsx,vue}"],
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
          project: "packages/*/tsconfig.app.json",
        },
        node: true,
      },
    },
  },

  // React recommended
  {
    name: "react",
    files: ["packages/react/**/*.{ts,tsx}"],
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
        project: ["packages/react/tsconfig.app.json"],
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Vue recommended
  {
    name: "vue",
    files: ["packages/vue/**/*.{js,ts,vue}"],
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
    files: ["packages/vue/src/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
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
