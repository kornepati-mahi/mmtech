import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Target of the local PHP API. Override with VITE_API_PROXY_TARGET if needed.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          // Split vendor code so repeat visits load from cache.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            icons: ['lucide-react'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Same-origin proxy so the PHP session cookie is sent with every request.
        '/backend': {
          target: apiTarget,
          changeOrigin: true,
        },
        // Uploaded blog images live in <project-root>/uploads and are served by PHP.
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/backend/api'),
        },
      },
    },
  }
})
