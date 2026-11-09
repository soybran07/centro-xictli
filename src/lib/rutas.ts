// Convierte una ruta interna en una que respeta el `base` de astro.config.mjs.
// Usa siempre ruta('/juegos') en lugar de escribir href="/juegos".
export function ruta(camino = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpio = camino.replace(/^\//, '');
  return `${base}/${limpio}`;
}
