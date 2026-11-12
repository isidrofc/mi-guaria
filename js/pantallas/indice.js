// js/pantallas/indice.js · Lista de pantallas P01 a P20 y de las pantallas del teléfono simulado.
import p01 from './pagina-publica.js';
import { p02, p03, p04, p05 } from './afiliacion.js';
import p06 from './solicitud-recibida.js';
import { telefono, correo, mensajes, p07 } from './telefono.js';
import p08 from './revise-su-correo.js';
import p09 from './inicio-sesion.js';
import p10 from './codigo.js';
import p11 from './contrasena.js';
import p12 from './recuperar-acceso.js';
import p13 from './primer-ingreso.js';
import p14 from './inicio-campana.js';
import p15 from './catalogo.js';
import p16 from './carrito.js';
import p17 from './revisar-enviar.js';
import p18 from './confirmacion.js';
import p19 from './mis-pedidos.js';
import p20 from './perfil.js';
import { logo } from '../ui.js';

// Fin del ejercicio de la sesión 1: la vendedora entró.
const fin = {
  id: 'fin', titulo: 'Bienvenida a Mi Guaria', direccion: 'mi.guaria/inicio',
  dibujar(raiz, v, app) {
    raiz.innerHTML = `<div class="fin"><div class="fin-centro">${logo(64, false)}<h1>Bienvenida a Mi Guaria</h1>
      <p>Ya entró con su código de vendedora.</p><p class="marca-practica">Fin del ejercicio de práctica de la sesión 1.</p></div></div>`;
    app.etiqueta('P10 · fin del ejercicio');
  },
};

export const PANTALLAS = Object.fromEntries(
  [p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, telefono, correo, mensajes, fin].map((p) => [p.id, p]),
);
