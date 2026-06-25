import { defineConfig } from 'vite';
import goWasm from '@bernhardfritz/two/rollup-plugin-go-wasm';

export default defineConfig({
  plugins: [
    goWasm(),
  ],
});