import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'App'
      }
    }
  },
  plugins: [react()],
  server: {
    proxy: {
      // AniList GraphQL API
      '/anilist': {
        target: 'https://graphql.anilist.co',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/anilist/, ''),
        secure: true,
        headers: {
          'Origin': 'https://anilist.co',
          'Referer': 'https://anilist.co/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // GraphQL için gerekli header'ları ekle
            if (req.method === 'POST') {
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Accept', 'application/json');
            }
          });
        }
      },
      // Add more proxies here as needed
    }
  }
})
