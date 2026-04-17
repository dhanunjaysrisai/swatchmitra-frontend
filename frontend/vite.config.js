import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, './images'),
      '@videos': path.resolve(__dirname, './videos'),
    },
  },
  server: {
    host: true,
    port: 5173,
    middlewareMode: false,
  },
})

