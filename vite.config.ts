// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/lodash-es') ||
            id.includes('node_modules/zod')
          ) {
            return 'utils-vendor';
          }
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform/')
          ) {
            return 'form-vendor';
          }
          if (
            id.includes('node_modules/@base-ui/') ||
            id.includes('node_modules/class-variance-authority') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge')
          ) {
            return 'ui-vendor';
          }
        },
      },
    },
  },
});
