import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function normalizeModulePath(id: string): string {
  return id.replaceAll("\\", "/");
}

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const modulePath = normalizeModulePath(id);

          if (modulePath.includes("/node_modules/")) {
            if (
              modulePath.includes("/react/") ||
              modulePath.includes("/react-dom/")
            ) {
              return "vendor-react";
            }

            return "vendor";
          }

          if (modulePath.includes("/src/game/preserve/")) {
            return "game-preserve";
          }

          if (modulePath.includes("/src/game/components/")) {
            return "game-ui";
          }
        },
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
