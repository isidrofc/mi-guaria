// js/pantallas/confirmacion.js · P18, confirmación del pedido. Si P11 está en la versión C, aquí se ofrece crear la contraseña.
import { encabezadoSesion, icono, colones } from '../ui.js';
import { cantidadCarrito } from '../estado.js';
import { CIERRES } from '../datos.js';
import { formularioB } from './contrasena.js';

const dia = (n) => ((n - 1) % 31) + 1;

// Fechas de práctica a partir del día de cierre de la campaña (martes).
function fechas(campana) {
  const d = Number((CIERRES[campana] || 'martes 9').split(' ')[1]);
  return { factura: `martes ${d}`, desde: `jueves ${dia(d + 2)}`, hasta: `sábado ${dia(d + 4)}`, limite: `lunes ${dia(d + 13)}` };
}

function textoPago(p, f) {
  if (p.pago === 'credito') return `Lo paga a crédito, con fecha límite el ${f.limite}`;
  if (p.pago === 'sinpe') return `Lo paga por SINPE Móvil antes de que se facture, el ${f.factura} a mediodía`;
  return 'Lo paga al recibirlo';
}

export default {
  id: 'P18', titulo: 'Pedido enviado', direccion: 'mi.guaria/mi-pedido/enviado',
  dibujar(raiz, v, app) {
    app.asegurarSesion();
    const p = app.estado.pedidos[app.estado.pedidos.length - 1];
    if (v === 'A') {
      raiz.innerHTML = `<div class="p18a">${encabezadoSesion(cantidadCarrito())}
        <div class="p18a-centro">${icono('visto', 72)}<h1>Operación exitosa</h1><button class="btn-principal" data-ir="/P14">Volver al inicio</button></div></div>`;
    } else {
      // Sin un pedido enviado en este navegador se muestra el ejemplo fijo de la sesión 4.
      const t = p ? (() => { const f = fechas(p.campana); return {
        titulo: `Su pedido de la campaña ${p.campana} ya está enviado`,
        resumen: `Pedido N.º ${p.numero} · ${p.unidades} producto${p.unidades === 1 ? '' : 's'} · ${colones(p.total)}`,
        ganancia: `Su ganancia en esta campaña: ${colones(p.ganancia)} (${p.porcentaje} %)`,
        factura: `Se factura el ${f.factura}`, entrega: `Le llega entre el ${f.desde} y el ${f.hasta}`, pago: textoPago(p, f) }; })()
        : { titulo: 'Su pedido de la campaña 5 ya está enviado', resumen: 'Pedido N.º 2 · 14 productos · ₡48.500', ganancia: 'Su ganancia en esta campaña: ₡14.550 (30 %)',
          factura: 'Se factura el martes 12', entrega: 'Le llega entre el jueves 14 y el sábado 16', pago: 'Lo paga al recibirlo, a crédito, con fecha límite el lunes 25' };
      raiz.innerHTML = `<div class="p18b">${encabezadoSesion(cantidadCarrito())}
        <div class="cuerpo">
          <div class="icono-grande ok">${icono('visto', 44)}</div>
          <h1 class="af-titulo">${t.titulo}</h1>
          <p class="p18b-resumen">${t.resumen}</p>
          <p class="p18b-ganancia">${t.ganancia}</p>
          <ul class="p18b-fechas">
            <li>${icono('pedidos', 20)}<span>${t.factura}</span></li>
            <li>${icono('bolsa', 20)}<span>${t.entrega}</span></li>
            <li>${icono('reloj', 20)}<span>${t.pago}</span></li>
          </ul>
          <button class="btn-principal ancho" data-ir="/P19">Ver mi pedido</button>
          <button class="btn-secundario ancho" data-ir="/P14">Volver al inicio</button>
          <p class="marca-practica">Datos de práctica</p>
        </div></div>`;
    }
    // P11 C: después del primer pedido se ofrece crear la contraseña.
    if (app.version('P11') === 'C' && p && !app.estado.p11cMostrada) {
      app.despues(1200, () => {
        app.estado.p11cMostrada = true;
        app.guardar();
        app.etiqueta('P11 C');
        app.hoja(`<h2>¿Quiere crear una contraseña para entrar más rápido la próxima vez?</h2>
          <button class="btn-principal ancho" id="crear">Crear ahora</button><button class="btn-secundario ancho" id="despues">Después</button>`, (hoja) => {
          hoja.querySelector('#despues').onclick = () => { app.cerrarCapa(); app.etiqueta(null); };
          hoja.querySelector('#crear').onclick = () => {
            app.cerrarCapa();
            formularioB(raiz, app, () => { app.estado.contrasenaCreada = true; app.guardar(); app.aviso('Listo. La próxima vez puede entrar con su contraseña.'); app.ir('/P14'); });
          };
        });
      });
    }
  },
};
