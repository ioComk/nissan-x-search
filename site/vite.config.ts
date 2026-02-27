import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: "./",
  // dev時は docs/ を静的ファイルルートにして data/ を配信、build時は public/ を使用
  publicDir: command === "serve" ? "../docs" : "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../docs",
    emptyOutDir: false,
  },
}));
