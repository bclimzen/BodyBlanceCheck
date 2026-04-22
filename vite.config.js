import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  base: '/BodyBlanceCheck/',
  plugins: [react(), ...(isDev ? [basicSsl()] : [])],
  server: {
    host: true,
    port: 5173,
    https: true,
  },
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },
});
