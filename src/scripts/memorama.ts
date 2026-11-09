import { barajar, crear } from './util';

type Par = { a: string; b: string };
type Carta = { par: number; texto: string; boton: HTMLButtonElement; hecha: boolean };

document.querySelectorAll<HTMLElement>('[data-memorama]').forEach((raiz) => {
  const pares: Par[] = JSON.parse(raiz.dataset.juego!);
  const tablero = raiz.querySelector<HTMLElement>('[data-tablero]')!;
  const estado = raiz.querySelector<HTMLElement>('[data-estado-juego]')!;
  let abiertas: Carta[] = [];
  let bloqueado = false;
  let intentos = 0;
  let encontrados = 0;
  let temporizador = 0;

  const etiqueta = (c: Carta, i: number, visible: boolean) => {
    const base = `Carta ${i + 1}`;
    if (c.hecha) return `${base}: ${c.texto}, par encontrado`;
    return visible ? `${base}: ${c.texto}` : `${base}: oculta`;
  };

  function repartir() {
    clearTimeout(temporizador);
    abiertas = [];
    bloqueado = false;
    intentos = 0;
    encontrados = 0;
    estado.textContent = 'Voltea la primera carta.';
    tablero.replaceChildren();
    const datos = barajar(pares.flatMap((p, par) => [{ par, texto: p.a }, { par, texto: p.b }]));
    datos.forEach((d, i) => {
      const boton = crear('button', 'carta');
      boton.type = 'button';
      boton.dataset.estado = 'oculta';
      const interior = crear('span', 'carta-interior');
      interior.setAttribute('aria-hidden', 'true');
      interior.append(crear('span', 'carta-cara carta-dorso', '?'), crear('span', 'carta-cara carta-frente', d.texto));
      boton.append(interior);
      const carta: Carta = { ...d, boton, hecha: false };
      boton.setAttribute('aria-label', etiqueta(carta, i, false));
      boton.addEventListener('click', () => voltear(carta, i));
      tablero.append(boton);
    });
  }

  function voltear(carta: Carta, i: number) {
    if (bloqueado || carta.hecha || abiertas.some((a) => a.boton === carta.boton)) return;
    carta.boton.dataset.estado = 'visible';
    carta.boton.setAttribute('aria-label', etiqueta(carta, i, true));
    abiertas.push(carta);
    if (abiertas.length === 1) {
      estado.textContent = `Volteaste ${carta.texto}. Busca su pareja.`;
      return;
    }
    intentos++;
    const [x, y] = abiertas;
    if (x.par === y.par) {
      [x, y].forEach((c) => {
        c.hecha = true;
        c.boton.dataset.estado = 'par';
        const n = [...tablero.children].indexOf(c.boton);
        c.boton.setAttribute('aria-label', etiqueta(c, n, true));
      });
      abiertas = [];
      encontrados++;
      estado.textContent = encontrados === pares.length
        ? `¡Terminaste en ${intentos} intentos!`
        : `¡Par encontrado! ${x.texto} va con ${y.texto}. Llevas ${encontrados} de ${pares.length}.`;
      return;
    }
    bloqueado = true;
    estado.textContent = `${x.texto} y ${y.texto} no son pareja. Se voltean de nuevo.`;
    temporizador = window.setTimeout(() => {
      [x, y].forEach((c) => {
        c.boton.dataset.estado = 'oculta';
        const n = [...tablero.children].indexOf(c.boton);
        c.boton.setAttribute('aria-label', etiqueta(c, n, false));
      });
      abiertas = [];
      bloqueado = false;
    }, 1200);
  }

  raiz.querySelector('[data-reiniciar]')!.addEventListener('click', repartir);
  repartir();
});
