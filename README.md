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

## Plataforma de alumnos (Iniciar sesión)

Los alumnos entran en `/entrar` con usuario y contraseña y ven sus tareas en `/plataforma`. El maestro asigna tareas, acomoda a los alumnos en grupos y revisa resultados en `/plataforma/docente`. Usa **Supabase** (plan gratuito) para las cuentas y la base de datos; el sitio sigue siendo estático en GitHub Pages.

### Conectarla (una sola vez)

1. Crea una cuenta en https://supabase.com y un proyecto nuevo (región más cercana, por ejemplo `us-east`). Guarda la contraseña de la base de datos en un lugar seguro.
2. En **SQL Editor**, pega todo `supabase/esquema.sql` y presiona **Run**. Crea las tablas, los permisos y los grupos: Regularización de Matemáticas, Regularización de Español y Clase de Español.
3. En **Authentication > Sign In / Providers**: deja activo solo **Email**, **desactiva «Allow new users to sign up»** (así nadie puede crearse una cuenta solo) y desactiva «Confirm email». En **Authentication > Policies / Passwords** pon mínimo 8 caracteres.
4. En **Authentication > URL Configuration**, pon como Site URL `https://soybran07.github.io/centro-xictli/`.
5. Crea tu cuenta: **Authentication > Users > Add user**, con tu correo, una contraseña fuerte y «Auto Confirm User». Luego corre en SQL Editor la última línea de `esquema.sql` (con tu correo) para volverte docente.
6. En **Project Settings > API** copia la *Project URL* y la *publishable key* (o *anon key*) y pégalas en `src/config/plataforma.ts`. **Nunca** pegues la *secret* ni la *service_role key*.
7. Haz commit y push: el sitio se vuelve a publicar solo.

### Dar de alta alumnos

En Supabase: **Authentication > Users > Add user** con el correo `usuario@alumnos.centroxictli.mx` (por ejemplo `ana.lopez@alumnos.centroxictli.mx`), una contraseña y «Auto Confirm User». Después, en el panel del maestro escribe su nombre y márcale sus grupos. Al alumno solo dale `ana.lopez` y su contraseña. Para cambiar una contraseña olvidada: en Supabase, abre el usuario y usa «Reset password» o borra y crea la cuenta de nuevo.

### Seguridad

- Cada tabla tiene **Row Level Security**: un alumno solo ve sus grupos, sus tareas y sus entregas, y no puede cambiar su rol. Sin sesión no se puede leer nada. Solo las cuentas docentes crean tareas y ven resultados.
- La llave publishable/anon es pública por diseño; lo que protege los datos son esas reglas.
- Todas las páginas llevan una **Content Security Policy**: el navegador solo ejecuta scripts del sitio y solo se conecta a Supabase.
- Los datos que escriben alumnos o el maestro se muestran siempre como texto, nunca como HTML.
- Los enlaces externos de las tareas solo pueden ser `https://`.
- Límite conocido: el puntaje de los juegos se calcula en el navegador del alumno, así que un alumno con conocimientos técnicos podría falsear su resultado. Para tareas de práctica es aceptable; para exámenes con calificación conviene revisar en clase.

### Superusuario, maestros y aulas (migración 002)

1. En Supabase > SQL Editor corre `supabase/002_aulas_y_admin.sql` (después de `esquema.sql`). La primera vez, la cuenta docente que ya existía se vuelve **administración general** (superusuario).
2. Publica la función que da de alta cuentas: Supabase > **Edge Functions** > Deploy a new function > Via Editor. Nómbrala `admin-usuarios`, pega `supabase/functions/admin-usuarios/index.ts` y presiona Deploy, con «Verify JWT» activado. La llave secreta la pone Supabase solo; nunca va en el sitio.

| Rol | Qué puede hacer |
| --- | --- |
| Administración (`admin`) | Todo: ver y editar todas las aulas, dar de alta y borrar cuentas, cambiar contraseñas y roles, asignar maestros a aulas. Entra en «Administración general». |
| Maestro (`docente`) | Crear aulas y administrar solo las suyas: recorrido de actividades, alumnos inscritos y resultados. |
| Alumno | Ver sus aulas, su recorrido y hacer sus actividades. |

Cada aula tiene nombre, materia, descripción, color y un **recorrido** ordenado de actividades: juegos, temas, enlaces, respuestas escritas y avisos.
