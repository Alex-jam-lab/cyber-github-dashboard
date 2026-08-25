import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // GitHub Pages 项目页面需要以仓库名作为 base 前缀
  base: '/cyber-github-dashboard/',
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
})
