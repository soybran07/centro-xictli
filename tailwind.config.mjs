/** Colores y tipografías de la marca Xictli. */
export default {
  content: ['./src/**/*.{astro,ts,json}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        negro: '#000000',
        blanco: '#FFFFFF',
        rosa: {
          DEFAULT: '#EC1561',
          // Variante para texto rosa sobre fondo blanco: el #EC1561 no alcanza
          // el contraste AA (4.5:1) en letra normal; esta sí (6:1).
          oscuro: '#B80D49',
          claro: '#FDE7EF',
        },
      },
      fontFamily: {
        titulo: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        texto: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
    },
  },
};
