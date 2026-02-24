import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const basePath = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
