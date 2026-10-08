import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    minify: 'terser', // or esbuild
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
