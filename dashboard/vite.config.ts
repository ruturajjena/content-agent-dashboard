import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// Tailwind v4 runs as a Vite plugin (no separate postcss config needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Recharts pulls React through nested deps; dedupe prevents a second
    // React instance (which causes "Invalid hook call").
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
