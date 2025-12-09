import { defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueRouter from "unplugin-vue-router/vite";

export default defineConfig({
  plugins: [vueRouter(), vue(), tailwindcss()],
});
