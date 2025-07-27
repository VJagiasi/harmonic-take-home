import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
          ],
          animation: ['framer-motion'],
          icons: ['lucide-react'],
          utilities: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          api: ['axios'],
        },
      },
    },
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 300,
    // Enable minification and tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'], // Remove specific console methods
      },
    },
  },
});
