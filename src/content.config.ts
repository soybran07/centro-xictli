import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { idsMaterias, idsNiveles } from './config/catalogo';

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

export const collections = { juegos, temas };
