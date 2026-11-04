import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1", // Принудительно привязываемся к локальному IP-адресу петли
    port: 5173,
    strictPort: true,
  },
});
