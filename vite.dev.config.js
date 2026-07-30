import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.js'
import { aunakApiDevPlugin } from './scripts/vite-api-dev-plugin.mjs'

/** Local dev — mounts /api/* via scripts/vite-api-dev-plugin.mjs (excluded from Vercel). */
export default mergeConfig(base, defineConfig({
  plugins: [aunakApiDevPlugin()],
}))
