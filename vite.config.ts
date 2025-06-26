// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    hmr: { overlay: true },
    watch: { usePolling: true, interval: 100 }
  }
});

// // vite.config.ts
// export default defineConfig({
//   server: { host: "127.0.0.1", port: 5173 },
//   // … 
// });
