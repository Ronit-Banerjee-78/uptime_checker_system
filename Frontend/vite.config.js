import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development, production, etc.)
  const env = process.env;

  const target = env.VITE_API_URL || "http://localhost:7180";
  const port = env.VITE_PORT || 5173;

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        "/monitors": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/logs": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/health": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
