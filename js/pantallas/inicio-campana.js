// js/pantallas/inicio-campana.js · P14, inicio de campaña. A: cuenta regresiva falsa. B: honesta. C: sin explicación.
import { encabezadoSesion, icono, colones } from '../ui.js';
import { track } from '../track.js';
import { cantidadCarrito, totalCarrito } from '../estado.js';
import { cierre } from '../datos.js';

const dos = (n) => String(n).padStart(2, '0');

export default {
  id: 'P14', titulo: 'Inicio de campaña', direccion: 'mi.guaria/campana',
  dibujar(raiz, v, app) {
    app.asegurarSesion();
    const ingreso = app.tomarIngresoPendiente();
    if (ingreso) track('sesion_iniciada', ingreso);
    const c = app.estado.campana;
    const reloj = {
      A: `<div class="p14-falsa">${icono('reloj', 24)}<b>Envío gratis si pide en los próximos <span id="reloj">10:00</span> minutos</b></div>`,
      B: `<div class="p14-honesta"><h2>Campaña ${c} · Cierra el ${cierre(c)} a mediodía.</h2><p>Le quedan 2 días y 5 horas para enviar su pedido. Después de esa hora, el pedido pasa a la campaña ${c + 1}.</p></div>`,
      C: '<div class="p14-sin"><span id="reloj">02:05:14:33</span></div>',
    }[v];
    const total = totalCarrito();
    raiz.innerHTML = `<div class="p14">${encabezadoSesion(cantidadCarrito())}
      <div class="cuerpo">
        <p class="p14-campana">Campaña ${c}</p>
        ${reloj}
        <p class="p14-lleva">${total ? `Lleva ${colones(total)} en Mi pedido.` : 'Todavía no ha agregado productos a Mi pedido.'}</p>
        <div class="p14-accesos">
          <button class="acceso" data-ir="/P15">${icono('catalogo', 26)}<span>Ver el catálogo</span></button>
          <button class="acceso" data-ir="/P15?via=codigo">${icono('buscar', 26)}<span>Digitar códigos</span></button>
          <button class="acceso" data-ir="/P16">${icono('bolsa', 26)}<span>Mi pedido</span></button>
          <button class="acceso" data-ir="/P19">${icono('pedidos', 26)}<span>Mis pedidos</span></button>
          <button class="acceso" data-ir="/P20">${icono('persona', 26)}<span>Perfil</span></button>
        </div>
      </div></div>`;
    const el = raiz.querySelector('#reloj');
    if (v === 'A') {
      let s = 600; // vuelve a 10:00 cada vez que se abre la pantalla
      app.cada(1000, () => { s = Math.max(0, s - 1); el.textContent = `${dos(Math.floor(s / 60))}:${dos(s % 60)}`; });
    }
    if (v === 'C') {
      let s = ((2 * 24 + 5) * 60 + 14) * 60 + 33;
      app.cada(1000, () => { s -= 1; el.textContent = `${dos(Math.floor(s / 86400))}:${dos(Math.floor(s / 3600) % 24)}:${dos(Math.floor(s / 60) % 60)}:${dos(s % 60)}`; });
    }
  },
};
