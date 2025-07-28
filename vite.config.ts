import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: "127.0.0.1",  // Keep explicit IP for consistency
  //   port: 5173,
  //   hmr: {
  //     protocol: "ws",   // Explicitly set WebSocket protocol
  //     host: "127.0.0.1",// Match server host
  //     clientPort: 5173, // Ensure client uses same port
  //     overlay: true
  //   },
  //   watch: {
  //     usePolling: true,
  //     interval: 100
  //   }
  // }
  server: {
  host: "localhost",
  port: 5173,
  hmr: {
    protocol: "ws",
    host: "localhost", 
    clientPort: 5173,
    overlay: true
  },
  watch: {
    usePolling: true,
    interval: 100
  }
}

});