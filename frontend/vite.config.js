import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Polyfill Node's `global` for sockjs-client (CJS library)
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    host: true,
    /* https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    }, */
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/ws-wallet': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
