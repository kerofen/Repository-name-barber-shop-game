import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: false,
  },
  plugins: [],
  resolve: {
    alias: {
      phaser: "phaser/dist/phaser.js",
    },
  },
})
