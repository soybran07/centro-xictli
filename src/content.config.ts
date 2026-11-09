import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { idsMaterias, idsNiveles } from './config/catalogo';
import { idsMateriasBasica } from './config/biblioteca';

// Campos que comparten juegos y temas. Las claves válidas de nivel y materia
// están en src/config/catalogo.ts.
const clasificacion = {
  titulo: z.string(),
  descripcion: z.string(),
  nivel: z.enum(idsNiveles),
  // Opcional, texto libre: "4.º a 6.º", "2.º y 3.º"...
  grados: z.string().optional(),
  materia: z.enum(idsMaterias),
  orden: z.number().default(99),
};

const comunes = {
  ...clasificacion,
  instrucciones: z.string(),
  // Clave del tema (nombre del archivo en src/content/temas, sin .md) para
  // enlazar el juego con su ficha de estudio.
  tema: z.string().optional(),
};

const juegos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/juegos' }),
  schema: z.discriminatedUnion('tipo', [
    z.object({
      ...comunes,
      tipo: z.literal('memorama'),
      pares: z.array(z.object({ a: z.string(), b: z.string() })).min(2).max(12),
    }),
    z.object({
      ...comunes,
      tipo: z.literal('quiz'),
      preguntas: z
        .array(
          z.object({
            pregunta: z.string(),
            opciones: z.array(z.string()).min(2).max(5),
            // Posición de la respuesta correcta, empezando en 0.
            correcta: z.number().int().min(0),
            explicacion: z.string().optional(),
          }),
        )
        .min(1),
    }),
    z.object({
      ...comunes,
      tipo: z.literal('arrastrar'),
      pares: z.array(z.object({ concepto: z.string(), definicion: z.string() })).min(2).max(10),
    }),
  ]),
});

// Fichas de estudio: explicaciones cortas en Markdown que acompañan a los juegos.
const temas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/temas' }),
  schema: z.object({
    ...clasificacion,
    fuentes: z.array(z.object({ titulo: z.string(), url: z.string().url().optional() })).default([]),
  }),
});

// Biblioteca de la plataforma: cada archivo es un material acomodado por
// materia y grado. Puede apuntar a un juego o tema del sitio, a un enlace
// (Canva, Drive, YouTube...) o a un archivo guardado en public/biblioteca.
const grados = (max: number) => z.array(z.number().int().min(1).max(max)).default([]);
const biblioteca = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/biblioteca' }),
  schema: z
    .object({
      titulo: z.string().min(2).max(120),
      descripcion: z.string().max(300).default(''),
      materia: z.enum(idsMateriasBasica),
      // Grados donde aparece: primaria 1 a 6, secundaria 1 a 3.
      primaria: grados(6),
      secundaria: grados(3),
      tipo: z.enum(['juego', 'tema', 'enlace', 'video', 'archivo']),
      // juego/tema: clave del archivo · enlace/video: https://... ·
      // archivo: nombre del archivo dentro de public/biblioteca, o un https://
      referencia: z.string().min(1).max(500),
      orden: z.number().default(99),
    })
    .refine((r) => r.primaria.length + r.secundaria.length > 0, { message: 'Indica al menos un grado de primaria o secundaria.' })
    .refine((r) => !['enlace', 'video'].includes(r.tipo) || r.referencia.startsWith('https://'), { message: 'Los enlaces deben empezar con https://' })
    .refine((r) => !['juego', 'tema'].includes(r.tipo) || /^[a-z0-9-]{1,80}$/.test(r.referencia), { message: 'La referencia debe ser la clave del juego o tema.' })
    .refine((r) => r.tipo !== 'archivo' || r.referencia.startsWith('https://') || /^[\w.-]{1,120}$/.test(r.referencia), { message: 'Archivo no válido.' }),
});

export const collections = { juegos, temas, biblioteca };
