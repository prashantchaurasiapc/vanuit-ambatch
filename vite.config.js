import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Live Railway URL (Commented out):
  // let backendTarget = 'https://feisty-beauty-production-2f61.up.railway.app'
  
  // Localhost backend target (Fastify server on port 3000)
  let backendTarget = env.VITE_BACKEND_URL || 'http://localhost:3000'
  if (!backendTarget.startsWith('http://') && !backendTarget.startsWith('https://')) {
    backendTarget = `http://${backendTarget}`
  }
  backendTarget = backendTarget.replace(/\/api\/?$/, '').replace(/\/$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Forward all /api/* requests to the backend server (Fastify on localhost:3000)
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
