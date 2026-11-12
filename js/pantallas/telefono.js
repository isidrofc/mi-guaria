// js/pantallas/telefono.js · Teléfono simulado: pantalla de inicio, buzón de correo y mensajes de texto. P07 vive aquí.
import { esc, icono, logo } from '../ui.js';
import { BOLETINES } from '../datos.js';

function cuerpoConEnlace(m) {
  const partes = esc(m.cuerpo).split('{enlace}');
  const enlace = m.enlace ? `<a href="#${esc(m.enlace.ruta)}" class="enlace-mensaje">${esc(m.enlace.texto)}</a>` : '';
  return partes.join(enlace);
}

export const telefono = {
  id: 'telefono', titulo: 'Teléfono simulado',
  dibujar(raiz, v, app) {
    const sinLeer = (tipo) => app.estado.mensajes.filter((m) => !m.leido && (tipo === 'correo' ? m.app === 'correo' : m.app !== 'correo')).length;
    const insignia = (n) => (n ? `<span class="insignia">${n}</span>` : '');
    raiz.innerHTML = `<div class="tel-inicio">
      <div class="tel-hora">${new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: false })}</div>
      <div class="tel-fecha">Teléfono simulado · datos de práctica</div>
      <div class="tel-apps">
        <button class="tel-app" data-ir="${esc(app.estado.ultimaRutaWeb || '/P01')}"><span class="tel-icono tel-web">${logo(34, false, true)}</span>Mi Guaria</button>
        <button class="tel-app" data-ir="/correo"><span class="tel-icono tel-correo">${icono('correo', 30)}${insignia(sinLeer('correo'))}</span>Correo</button>
        <button class="tel-app" data-ir="/mensajes"><span class="tel-icono tel-sms">${icono('mensajes', 30)}${insignia(sinLeer('sms'))}</span>Mensajes</button>
      </div></div>`;
  },
};

function bandeja(raiz, app, buscar) {
  const correos = app.estado.mensajes.filter((m) => m.app === 'correo').slice().reverse();
  const filtrados = buscar ? correos.filter((m) => m.de === 'Mi Guaria') : correos;
  const boletines = buscar ? [] : BOLETINES;
  const espera = !buscar && !correos.some((m) => m.clase === 'bienvenida') && app.estado.escenario === '2';
  raiz.innerHTML = `<div class="app-correo">
    <div class="correo-cabeza">${icono('correo', 20)} <b>Correo</b><span class="enc-espacio"></span><span class="correo-cuenta">Cuenta de práctica</span></div>
    <div class="correo-buscar">${icono('buscar', 16)} <span>${buscar ? 'de:(Mi Guaria) en todas las carpetas' : 'Buscar en el correo'}</span></div>
    ${buscar ? '<p class="correo-nota">Abierto desde «Abrir mi correo»: la búsqueda por el remitente ya está hecha.</p>' : ''}
    ${espera ? '<p class="correo-nota">Todavía no ha llegado el mensaje de bienvenida de Mi Guaria. Llega cuando aprueban la solicitud.</p>' : ''}
    <ul class="correo-lista">
      ${filtrados.map((m) => `<li><a href="#/correo/${m.id}" class="correo-fila ${m.leido ? '' : 'sin-leer'}"><span class="correo-de">${esc(m.de)}</span><span class="correo-hora">${esc(m.hora)}</span><span class="correo-asunto">${esc(m.asunto)}</span></a></li>`).join('')}
      ${boletines.map((b) => `<li><span class="correo-fila"><span class="correo-de">${esc(b.de)}</span><span class="correo-hora">${esc(b.hora)}</span><span class="correo-asunto">${esc(b.asunto)}</span></span></li>`).join('')}
    </ul></div>`;
  if (correos.some((m) => m.clase === 'bienvenida') && !buscar) app.etiqueta('P07 A · buzón');
}

