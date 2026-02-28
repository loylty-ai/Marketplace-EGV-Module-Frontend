import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL ? `${process.env.VITE_BASE_URL}/` : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://k8s-ingressn-ingressn-09f0faf155-fc4a3bcb6620c60e.elb.ap-south-1.amazonaws.com/dev/egv-backend',
        // target: 'http://localhost:9100',
        changeOrigin: true
      }
    }
  }
})
