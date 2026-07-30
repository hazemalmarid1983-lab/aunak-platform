import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local /api/* middleware for enrollment + UDI while developing.
// Vercel production uses api/ routes directly — dev plugin loaded only on `vite` serve.
export default defineConfig(async ({ command }) => {
  const plugins = [react()]
  if (command === 'serve') {
    const { aunakApiDevPlugin } = await import('./scripts/vite-api-dev-plugin.mjs')
    plugins.push(aunakApiDevPlugin())
  }
  return {
    plugins,
    test: {
      environment: 'node',
      include: ['tests/**/*.test.js'],
    },
  }
})
