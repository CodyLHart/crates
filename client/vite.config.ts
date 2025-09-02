import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/crates/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Set default API URL for production if not provided
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:5050'),
  },
});
