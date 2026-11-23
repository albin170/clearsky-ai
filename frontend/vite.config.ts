import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts'
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf'
            }
            if (id.includes('html2canvas')) {
              return 'vendor-canvas'
            }
            if (id.includes('lucide-react') || id.includes('canvas-confetti')) {
              return 'vendor-ui'
            }
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
