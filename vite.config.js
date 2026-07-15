import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-safe config only. Local API middleware is optional via:
// scripts/vite-api-dev-plugin.mjs (not imported here — avoids Vercel UNRESOLVED_IMPORT).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
