import { defineConfig } from 'vite';
import fl from '@bernhardfritz/flatland/vite-plugin';

export default defineConfig({
  plugins: [
    fl(),
  ],
});