function correoAbierto(raiz, app, m) {
  m.leido = true;
  app.guardar();
  raiz.innerHTML = `<div class="app-correo">
    <div class="correo-cabeza"><button class="btn-icono" data-ir="/correo" aria-label="Volver al buzón">${icono('flecha', 20)}</button><b>Correo</b></div>
    <article class="correo-mensaje">
      <h1 class="correo-titulo">${esc(m.asunto)}</h1>
      <div class="correo-remitente"><span class="avatar">MG</span><div><b>${esc(m.de)}</b><br><small>${esc(m.remitente || '')} · ${esc(m.hora)}</small></div></div>
      <div class="correo-cuerpo"><p>${cuerpoConEnlace(m)}</p>
      ${m.boton ? `<p><a class="btn-correo" href="#${esc(m.enlace.ruta)}">${esc(m.boton)}</a></p>` : ''}</div>
      <p class="marca-practica">Datos de práctica</p>
    </article></div>`;
  if (m.clase === 'bienvenida') app.etiqueta('P07 A');
}

export const correo = {
  id: 'correo', titulo: 'Correo',
  dibujar(raiz, v, app, params, resto) {
    const m = resto[0] && app.estado.mensajes.find((x) => x.id === resto[0]);
    if (m) correoAbierto(raiz, app, m); else bandeja(raiz, app, params.buscar);
  },
};

function hilos(app) {
  const grupos = {};
  for (const m of app.estado.mensajes.filter((x) => x.app !== 'correo')) (grupos[m.hilo] ||= []).push(m);
  return grupos;
}

export const mensajes = {
  id: 'mensajes', titulo: 'Mensajes',
  dibujar(raiz, v, app, params, resto) {
    const grupos = hilos(app);
    const hilo = resto[0];
    if (hilo && grupos[hilo]) {
      grupos[hilo].forEach((m) => { m.leido = true; });
      app.guardar();
      raiz.innerHTML = `<div class="app-sms">
        <div class="correo-cabeza"><button class="btn-icono" data-ir="/mensajes" aria-label="Volver">${icono('flecha', 20)}</button><span class="avatar">MG</span><b>${esc(grupos[hilo][0].de)}</b></div>
        <div class="sms-hilo">${grupos[hilo].map((m) => `<div class="sms-burbuja"><p>${cuerpoConEnlace(m).replace(/\n/g, '<br>')}</p><small>${esc(m.hora)}</small></div>`).join('')}</div>
        <p class="marca-practica">Datos de práctica</p></div>`;
      if (grupos[hilo].some((m) => m.clase === 'bienvenida')) app.etiqueta('P07 B');
      return;
    }
    const nombres = Object.keys(grupos);
    raiz.innerHTML = `<div class="app-sms">
      <div class="correo-cabeza">${icono('mensajes', 20)} <b>Mensajes</b></div>
      ${nombres.length ? '' : '<p class="correo-nota">No hay mensajes. El mensaje de Mi Guaria llega cuando aprueban la solicitud.</p>'}
      <ul class="correo-lista">${nombres.map((n) => { const u = grupos[n][grupos[n].length - 1]; return `<li><a class="correo-fila ${grupos[n].some((m) => !m.leido) ? 'sin-leer' : ''}" href="#/mensajes/${n}"><span class="correo-de">${esc(u.de)}</span><span class="correo-hora">${esc(u.hora)}</span><span class="correo-asunto">${esc(u.cuerpo.replace('{enlace}', u.enlace?.texto || ''))}</span></a></li>`; }).join('')}</ul></div>`;
  },
};

// P07 · Mensaje de bienvenida. A: correo con usuario y contraseña temporal. B: mensaje de texto con enlace y código de vendedora.
export const p07 = {
  id: 'P07', titulo: 'Mensaje de bienvenida',
  dibujar(raiz, v, app) {
    const bienvenida = app.estado.mensajes.filter((m) => m.clase === 'bienvenida' && (v === 'A' ? m.app === 'correo' : m.app === 'sms')).pop();
    if (v === 'A') return bienvenida ? correoAbierto(raiz, app, bienvenida) : bandeja(raiz, app);
    return mensajes.dibujar(raiz, v, app, {}, bienvenida ? ['miguaria'] : []);
  },
};
