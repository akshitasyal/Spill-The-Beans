import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable css code splitting
    cssCodeSplit: true,
    // Reduce inline asset limit to encourage parallel fetching of optimized items
    assetsInlineLimit: 4096,
    // Enable chunk size warnings limit adjustment
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Manual chunking to divide dependencies and pages
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group core react & framework libs
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
              return 'vendor-core';
            }
            // Group Clerk auth
            if (id.includes('@clerk')) {
              return 'vendor-clerk';
            }
            // Group animation library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Group icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Default vendor fallback
            return 'vendor-libs';
          }
        }
      }
    }
  }
})
