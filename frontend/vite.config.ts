import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("node_modules") === -1) {
            return undefined;
          }

          if (id.indexOf("react-router-dom") !== -1 || id.indexOf("react-router") !== -1) {
            return "router-vendor";
          }

          if (id.indexOf("react-dom") !== -1 || id.indexOf("react/") !== -1) {
            return "react-vendor";
          }

          if (id.indexOf("jspdf") !== -1) {
            return "jspdf-vendor";
          }

          if (id.indexOf("html2canvas") !== -1) {
            return "html2canvas-vendor";
          }

          if (id.indexOf("dompurify") !== -1) {
            return "dompurify-vendor";
          }

          return undefined;
        },
      },
    },
  },
});