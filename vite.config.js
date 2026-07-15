import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins = [react()]
  // Dev-only API middleware — never load on Vercel production builds
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
