import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',       // 部署在根域名就用 '/'
  build: {
    outDir: 'dist' // Vercel 預設要抓 dist
  },
})