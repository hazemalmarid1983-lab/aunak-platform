import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { aunakApiDevPlugin } from './scripts/vite-api-dev-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aunakApiDevPlugin()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
