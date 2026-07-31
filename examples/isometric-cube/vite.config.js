import { defineConfig } from 'vite';
import flatland from '@bernhardfritz/flatland/vite-plugin';

export default defineConfig({
  plugins: [
    flatland(),
  ],
});