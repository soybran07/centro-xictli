export function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function crear<K extends keyof HTMLElementTagNameMap>(
  etiqueta: K,
  clase = '',
  texto = '',
): HTMLElementTagNameMap[K] {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

/** Avisa que un juego terminó, para que el modo tarea guarde el resultado. */
export function avisarFin(raiz: HTMLElement, puntaje: number, total: number, detalle = '') {
  raiz.dispatchEvent(new CustomEvent('juego:terminado', { bubbles: true, detail: { puntaje, total, detalle } }));
}
