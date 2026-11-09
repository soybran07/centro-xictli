import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://soybran07.github.io',
  base: '/centro-xictli',
  vite: { plugins: [tailwindcss()] },
});
