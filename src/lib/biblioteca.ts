import { getCollection, type CollectionEntry } from 'astro:content';
import { ruta } from './rutas';

export type Recurso = CollectionEntry<'biblioteca'>['data'] & { id: string; url: string; externo: boolean };

/** Todos los materiales de la Biblioteca, con su enlace listo. Revisa que los
 *  juegos y temas a los que apuntan existan, para que no haya enlaces rotos. */
export async function recursosBiblioteca(): Promise<Recurso[]> {
  const [entradas, juegos, temas] = await Promise.all([getCollection('biblioteca'), getCollection('juegos'), getCollection('temas')]);
  const existe = { juego: new Set(juegos.map((j) => j.id)), tema: new Set(temas.map((t) => t.id)) };
  return entradas
    .map(({ id, data }) => {
      if ((data.tipo === 'juego' || data.tipo === 'tema') && !existe[data.tipo].has(data.referencia)) {
        throw new Error(`Biblioteca: "${id}" apunta a un ${data.tipo} que no existe (${data.referencia}).`);
      }
      const externo = data.referencia.startsWith('https://');
      const url = data.tipo === 'juego' ? ruta(`/juegos/${data.referencia}`)
        : data.tipo === 'tema' ? ruta(`/temas/${data.referencia}`)
        : externo ? data.referencia
        : ruta(`/biblioteca/${data.referencia}`);
      return { ...data, id, url, externo };
    })
    .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo, 'es'));
}
