import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let backendTarget = env.VITE_BACKEND_URL || 'http://localhost:3000'
  if (!backendTarget.startsWith('http://') && !backendTarget.startsWith('https://')) {
    backendTarget = `http://${backendTarget}`
  }
  backendTarget = backendTarget.replace(/\/api\/?$/, '').replace(/\/$/, '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Forward all /api/* requests to the backend server (Railway / local)
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

