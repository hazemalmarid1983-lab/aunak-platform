import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Production + Vercel build config — no dev-only API middleware. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
