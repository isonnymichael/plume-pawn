import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/conduit': {
        target: 'https://explorer-plume-testnet-1.t.conduit.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/conduit/, '')
      }
    }
  }
})
