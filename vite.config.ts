import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const repositoryName = 'my-vite-app'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'] // предотвращает дублирование
  },
  base: `/${repositoryName}/`,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000, 
    open: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})