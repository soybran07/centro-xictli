import { barajar, crear } from './util';

type Par = { concepto: string; definicion: string };

document.querySelectorAll<HTMLElement>('[data-arrastrar]').forEach((raiz) => {
  const pares: Par[] = JSON.parse(raiz.dataset.juego!);
  const banco = raiz.querySelector<HTMLElement>('[data-banco]')!;
  const destinos = raiz.querySelector<HTMLElement>('[data-destinos]')!;
  const estado = raiz.querySelector<HTMLElement>('[data-estado-juego]')!;
  let seleccionada: HTMLButtonElement | null = null;
  let aciertos = 0;
  let errores = 0;

  const seleccionar = (f: HTMLButtonElement | null) => {
    seleccionada?.setAttribute('aria-pressed', 'false');
    seleccionada = f;
    f?.setAttribute('aria-pressed', 'true');
  };

  function intentar(ficha: HTMLButtonElement, destino: HTMLButtonElement) {
    if (destino.dataset.resuelto === 'true') return;
    const nombre = ficha.textContent!;
    seleccionar(null);
    if (destino.dataset.concepto !== nombre) {
      errores++;
      estado.textContent = `${nombre} no va con ese ejemplo. Intenta con otro.`;
      destino.classList.remove('error');
      void destino.offsetWidth;
      destino.classList.add('error');
      ficha.focus();
      return;
    }
    destino.dataset.resuelto = 'true';
    destino.setAttribute('aria-disabled', 'true');
    destino.querySelector('.ranura')!.textContent = nombre;
    destino.setAttribute('aria-label', `${destino.dataset.texto}: ${nombre}, resuelto`);
    ficha.remove();
    aciertos++;
    if (aciertos === pares.length) {
      estado.textContent = errores === 0 ? '¡Perfecto! Todas a la primera.' : `¡Terminaste! Tuviste ${errores} ${errores === 1 ? 'error' : 'errores'}.`;
      raiz.querySelector<HTMLElement>('[data-reiniciar]')!.focus();
    } else {
      estado.textContent = `¡Correcto! ${nombre}. Llevas ${aciertos} de ${pares.length}.`;
      banco.querySelector<HTMLElement>('.ficha')?.focus();
    }
  }

  function habilitarArrastre(ficha: HTMLButtonElement) {
    let inicioX = 0, inicioY = 0, ultimoX = 0, ultimoY = 0, activo = false, arrastrando = false, sobre: HTMLElement | null = null, suprimir = false;

    ficha.addEventListener('pointerdown', (e) => {
      activo = true; arrastrando = false;
      inicioX = e.clientX; inicioY = e.clientY;
      ficha.setPointerCapture(e.pointerId);
    });
    const detectar = () => {
      const punto = document.elementFromPoint(ultimoX, ultimoY)?.closest<HTMLElement>('.destino') ?? null;
      if (punto !== sobre) { sobre?.classList.remove('encima'); punto?.classList.add('encima'); sobre = punto; }
    };
    // Si el dedo está cerca del borde, la página se desplaza para alcanzar los ejemplos.
    const desplazar = () => {
      if (!arrastrando) return;
      const margen = 80;
      const paso = ultimoY > innerHeight - margen ? 8 : ultimoY < margen ? -8 : 0;
      if (paso) { window.scrollBy(0, paso); detectar(); }
      requestAnimationFrame(desplazar);
    };
    ficha.addEventListener('pointermove', (e) => {
      if (!activo) return;
      const dx = e.clientX - inicioX, dy = e.clientY - inicioY;
      if (!arrastrando && Math.hypot(dx, dy) < 6) return;
      ultimoX = e.clientX; ultimoY = e.clientY;
      if (!arrastrando) { arrastrando = true; requestAnimationFrame(desplazar); }
      ficha.classList.add('arrastrando');
      ficha.style.transform = `translate(${dx}px, ${dy}px)`;
      detectar();
    });
    const soltar = (cancelado: boolean) => {
      if (!activo) return;
      activo = false;
      const huboArrastre = arrastrando;
      arrastrando = false;
      ficha.classList.remove('arrastrando');
      ficha.style.transform = '';
      sobre?.classList.remove('encima');
      if (huboArrastre) {
        suprimir = true;
        window.setTimeout(() => { suprimir = false; }, 50);
        if (sobre && !cancelado) intentar(ficha, sobre as HTMLButtonElement);
      }
      sobre = null;
    };
    ficha.addEventListener('pointerup', () => soltar(false));
    ficha.addEventListener('pointercancel', () => soltar(true));
    ficha.addEventListener('click', () => {
      if (suprimir) return;
      if (seleccionada === ficha) { seleccionar(null); estado.textContent = 'Elige una ficha.'; return; }
      seleccionar(ficha);
      estado.textContent = `Elegiste ${ficha.textContent}. Ahora elige su ejemplo.`;
    });
  }

  function iniciar() {
    seleccionada = null; aciertos = 0; errores = 0;
    estado.textContent = 'Elige una ficha.';
    banco.replaceChildren();
    destinos.replaceChildren();
    barajar(pares).forEach((p) => {
      const ficha = crear('button', 'ficha', p.concepto);
      ficha.type = 'button';
      ficha.setAttribute('aria-pressed', 'false');
      habilitarArrastre(ficha);
      banco.append(ficha);
    });
    barajar(pares).forEach((p) => {
      const li = crear('li');
      const d = crear('button', 'destino');
      d.type = 'button';
      d.dataset.concepto = p.concepto;
      d.dataset.texto = p.definicion;
      d.setAttribute('aria-label', `${p.definicion}: sin relacionar`);
      d.append(crear('span', '', p.definicion), crear('span', 'ranura'));
      d.addEventListener('click', () => {
        if (d.dataset.resuelto === 'true') return;
        if (!seleccionada) { estado.textContent = 'Primero elige una ficha.'; banco.querySelector<HTMLElement>('.ficha')?.focus(); return; }
        intentar(seleccionada, d);
      });
      li.append(d);
      destinos.append(li);
    });
  }

  raiz.querySelector('[data-reiniciar]')!.addEventListener('click', iniciar);
  iniciar();
});
