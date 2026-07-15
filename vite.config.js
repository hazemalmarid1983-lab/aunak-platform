import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins = [react()]

  // Local-only API middleware. Load via absolute file URL so Vercel/Rolldown
  // does not statically resolve a missing relative import during `vite build`.
  if (command === 'serve') {
    const pluginPath = path.resolve('./scripts/vite-api-dev-plugin.mjs')
    if (fs.existsSync(pluginPath)) {
      const mod = await import(pathToFileURL(pluginPath).href)
      if (typeof mod.aunakApiDevPlugin === 'function') {
        plugins.push(mod.aunakApiDevPlugin())
      }
    }
  }

  return {
    plugins,
    test: {
      environment: 'node',
      include: ['tests/**/*.test.js'],
    },
  }
})
