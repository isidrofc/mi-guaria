// js/pantallas/perfil.js · P20, perfil: cambiar contraseña, avisos, pedido automático y salir.
import { esc, encabezadoSesion, icono } from '../ui.js';
import { cantidadCarrito } from '../estado.js';

export default {
  id: 'P20', titulo: 'Perfil', direccion: 'mi.guaria/perfil',
  dibujar(raiz, v, app) {
    const sesion = app.asegurarSesion();
    const vendedora = app.servidor.vendedora(sesion.codigo) || {};
    const avisos = (app.estado.avisos ||= { sms: true, correo: false, notificaciones: false });
    const interruptor = (id, texto, activo) => `<label class="interruptor"><span>${texto}</span><input type="checkbox" data-aviso="${id}" ${activo ? 'checked' : ''}><i></i></label>`;
    raiz.innerHTML = `<div class="p20">${encabezadoSesion(cantidadCarrito())}
      <div class="cuerpo"><h1 class="titulo-seccion">Perfil</h1>
        <section class="perfil-datos">
          <span class="avatar grande">${icono('persona', 28)}</span>
          <div><b>Código de vendedora: ${esc(sesion.codigo)}</b><br><small>Zona ${esc(vendedora.zona || 'Z07')} · Su líder de zona: Ana (práctica)</small></div>
        </section>
        <section class="perfil-bloque"><h2>Contraseña</h2>
          <button class="fila-boton" data-ir="/P11">${icono('candado', 20)}<span>Cambiar contraseña</span></button></section>
        <section class="perfil-bloque"><h2>Avisos</h2>
          ${interruptor('sms', 'Mensaje de texto un día antes del cierre de la campaña', avisos.sms)}
          ${interruptor('correo', 'Correo con el boletín de la campaña', avisos.correo)}
          ${interruptor('notificaciones', 'Notificaciones en este teléfono', avisos.notificaciones)}</section>
        <section class="perfil-bloque"><h2>Pedido automático</h2>
          ${interruptor('automatico', 'Repetir mi pedido en las próximas campañas', !!app.estado.pedidoAutomatico)}</section>
        <button class="btn-secundario ancho" id="salir">Salir de Mi Guaria</button>
        <p class="marca-practica">Datos de práctica</p>
      </div></div>`;
    raiz.querySelectorAll('[data-aviso]').forEach((c) => (c.onchange = () => {
      if (c.dataset.aviso === 'automatico') { app.estado.pedidoAutomatico = c.checked; app.aviso(c.checked ? 'Activó el pedido automático.' : 'Canceló el pedido automático.'); }
      else avisos[c.dataset.aviso] = c.checked;
      app.guardar();
    }));
    raiz.querySelector('#salir').onclick = () => app.salir();
  },
};
