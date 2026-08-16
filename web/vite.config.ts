import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './src'),
      '#': path.resolve(import.meta.dirname, './public'),
      '##': path.resolve(import.meta.dirname, '../docs'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://38.54.89.52:80',
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
  },
})
