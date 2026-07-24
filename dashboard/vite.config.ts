import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// Tailwind v4 runs as a Vite plugin (no separate postcss config needed).
// `base` is set for the production build so assets resolve under the GitHub
// Pages project path (username.github.io/content-agent-dashboard/).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/content-agent-dashboard/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    // Recharts pulls React through nested deps; dedupe prevents a second
    // React instance (which causes "Invalid hook call").
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}));
