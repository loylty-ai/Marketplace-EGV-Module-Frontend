import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import visualizer from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/dev/egv-frontend/',
  plugins: [react(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: "treemap"
    })
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.dev.loyltyone.com/egv-backend',
        // target: 'http://localhost:9100',
        changeOrigin: true
      }
    }
  }
})
