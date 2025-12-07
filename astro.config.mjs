import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

export default defineConfig({
  srcDir: 'src',
  output: 'server', // <--- invece di 'static'
  server: {
    port: 4321
  },
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: netlify(),
});
