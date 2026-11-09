# Centro Xictli

Sitio web del Centro Xictli: pedagogía, regularización y apoyo para dar clases. Hecho con Astro y Tailwind CSS, publicado gratis en GitHub Pages.

Sitio: https://soybran07.github.io/centro-xictli/

## Correrlo en tu computadora

Necesitas Node.js 22.23 o más reciente.

```bash
npm install
npm run dev
```

Abre http://localhost:4321/centro-xictli/ en tu navegador. Para revisar la versión final:

```bash
npm run build
npm run preview
```

## Cambiar textos, teléfono y enlaces

Teléfono, WhatsApp, correo, ubicación y enlace del formulario están en `src/config/sitio.ts`. Lo que dejes vacío no aparece en la página. Los botones "Pedir informes" aparecen solos en cuanto pegas el enlace de Tally o Google Forms en `formularioUrl`.

| Quiero cambiar | Archivo |
| --- | --- |
| Texto de la página de inicio | `src/pages/index.astro` |
| Servicios por nivel y pasos de trabajo | `src/data/servicios.ts` |
| Tu presentación | `src/pages/sobre-mi.astro` |
| Niveles, materias y campos formativos | `src/config/catalogo.ts` |
| Materiales y videos (agrupados por `publico`: alumnos, familias, docentes) | `src/data/recursos.json` |
| Menú y pie de página | `src/layouts/Base.astro` |
| Colores y tipografías | `tailwind.config.mjs` |

## Cambiar el logo

Reemplaza `public/img/logo-claro.png` (para fondo blanco) y `public/img/logo-oscuro.png` (para fondo negro), con esos mismos nombres. El favicon y la imagen para redes sociales se generan solos a partir del logo claro cada vez que corres `npm run dev` o `npm run build`.

## Agregar un juego nuevo

Crea un archivo `.json` en `src/content/juegos/`. El nombre del archivo será la dirección del juego: `fracciones.json` se abre en `/juegos/fracciones`. El juego aparece solo en el catálogo; no hay que tocar código.

Todos los juegos llevan estos campos:

```json
{
  "titulo": "Nombre del juego",
  "tipo": "memorama",
  "materia": "matematicas",
  "nivel": "secundaria",
  "grados": "1.º y 2.º",
  "tema": "fracciones",
  "descripcion": "Frase corta para la tarjeta del catálogo.",
  "instrucciones": "Cómo se juega.",
  "orden": 4
}
```

`nivel` y `materia` usan las claves de `src/config/catalogo.ts` (niveles: `primaria`, `secundaria`, `preparatoria`, `docentes`; materias: `espanol`, `matematicas`, `ciencias`, `historia`, `civica`, `vida-saludable`, `docencia`). Con eso el juego aparece solo en los filtros. `grados` y `tema` son opcionales; `tema` enlaza el juego con su ficha de estudio.

Después agrega el contenido según el `tipo`:

**Memorama** (de 2 a 12 pares):

```json
"pares": [{ "a": "7 × 8", "b": "56" }]
```

**Quiz** (`correcta` es la posición de la respuesta, y la primera opción es 0):

```json
"preguntas": [{
  "pregunta": "¿Cuánto es 2 + 2?",
  "opciones": ["3", "4", "5"],
  "correcta": 1,
  "explicacion": "Opcional: se muestra al responder."
}]
```

**Arrastrar y soltar** (de 2 a 10 pares):

```json
"pares": [{ "concepto": "Símil", "definicion": "Sus ojos brillan como dos estrellas." }]
```

Si falta un campo, `npm run build` te dice cuál es y en qué archivo. Copiar uno de los tres juegos de ejemplo es la forma más rápida de empezar.

Para crear un tipo de juego distinto: agrega su esquema en `src/content.config.ts`, un componente en `src/components/juegos/`, su lógica en `src/scripts/` y su línea en `src/pages/juegos/[slug].astro`.

## Agregar recursos

Sube el archivo a Google Drive con permiso de "Cualquier persona con el enlace" y pega el enlace en `url` dentro de `src/data/recursos.json`. Para un video de YouTube, pon en `youtubeId` el código que aparece después de `v=` en la dirección del video. Si `url` y `youtubeId` están vacíos, la página muestra "disponible pronto".

## Enlaces internos

El sitio vive en `/centro-xictli`. Para que nada se rompa, escribe los enlaces y las imágenes internas con `ruta('/juegos')` (de `src/lib/rutas.ts`), no con `href="/juegos"`.

## Activar GitHub Pages

1. En el repositorio entra a **Settings > Pages**.
2. En **Source** elige **GitHub Actions**.
3. Cada cambio que llegue a la rama `main` publica el sitio solo. Puedes ver el avance en la pestaña **Actions**.

## Agregar un tema de estudio

Los temas son fichas cortas en Markdown que explican antes de practicar. Crea un archivo `.md` en `src/content/temas/`: `el-debate.md` se abre en `/temas/el-debate`.

```markdown
---
titulo: El debate
descripcion: Frase corta para la tarjeta.
nivel: secundaria
grados: 2.º y 3.º
materia: espanol
orden: 1
fuentes:
  - titulo: Libros de texto gratuitos de la SEP
    url: https://libros.conaliteg.gob.mx/
---

Aquí va la explicación. Usa ## para subtítulos, listas y tablas.
```

Los juegos que tengan `"tema": "el-debate"` aparecen solos al final de la ficha, en la sección «Ahora practica».
