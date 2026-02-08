import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Generate sourcemaps for production debugging but do not reference them in the bundle.
    // Browsers will not fetch .map files, so they are not exposed to end users.
    // Use the emitted .map files with error tracking (e.g. Sentry) or keep build artifacts to symbolicate stack traces.
    sourcemap: 'hidden',
  },
});
