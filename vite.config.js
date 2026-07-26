import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { aunakApiDevPlugin } from './scripts/vite-api-dev-plugin.mjs'

// Local /api/* middleware for enrollment + UDI while developing.
// Vercel production uses api/ routes directly (this plugin is not bundled there).
export default defineConfig({
  plugins: [react(), aunakApiDevPlugin()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
