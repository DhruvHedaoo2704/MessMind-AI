import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/MessMind-AI/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
