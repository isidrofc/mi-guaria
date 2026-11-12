// js/pantallas/revisar-enviar.js · P17, revisar y enviar. La versión A tiene cuatro trampas; la B muestra todo con su precio y nada marcado.
import { esc, encabezadoSesion, colones, imagenProducto } from '../ui.js';
import { REGLAS, CARRITOS_DE_MUESTRA, porcentajeGanancia, producto, cierre } from '../datos.js';
import { lineasCarrito, totalCarrito, cantidadCarrito, agregarAlCarrito } from '../estado.js';

const SEGURO = 1500;
const BROCHAS = 'p11';

export default {
  id: 'P17', titulo: 'Revisar y enviar', direccion: 'mi.guaria/mi-pedido/revisar',
  dibujar(raiz, v, app) {
    app.asegurarSesion();
    if (app.primeraCarga && !app.estado.carrito.length) { app.estado.carrito = structuredClone(CARRITOS_DE_MUESTRA.P17); app.guardar(); }
    if (totalCarrito() < REGLAS.pedidoMinimo) { app.aviso('Todavía no llega al pedido mínimo.'); app.ir('/P16'); return; }
    const c = app.estado.campana;
    const eleccion = { seguro: v === 'A', pago: v === 'A' ? 'credito' : '', repetir: v === 'A' };
    const pagos = [
      ['credito', 'Crédito', `Lo paga después de recibirlo, con fecha límite 13 días después de facturar. Necesita crédito aprobado.`],
      ['contado', 'Contado al recibir', 'Lo paga en efectivo o con tarjeta cuando le llega el pedido.'],
      ['sinpe', 'SINPE Móvil antes de facturar', `Lo paga antes del cierre, el ${cierre(c)} a mediodía.`],
    ];
    const pintar = () => {
      const lineas = lineasCarrito();
      const subtotal = totalCarrito();
      const ganancia = Math.floor(subtotal * porcentajeGanancia(subtotal) / 100);
      const total = subtotal + (eleccion.seguro ? SEGURO : 0);
      const tieneBrochas = app.estado.carrito.some((l) => l.id === BROCHAS);
      raiz.innerHTML = `<div class="p17">${encabezadoSesion(cantidadCarrito())}
        <div class="cuerpo">
          <h1 class="titulo-seccion">Revisar y enviar</h1>
          <section class="resumen"><h2>Su pedido</h2>
            <ul>${lineas.map((l) => `<li><span>${l.cant} × ${esc(l.producto.nombre)}</span><span>${colones((l.precio ?? l.producto.precio) * l.cant)}</span></li>`).join('')}</ul>
            <p class="fila-monto"><span>Subtotal</span><b>${colones(subtotal)}</b></p>
            <p class="fila-monto ganancia"><span>Su ganancia (${porcentajeGanancia(subtotal)} %)</span><b>${colones(ganancia)}</b></p></section>
          ${tieneBrochas ? '' : `<section class="oferta">${imagenProducto(producto(BROCHAS), 48)}
            <p>${v === 'A' ? 'Agregue el set de brochas por ₡6.900 <s>(antes ₡14.900)</s>' : 'Agregue el set de brochas por ₡7.200'}</p>
            <button class="btn-secundario" id="brochas">Agregar</button></section>`}
          <section class="extras"><label class="opcion"><input type="checkbox" id="seguro" ${eleccion.seguro ? 'checked' : ''}><span>${v === 'A' ? `Seguro de envío ${colones(SEGURO)}` : `Seguro de envío (opcional) ${colones(SEGURO)}`}</span></label></section>
          <fieldset class="campo opciones pagos"><legend>Forma de pago</legend>
            ${pagos.map(([val, txt, linea]) => `<label class="opcion"><input type="radio" name="pago" value="${val}" ${eleccion.pago === val ? 'checked' : ''}>
              <span><b>${txt}</b>${v === 'A' && val === 'credito' ? ' <em class="etiqueta-recomendado">Recomendado</em>' : ''}${v === 'B' ? `<br><small>${linea}</small>` : ''}</span></label>`).join('')}
            <p class="campo-error" id="error-pago"></p></fieldset>
          ${v === 'B' ? `<section class="extras"><label class="opcion"><input type="checkbox" id="repetir" ${eleccion.repetir ? 'checked' : ''}><span>Repetir este pedido en la campaña ${c + 1} (se lo preguntamos de nuevo antes de enviarlo)</span></label></section>` : ''}
          <div class="total"><span>Total</span><b>${colones(total)}</b></div>
          ${v === 'A' ? '<p class="letra-chica">Incluye: pedido automático en las próximas campañas (puede cancelarlo en Perfil)</p>' : ''}
          <button class="btn-principal ancho" id="enviar">Enviar pedido</button>
        </div></div>`;
      raiz.querySelector('#seguro').onchange = (e) => { eleccion.seguro = e.target.checked; pintar(); };
      raiz.querySelectorAll('[name="pago"]').forEach((r) => (r.onchange = () => { eleccion.pago = r.value; }));
      const repetir = raiz.querySelector('#repetir');
      if (repetir) repetir.onchange = () => { eleccion.repetir = repetir.checked; };
      const brochas = raiz.querySelector('#brochas');
      if (brochas) brochas.onclick = () => { agregarAlCarrito(BROCHAS, 1, v === 'A' ? 6900 : undefined); pintar(); };
      raiz.querySelector('#enviar').onclick = () => {
        if (!eleccion.pago) {
          const error = raiz.querySelector('#error-pago');
          error.closest('.campo').classList.add('con-error');
          error.textContent = 'Elija cómo va a pagar su pedido.';
          return;
        }
        enviar(app, { lineas, subtotal, total, ganancia, eleccion, campana: c });
      };
    };
    pintar();
  },
};

function enviar(app, { lineas, subtotal, total, ganancia, eleccion, campana }) {
  const codigo = app.estado.sesion.codigo;
  const numero = app.servidor.recibirPedido(codigo, { lineas: lineas.length, total: subtotal, campana, hechoPor: app.estado.hechoPor });
  const pedido = {
    numero: numero || app.estado.pedidos.length + 1, campana, total, subtotal, ganancia, porcentaje: porcentajeGanancia(subtotal),
    unidades: lineas.reduce((s, l) => s + l.cant, 0), lineas: app.estado.carrito.map((l) => ({ ...l })),
    pago: eleccion.pago, seguro: eleccion.seguro, automatico: eleccion.repetir, estado: 'En preparación', fecha: 'Hoy', hechoPor: app.estado.hechoPor,
  };
  app.estado.pedidos.push(pedido);
  if (eleccion.repetir) app.estado.pedidoAutomatico = true;
  app.estado.carrito = [];
  app.guardar();
  app.ir('/P18');
}
