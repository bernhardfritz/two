import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/two.ts'),
      name: 'two',
      // the proper extensions will be added
      fileName: 'two',
      formats: ['es'],
    },
    target: 'esnext',
  },
  worker: {
    format: 'es',
  },
})