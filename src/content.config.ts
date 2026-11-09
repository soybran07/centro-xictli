import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const comunes = {
  titulo: z.string(),
  descripcion: z.string(),
  materia: z.string(),
  nivel: z.string(),
  instrucciones: z.string(),
  orden: z.number().default(99),
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

export const collections = { juegos };
