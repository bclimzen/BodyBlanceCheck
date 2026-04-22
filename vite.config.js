import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '/BodyBlanceCheck/',
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    https: true,
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
});
