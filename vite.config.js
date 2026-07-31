import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/flatland.ts'),
      name: 'flatland',
      // the proper extensions will be added
      fileName: 'flatland',
      formats: ['es'],
    },
    target: 'esnext',
  },
  worker: {
    format: 'es',
  },
})