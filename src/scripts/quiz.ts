import { avisarFin, crear } from './util';

type Pregunta = { pregunta: string; opciones: string[]; correcta: number; explicacion?: string };

document.querySelectorAll<HTMLElement>('[data-quiz]').forEach((raiz) => {
  const preguntas: Pregunta[] = JSON.parse(raiz.dataset.juego!);
  let indice = 0;
  let puntos = 0;

  function mostrar(enfocar: boolean) {
    const p = preguntas[indice];
    raiz.replaceChildren();
    const avance = crear('p', 'font-bold', `Pregunta ${indice + 1} de ${preguntas.length}. Puntaje: ${puntos}`);
    const titulo = crear('h2', 'mt-2 text-2xl font-bold md:text-3xl', p.pregunta);
    titulo.tabIndex = -1;
    const opciones = crear('div', 'mt-5 space-y-3');
    const aviso = crear('p', 'mt-4 min-h-14 text-lg');
    aviso.setAttribute('role', 'status');
    const siguiente = crear('button', 'boton hidden mt-2', indice + 1 < preguntas.length ? 'Siguiente pregunta' : 'Ver mi puntaje');
    siguiente.type = 'button';
    const botones: HTMLButtonElement[] = [];
    let respondida = false;

    p.opciones.forEach((texto, i) => {
      const b = crear('button', 'opcion');
      b.type = 'button';
      b.append(crear('span', '', texto));
      b.addEventListener('click', () => {
        if (respondida) return;
        respondida = true;
        const acierto = i === p.correcta;
        if (acierto) puntos++;
        botones.forEach((o, n) => {
          o.setAttribute('aria-disabled', 'true');
          if (n === p.correcta) {
            o.dataset.resultado = 'bien';
            o.append(crear('span', 'shrink-0', 'Correcta'));
          } else if (n === i) {
            o.dataset.resultado = 'mal';
            o.append(crear('span', 'shrink-0', 'Tu respuesta'));
          }
        });
        aviso.textContent = `${acierto ? '¡Correcto!' : `Incorrecto. La respuesta es: ${p.opciones[p.correcta]}.`} ${p.explicacion ?? ''}`.trim();
        avance.textContent = `Pregunta ${indice + 1} de ${preguntas.length}. Puntaje: ${puntos}`;
        siguiente.classList.remove('hidden');
        siguiente.focus();
      });
      botones.push(b);
      opciones.append(b);
    });

    siguiente.addEventListener('click', () => {
      indice++;
      if (indice < preguntas.length) mostrar(true);
      else final();
    });
    raiz.append(avance, titulo, opciones, aviso, siguiente);
    if (enfocar) titulo.focus();
  }

  function final() {
    raiz.replaceChildren();
    const total = preguntas.length;
    const titulo = crear('h2', 'text-5xl font-extrabold md:text-7xl', `${puntos} de ${total}`);
    titulo.tabIndex = -1;
    const proporcion = puntos / total;
    const texto = proporcion === 1 ? '¡Todas correctas!' : proporcion >= 0.7 ? 'Muy bien. Ya casi las dominas todas.' : 'Vale la pena repasar y volver a intentarlo.';
    const otra = crear('button', 'boton mt-6', 'Jugar otra vez');
    otra.type = 'button';
    otra.addEventListener('click', () => { indice = 0; puntos = 0; mostrar(true); });
    raiz.append(titulo, crear('p', 'mt-3 text-xl', texto), otra);
    titulo.focus();
    avisarFin(raiz, puntos, total);
  }

  mostrar(false);
});
