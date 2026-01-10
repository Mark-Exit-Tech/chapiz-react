import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Better iOS Safari compatibility
    hmr: {
      overlay: true,
    },
  },
  // Environment variable prefix
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  // Build optimizations
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // Enable tree-shaking
    lib: undefined,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'ui-vendor': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
          ],
          'icons-vendor': [
            'lucide-react',
            '@icons-pack/react-simple-icons',
          ],
          'auth-vendor': [
            '@supabase/supabase-js',
          ],
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
          ],
          'animation-vendor': [
            'framer-motion',
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-i18next'],
    exclude: ['canvas-confetti', 'react-share', 'date-fns'],
  },
})
