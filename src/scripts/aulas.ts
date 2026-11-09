// Piezas compartidas de las páginas de aulas.
import { crear } from './util';
import { ruta } from '../lib/rutas';

export type Aula = { id: string; nombre: string; materia: string; descripcion: string; color: string; docente_id: string | null };
export type Catalogo = { juegos: { id: string; titulo: string; detalle: string }[]; temas: { id: string; titulo: string; detalle: string }[]; materias: string[] };

export const colores: Record<string, { fondo: string; nombre: string }> = {
  rosa: { fondo: 'bg-rosa text-negro', nombre: 'Rosa' },
  negro: { fondo: 'bg-negro text-blanco dark:ring-2 dark:ring-blanco dark:ring-inset', nombre: 'Negro' },
  claro: { fondo: 'bg-rosa-claro text-negro', nombre: 'Rosa claro' },
};
export const fondoDe = (color: string) => (colores[color] ?? colores.rosa).fondo;

export const tipos: Record<string, string> = {
  juego: 'Juego', tema: 'Tema para leer', enlace: 'Actividad externa', texto: 'Respuesta escrita', aviso: 'Aviso',
};

export function leerCatalogo(): Catalogo {
  try { return JSON.parse(document.getElementById('catalogo')?.textContent || ''); } catch { return { juegos: [], temas: [], materias: [] }; }
}

export const urlAula = (id: string) => `${ruta('/plataforma/aula')}?id=${id}`;

/** Tarjeta de aula para las cuadrículas de "Mis aulas". */
export function tarjetaAula(a: Aula, extra = '') {
  const li = crear('li', `relative flex min-h-44 flex-col gap-2 rounded-2xl p-6 ${fondoDe(a.color)}`);
  if (a.materia) li.append(crear('p', 'text-base font-bold', a.materia));
  const h = crear('h3', 'text-3xl font-bold');
  const link = crear('a', 'after:absolute after:inset-0 after:rounded-2xl hover:underline underline-offset-4', a.nombre);
  link.href = urlAula(a.id);
  h.append(link);
  li.append(h);
  if (a.descripcion) li.append(crear('p', 'line-clamp-2', a.descripcion));
  if (extra) li.append(crear('p', 'mt-auto font-bold', extra));
  return li;
}
