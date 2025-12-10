import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  base: "/static/",
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:56789/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
