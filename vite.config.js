import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend', // Set the root to the frontend directory
  server: {
    port: 3000, // Set the port to 3000
    open: true, // Open the browser automatically
    host: true // Listen on all addresses
  },
  build: {
    outDir: '../dist', // Output directory relative to the root (frontend)
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend')
    }
  }
});
