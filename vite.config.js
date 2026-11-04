import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Live Railway URL (Active):
  let backendTarget = env.VITE_BACKEND_URL || 'https://vanuit-ambacht-backend-production.up.railway.app'
  if (!backendTarget.startsWith('http://') && !backendTarget.startsWith('https://')) {
    backendTarget = `https://${backendTarget}`
  }
  backendTarget = backendTarget.replace(/\/api\/?$/, '').replace(/\/$/, '')

  return {
    plugins: [react()],
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      proxy: {
        // Forward all /api/* requests to the backend server (Railway / Fastify)
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
