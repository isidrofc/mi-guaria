// js/pantallas/mis-pedidos.js · P19, «Mis pedidos» con «Pedir otra vez».
import { esc, encabezadoSesion, imagenProducto, colones } from '../ui.js';
import { track } from '../track.js';
import { HISTORIAL, producto, totalLineas } from '../datos.js';
import { agregarAlCarrito, cantidadCarrito } from '../estado.js';

export default {
  id: 'P19', titulo: 'Mis pedidos', direccion: 'mi.guaria/mis-pedidos',
  dibujar(raiz, v, app) {
    const sesion = app.asegurarSesion();
    const conHistorial = sesion.muestra || app.servidor.vendedora(sesion.codigo)?.historial;
    const propios = app.estado.pedidos.slice().reverse().map((p) => ({ campana: p.campana, fecha: p.fecha, estado: p.estado, lineas: p.lineas, total: p.total }));
    const pedidos = [...propios, ...(conHistorial ? HISTORIAL.map((h) => ({ ...h, total: totalLineas(h.lineas) })) : [])];
    raiz.innerHTML = `<div class="p19">${encabezadoSesion(cantidadCarrito())}
      <div class="cuerpo"><h1 class="titulo-seccion">Mis pedidos</h1>
        ${pedidos.length ? '' : '<p class="vacio">Todavía no tiene pedidos. Cuando envíe el primero, aparece aquí y lo puede repetir con un toque.</p><button class="btn-principal ancho" data-ir="/P15">Hacer mi pedido</button>'}
        ${pedidos.map((p, i) => `<article class="tarjeta-pedido">
          <h2>Campaña ${p.campana} · ${colones(p.total)} · ${esc(p.estado)}</h2>
          <p class="fecha">${esc(p.fecha)}</p>
          <div class="miniaturas">${p.lineas.map((l) => imagenProducto(producto(l.id), 44)).join('')}</div>
          <div class="detalle" hidden><ul>${p.lineas.map((l) => `<li>${l.cant} × ${esc(producto(l.id).nombre)}</li>`).join('')}</ul></div>
          <div class="tarjeta-acciones"><button class="btn-principal" data-repetir="${i}">Pedir otra vez</button><button class="btn-texto" data-detalle="${i}">Ver detalle</button></div>
        </article>`).join('')}
      </div></div>`;
    raiz.querySelectorAll('[data-detalle]').forEach((b) => (b.onclick = () => {
      const detalle = b.closest('.tarjeta-pedido').querySelector('.detalle');
      detalle.hidden = !detalle.hidden;
      b.textContent = detalle.hidden ? 'Ver detalle' : 'Ocultar detalle';
    }));
    raiz.querySelectorAll('[data-repetir]').forEach((b) => (b.onclick = () => {
      const pedido = pedidos[Number(b.dataset.repetir)];
      for (const l of pedido.lineas) {
        agregarAlCarrito(l.id, l.cant);
        track('producto_agregado', { via: 'pedir_otra_vez' });
      }
      app.aviso(`Agregamos a Mi pedido los ${pedido.lineas.length} productos de la campaña ${pedido.campana}.`);
      app.ir('/P16');
    }));
  },
};
