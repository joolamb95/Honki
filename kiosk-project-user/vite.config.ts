import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define:{
    global:"window"
  },
  server: {
    proxy: {
      "/honki/chat": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "http://localhost:8080",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8080", // 백엔드 주소
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // API 경로 변경
      },
    },
  },
})

