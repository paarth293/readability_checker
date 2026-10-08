import { defineConfig } from 'vite';

export default defineConfig({
  base: '/readability_checker/',
  build: {
    target: 'es2022',
    outDir: 'dist',
    minify: 'terser',
    chunkSizeWarningLimit: 100, // 100KB budget as requested
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  worker: {
    format: 'es',
  },
});
