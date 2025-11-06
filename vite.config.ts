import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 👇 Must match your GitHub repo name exactly (case-sensitive)
  base: '/Group-12-Project-CSCE3444-fa25/',

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  build: {
    target: 'esnext',
    outDir: 'build',
    assetsDir: 'assets',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
  },

  server: {
    port: 3000,
    open: true,
  },
})
