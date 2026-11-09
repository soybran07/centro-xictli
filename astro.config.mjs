import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { plataforma } from './src/config/plataforma.ts';

// Política de seguridad de contenido (CSP): el navegador solo ejecuta los
// scripts del propio sitio y solo se conecta a Supabase. Astro calcula solo
// los hashes de cada script y estilo y agrega la etiqueta a cada página.
const supabase = plataforma.supabaseUrl ? [plataforma.supabaseUrl.replace(/\/$/, '')] : [];

export default defineConfig({
  site: 'https://soybran07.github.io',
  base: '/centro-xictli',
  vite: { plugins: [tailwindcss()] },
  // Sin resaltado de código: Shiki usa estilos en línea que la CSP bloquearía.
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' https://fonts.gstatic.com",
        `connect-src 'self' ${supabase.join(' ')}`.trim(),
        'frame-src https://www.youtube-nocookie.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      styleDirective: { resources: ["'self'", 'https://fonts.googleapis.com'] },
    },
  },
});
