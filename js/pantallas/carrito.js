// js/pantallas/carrito.js · P16, «Mi pedido»: líneas, total, ganancia por escalones y pedido mínimo.
import { esc, encabezadoSesion, imagenProducto, colones, icono } from '../ui.js';
import { REGLAS, CARRITOS_DE_MUESTRA, porcentajeGanancia, siguienteEscalon } from '../datos.js';
import { lineasCarrito, totalCarrito, cantidadCarrito } from '../estado.js';

// Texto de la ganancia según la versión. A: lo que va a perder. B: lo que le falta y lo que ganaría.
export function avisoGanancia(total, v) {
  if (total < REGLAS.pedidoMinimo) return '';
  const hoy = porcentajeGanancia(total);
  const siguiente = siguienteEscalon(total);
  if (v === 'A') return siguiente ? `<p class="aviso-rojo">Va a perder el ${siguiente.porcentaje} %</p>` : '';
  if (!siguiente) return `<div class="aviso-ganancia"><p>Gana ${hoy} %: ${colones(Math.floor(total * hoy / 100))}. Está en el escalón más alto.</p></div>`;
  const falta = siguiente.desde - total;
  const avance = Math.min(100, (total / siguiente.desde) * 100);
  return `<div class="aviso-ganancia">
    <p>Le faltan ${colones(falta)} para ganar ${siguiente.porcentaje} %. Hoy gana ${hoy} %: ${colones(Math.floor(total * hoy / 100))}. Con ${colones(siguiente.desde)} ganaría ${colones(siguiente.desde * siguiente.porcentaje / 100)}.</p>
    <div class="barra-avance" aria-label="Avance al siguiente escalón"><span style="width:${avance}%"></span></div>
    <p class="barra-etiqueta"><span>${colones(total)}</span><span>${colones(siguiente.desde)}</span></p></div>`;
}

export function avisoMinimo(total, v) {
  if (total >= REGLAS.pedidoMinimo || total === 0) return '';
  return v === 'A'
    ? '<p class="aviso-rojo">Pedido inválido. No cumple el monto mínimo.</p>'
    : `<p class="aviso-info">Le faltan ${colones(REGLAS.pedidoMinimo - total)} para el pedido mínimo de ${colones(REGLAS.pedidoMinimo)}.</p>`;
}

export default {
  id: 'P16', titulo: 'Mi pedido', direccion: 'mi.guaria/mi-pedido',
  dibujar(raiz, v, app, params) {
    app.asegurarSesion();
    if (params.muestra === 'minimo' || (app.primeraCarga && !app.estado.carrito.length)) {
      app.estado.carrito = structuredClone(CARRITOS_DE_MUESTRA[params.muestra === 'minimo' ? 'minimo' : 'P16']);
      app.guardar();
      if (params.muestra) app.limpiarParametros();
    }
    let quitada = null;
    const pintar = () => {
      const lineas = lineasCarrito();
      const total = totalCarrito();
      raiz.innerHTML = `<div class="p16">${encabezadoSesion(cantidadCarrito())}
        <div class="cuerpo">
          <h1 class="titulo-seccion">Mi pedido · Campaña ${app.estado.campana}</h1>
          ${lineas.length ? '' : '<p class="vacio">Su pedido está vacío. Agregue productos desde el catálogo o con el código.</p>'}
          <ul class="lineas">${lineas.map((l) => `<li class="linea">${imagenProducto(l.producto, 52)}
            <div class="linea-datos"><b>${esc(l.producto.nombre)}</b><small>${l.cant} × ${colones(l.precio ?? l.producto.precio)}</small></div>
            <div class="linea-cantidad"><button aria-label="Quitar uno" data-menos="${l.id}">${icono('menos', 16)}</button><span>${l.cant}</span><button aria-label="Agregar uno" data-mas="${l.id}">${icono('mas', 16)}</button></div>
            <button class="btn-icono" aria-label="Quitar ${esc(l.producto.nombre)}" data-quitar="${l.id}">${icono('basura', 18)}</button></li>`).join('')}</ul>
          ${avisoMinimo(total, v)}
          ${avisoGanancia(total, v)}
          <div class="total"><span>Total</span><b>${colones(total)}</b></div>
          <button class="btn-principal ancho" id="revisar" ${v === 'B' && total < REGLAS.pedidoMinimo ? 'disabled' : ''}>Revisar y enviar</button>
          <button class="btn-secundario ancho" data-ir="/P15">Seguir agregando</button>
        </div></div>`;
      raiz.querySelectorAll('[data-mas],[data-menos]').forEach((b) => (b.onclick = () => {
        const linea = app.estado.carrito.find((l) => l.id === (b.dataset.mas || b.dataset.menos));
        linea.cant += b.dataset.mas ? 1 : -1;
        if (linea.cant <= 0) return quitar(linea.id);
        app.guardar(); pintar();
      }));
      raiz.querySelectorAll('[data-quitar]').forEach((b) => (b.onclick = () => quitar(b.dataset.quitar)));
      raiz.querySelector('#revisar').onclick = () => {
        if (total < REGLAS.pedidoMinimo) { app.aviso(v === 'A' ? 'Error: pedido inválido.' : `Le faltan ${colones(REGLAS.pedidoMinimo - total)} para el pedido mínimo.`); return; }
        app.ir('/P17');
      };
    };
    const quitar = (id) => {
      const i = app.estado.carrito.findIndex((l) => l.id === id);
      quitada = { linea: { ...app.estado.carrito[i], cant: Math.max(1, app.estado.carrito[i].cant) }, i };
      app.estado.carrito.splice(i, 1);
      app.guardar(); pintar();
      app.aviso('Quitó un producto de Mi pedido.', { ms: 6000, accion: { texto: 'Deshacer', fn: () => { app.estado.carrito.splice(quitada.i, 0, quitada.linea); app.guardar(); if (location.hash.startsWith('#/P16')) pintar(); } } });
    };
    pintar();
  },
};
