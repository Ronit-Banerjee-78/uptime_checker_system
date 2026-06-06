import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/monitors": "http://localhost:7180",
      "/logs": "http://localhost:7180",
      "/health": "http://localhost:7180",
    },
  },
});
