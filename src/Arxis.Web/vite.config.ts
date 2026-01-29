import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE_PATH ?? '/',
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5136',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-core': ['@mui/material', '@mui/icons-material'],
            'mui-data': ['@mui/x-data-grid', '@mui/x-date-pickers'],
            'charts': ['recharts'],
            'utils': ['axios', 'dayjs']
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  }
})
