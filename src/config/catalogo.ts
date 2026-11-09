// Cómo se organiza todo el contenido del sitio: niveles, materias y campos
// formativos de la Nueva Escuela Mexicana (NEM). Juegos, temas y servicios
// usan estas mismas claves, así los filtros funcionan solos.
//
// Para agregar una materia o un nivel, añádelo aquí y ya puedes usar su
// clave ("id") en los archivos de juegos y temas.

export const niveles = [
  { id: 'primaria', nombre: 'Primaria' },
  { id: 'secundaria', nombre: 'Secundaria' },
  { id: 'preparatoria', nombre: 'Preparatoria' },
  { id: 'docentes', nombre: 'Para docentes' },
] as const;

// Los cuatro campos formativos del Plan de Estudio 2022 de la SEP.
export const campos = {
  lenguajes: 'Lenguajes',
  saberes: 'Saberes y Pensamiento Científico',
  etica: 'Ética, Naturaleza y Sociedades',
  humano: 'De lo Humano y lo Comunitario',
  docencia: 'Práctica docente',
} as const;

export const materias = [
  { id: 'espanol', nombre: 'Español', campo: 'lenguajes' },
  { id: 'matematicas', nombre: 'Matemáticas', campo: 'saberes' },
  { id: 'ciencias', nombre: 'Ciencias', campo: 'saberes' },
  { id: 'historia', nombre: 'Historia', campo: 'etica' },
  { id: 'civica', nombre: 'Formación Cívica y Ética', campo: 'etica' },
  { id: 'vida-saludable', nombre: 'Vida saludable', campo: 'humano' },
  { id: 'docencia', nombre: 'Planeación y didáctica', campo: 'docencia' },
] as const;

export type NivelId = (typeof niveles)[number]['id'];
export type MateriaId = (typeof materias)[number]['id'];

export const idsNiveles = niveles.map((n) => n.id) as [NivelId, ...NivelId[]];
export const idsMaterias = materias.map((m) => m.id) as [MateriaId, ...MateriaId[]];

export const nombreNivel = (id: string) => niveles.find((n) => n.id === id)?.nombre ?? id;
export const nombreMateria = (id: string) => materias.find((m) => m.id === id)?.nombre ?? id;
export const nombreCampo = (materia: string) => {
  const m = materias.find((x) => x.id === materia);
  return m ? campos[m.campo] : '';
};

/** "Secundaria · 2.º y 3.º" o solo "Secundaria" si no hay grados. */
export const etiquetaNivel = (nivel: string, grados?: string) =>
  grados ? `${nombreNivel(nivel)} · ${grados}` : nombreNivel(nivel);

export const tiposJuego = { memorama: 'Memorama', quiz: 'Quiz', arrastrar: 'Arrastrar y soltar' } as const;
