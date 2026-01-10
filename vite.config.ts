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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Heavy form & validation
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'forms-vendor';
          }
          // Firebase/Auth
          if (id.includes('node_modules/@supabase')) {
            return 'auth-vendor';
          }
          // Icons
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@icons-pack')) {
            return 'icons-vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Optimize for iOS
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-i18next'],
  },
})
