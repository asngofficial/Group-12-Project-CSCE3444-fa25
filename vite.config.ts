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
    rollupOptions: {
      output: {
        // ensure all assets have relative paths so GitHub Pages finds them
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|gif|svg|ico)$/.test(assetInfo.name ?? '')) {
            return 'assets/images/[name][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name ?? '')) {
            return 'assets/fonts/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})
