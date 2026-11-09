// Materias de la educación básica en México (primaria y secundaria), para la
// Biblioteca de la plataforma. Cada materia dice en qué grados se imparte.
//
// Base: Plan de Estudio 2022 de la SEP y sus programas (Acuerdo 08/08/23,
// DOF 15/08/2023), con los nombres de las disciplinas que se usan en los
// libros de texto y en las escuelas. Fuentes:
//   https://educacionbasica.sep.gob.mx/wp-content/uploads/2023/03/Puntos-centrales-del-Plan-de-Estudio.pdf
//   https://educacionbasica.sep.gob.mx/wp-content/uploads/2023/09/Posibilidades_de_uso_de_los_LTG_Fase_6_Secundaria.pdf
//
// Para agregar una materia o cambiar sus grados, edítala aquí. La clave "id"
// es la que usan los archivos de src/content/biblioteca.

import { campos } from './catalogo';

export type CampoId = 'lenguajes' | 'saberes' | 'etica' | 'humano' | 'docencia';

export interface MateriaBasica {
  id: string;
  nombre: string;
  campo: CampoId;
  descripcion: string;
  primaria: number[];
  secundaria: number[];
}

const todos = { primaria: [1, 2, 3, 4, 5, 6], secundaria: [1, 2, 3] };

export const materiasBasica = [
  { id: 'espanol', nombre: 'Español', campo: 'lenguajes', descripcion: 'Lectura, escritura, oralidad y literatura.', ...todos },
  { id: 'ingles', nombre: 'Inglés', campo: 'lenguajes', descripcion: 'Comunicación en inglés como lengua extranjera.', ...todos },
  { id: 'lengua-indigena', nombre: 'Lengua indígena', campo: 'lenguajes', descripcion: 'Lenguas originarias de México, como el náhuatl.', ...todos },
  { id: 'artes', nombre: 'Artes', campo: 'lenguajes', descripcion: 'Música, danza, teatro y artes visuales.', ...todos },
  { id: 'matematicas', nombre: 'Matemáticas', campo: 'saberes', descripcion: 'Número, álgebra, geometría, medición y datos.', ...todos },
  { id: 'conocimiento-del-medio', nombre: 'Conocimiento del Medio', campo: 'saberes', descripcion: 'El entorno natural y social de los más pequeños.', primaria: [1, 2], secundaria: [] },
  { id: 'ciencias-naturales', nombre: 'Ciencias Naturales', campo: 'saberes', descripcion: 'Seres vivos, cuerpo humano, materia y energía.', primaria: [3, 4, 5, 6], secundaria: [] },
  { id: 'biologia', nombre: 'Biología', campo: 'saberes', descripcion: 'La vida, la célula, la salud y los ecosistemas.', primaria: [], secundaria: [1] },
  { id: 'fisica', nombre: 'Física', campo: 'saberes', descripcion: 'Movimiento, fuerzas, energía y el universo.', primaria: [], secundaria: [2] },
  { id: 'quimica', nombre: 'Química', campo: 'saberes', descripcion: 'La materia, sus propiedades y sus cambios.', primaria: [], secundaria: [3] },
  { id: 'entidad', nombre: 'La entidad donde vivo', campo: 'etica', descripcion: 'Historia, geografía y cultura del estado.', primaria: [3], secundaria: [] },
  { id: 'geografia', nombre: 'Geografía', campo: 'etica', descripcion: 'El espacio, los mapas, la población y el ambiente.', primaria: [4, 5, 6], secundaria: [1] },
  { id: 'historia', nombre: 'Historia', campo: 'etica', descripcion: 'El pasado de México y del mundo.', primaria: [4, 5, 6], secundaria: [1, 2, 3] },
  { id: 'civica', nombre: 'Formación Cívica y Ética', campo: 'etica', descripcion: 'Derechos, convivencia, democracia y valores.', ...todos },
  { id: 'educacion-fisica', nombre: 'Educación Física', campo: 'humano', descripcion: 'Juego, movimiento y cuidado del cuerpo.', ...todos },
  { id: 'vida-saludable', nombre: 'Vida saludable', campo: 'humano', descripcion: 'Alimentación, higiene y hábitos para estar bien.', ...todos },
  { id: 'socioemocional', nombre: 'Educación socioemocional', campo: 'humano', descripcion: 'Emociones, autoestima y relaciones sanas. En secundaria, Tutoría.', ...todos },
  { id: 'tecnologia', nombre: 'Tecnología', campo: 'humano', descripcion: 'Talleres, procesos técnicos y proyectos.', primaria: [], secundaria: [1, 2, 3] },
  { id: 'docencia', nombre: 'Planeación y docencia', campo: 'docencia', descripcion: 'Planeaciones, NEM, evaluación y material para el maestro.', ...todos },
] as const satisfies readonly MateriaBasica[];

export type MateriaBasicaId = (typeof materiasBasica)[number]['id'];
export const idsMateriasBasica = materiasBasica.map((m) => m.id) as [MateriaBasicaId, ...MateriaBasicaId[]];

export const materiaBasica = (id: string): MateriaBasica | undefined => materiasBasica.find((m) => m.id === id);

/** Los campos formativos, en orden, con sus materias. */
export const camposBiblioteca = (Object.keys(campos) as CampoId[]).map((id) => ({
  id,
  nombre: campos[id],
  materias: materiasBasica.filter((m) => m.campo === id) as MateriaBasica[],
}));

export const nivelesBiblioteca = [
  { id: 'primaria', nombre: 'Educación primaria' },
  { id: 'secundaria', nombre: 'Educación secundaria' },
] as const;

export const tiposRecurso = {
  juego: 'Juego',
  tema: 'Ficha de estudio',
  enlace: 'Enlace',
  video: 'Video',
  archivo: 'Archivo',
} as const;

export const ordinal = (n: number) => `${n}.º`;

/** [3,4,5,6] -> "3.º a 6.º" */
export const rango = (g: readonly number[]) => (g.length === 1 ? ordinal(g[0]) : `${ordinal(g[0])} a ${ordinal(g[g.length - 1])}`);

/** Color de las tarjetas según el campo formativo. */
export const estiloCampo: Record<CampoId, string> = {
  lenguajes: 'bg-rosa text-negro',
  saberes: 'bg-negro text-blanco dark:ring-2 dark:ring-blanco dark:ring-inset',
  etica: 'bg-rosa-claro text-negro',
  humano: 'bg-blanco text-negro ring-2 ring-negro ring-inset dark:bg-negro dark:text-blanco dark:ring-blanco',
  docencia: 'bg-negro text-rosa dark:ring-2 dark:ring-rosa dark:ring-inset',
};
