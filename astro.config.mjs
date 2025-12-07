import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  output: 'server', // <--- invece di 'static'
  server: {
    port: 4321
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
