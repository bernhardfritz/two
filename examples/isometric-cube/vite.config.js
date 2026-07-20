import { defineConfig } from 'vite';
import two from '@bernhardfritz/two/vite-plugin';

export default defineConfig({
  plugins: [
    two(),
  ],
});