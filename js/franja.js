// js/franja.js · Franja de eventos: muestra en pantalla cada evento que pasa por track.js, con sus propiedades.
import { modo, idDeAhora } from './track.js';
import { esc } from './ui.js';

const eventos = [];
let abierta = false;
const raiz = () => document.getElementById('franja');

function hora(fecha) {
  return fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function fila(e) {
  if (e.identidad) {
    const texto = e.identidad === 'identify' ? `identificar() · desde aquí los eventos son de ${e.distinctId}` : `cerrarSesion() · reset(), identificador anónimo nuevo ${e.distinctId}`;
    return `<li class="ev ev-identidad"><span class="ev-hora">${hora(e.hora)}</span><span class="ev-nombre">${esc(texto)}</span></li>`;
  }
  const props = Object.entries(e.propiedades || {})
    .filter(([k]) => !(e.rojas || []).includes(k))
    .map(([k, v]) => `<span class="ev-prop"><b>${esc(k)}</b>: ${esc(JSON.stringify(v))}</span>`).join(' ');
  const rojas = (e.rojas || []).map((k) => `<span class="ev-prop ev-roja"><b>${esc(k)}</b>: rechazada (lista roja)</span>`).join(' ');
  return `<li class="ev ${e.rechazado || (e.rojas || []).length ? 'ev-error' : ''}">
    <span class="ev-hora">${hora(e.hora)}</span>
    <span class="ev-emisor ev-${e.emisor}">${e.emisor === 'servidor' ? 'servidor' : 'navegador'}</span>
    <span class="ev-nombre">${esc(e.nombre)}</span>
    ${e.rechazado ? `<span class="ev-prop ev-roja">Rechazado: ${esc(e.rechazado)}</span>` : ''}
    <span class="ev-props">${props} ${rojas}</span>
    <span class="ev-id">distinct_id: ${esc(e.distinctId)}</span>
  </li>`;
}

export function dibujarFranja() {
  const el = raiz();
  if (!el) return;
  const ultimo = eventos[eventos.length - 1];
  el.classList.toggle('abierta', abierta);
  el.innerHTML = `
    <div class="franja-cabeza">
      <button class="franja-boton" data-franja="alternar" aria-expanded="${abierta}">
        <span class="franja-punto"></span>
        Eventos · modo ${modo} · ${eventos.length}
      </button>
      <span class="franja-id">id actual: ${esc(idDeAhora())}</span>
      <button class="franja-boton franja-limpiar" data-franja="limpiar">Limpiar</button>
    </div>
    <ol class="franja-lista">${abierta ? eventos.slice().reverse().map(fila).join('') : ultimo ? fila(ultimo) : '<li class="ev ev-vacio">Todavía no hay eventos. Toque algo en Mi Guaria.</li>'}</ol>`;
}

window.addEventListener('mg:evento', (e) => {
  eventos.push(e.detail);
  dibujarFranja();
  const el = raiz();
  if (el) { el.classList.remove('destello'); void el.offsetWidth; el.classList.add('destello'); }
});

document.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-franja]');
  if (!boton) return;
  if (boton.dataset.franja === 'alternar') abierta = !abierta;
  if (boton.dataset.franja === 'limpiar') eventos.length = 0;
  dibujarFranja();
});

export function abrirFranja(valor = true) { abierta = valor; dibujarFranja(); }
