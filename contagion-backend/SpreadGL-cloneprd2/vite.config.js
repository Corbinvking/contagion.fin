import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Important for Docker
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://simulation-backend:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'http://simulation-backend:5000',
        ws: true
      }
    }
  }
}); 