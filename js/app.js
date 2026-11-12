// js/app.js · Arranque de Mi Guaria: teléfono simulado, rutas, avisos, mensajes y panel de quien presenta (datos de práctica).
import { estado, guardar, version, fijarVersion, aplicarParametros, busquedaActual, reiniciarRecorrido, VERSIONES, NOMBRES_P14, cantidadCarrito } from './estado.js';
import * as servidor from './servidor-simulado.js';
import { track, identificar, cerrarSesion, fijarParticipante, modo } from './track.js';
import { dibujarFranja } from './franja.js';
import { esc, icono } from './ui.js';
import { PANTALLAS } from './pantallas/indice.js';

const $ = (sel, raiz = document) => raiz.querySelector(sel);
let etiquetaManual = null;
let primeraCarga = true;
let temporizadores = [];

// ---------- Rutas ----------
function rutaActual() {
  const [ruta, consulta] = (location.hash.replace(/^#/, '') || '/P01').split('?');
  return { ruta, params: Object.fromEntries(new URLSearchParams(consulta || '')) };
}

export const app = {
  estado, servidor, version,
  get primeraCarga() { return primeraCarga; },
  ir(ruta, params) {
    const consulta = params ? '?' + new URLSearchParams(params).toString() : '';
    if (location.hash === '#' + ruta + consulta) render();
    else location.hash = '#' + ruta + consulta;
  },
  volver() { history.length > 1 ? history.back() : app.ir('/telefono'); },
  limpiarParametros() {
    const { ruta } = rutaActual();
    history.replaceState(null, '', location.pathname + location.search + '#' + ruta);
  },
  etiqueta(texto) { etiquetaManual = texto; pintarEtiqueta(); },
  // Temporizadores que se cancelan solos al cambiar de pantalla.
  despues(ms, fn) { const t = setTimeout(fn, ms); temporizadores.push(t); return t; },
  cada(ms, fn) { const t = setInterval(fn, ms); temporizadores.push(t); return t; },

  // ---------- Avisos dentro del teléfono ----------
  aviso(texto, { accion, ms = 3500 } = {}) {
    const capa = $('#avisos');
    const el = document.createElement('div');
    el.className = 'aviso-flotante';
    el.innerHTML = `<span>${esc(texto)}</span>${accion ? `<button class="btn-texto claro">${esc(accion.texto)}</button>` : ''}`;
    if (accion) el.querySelector('button').onclick = () => { accion.fn(); el.remove(); };
    capa.appendChild(el);
    setTimeout(() => el.remove(), ms);
  },
  notificar({ app: nombreApp, de, texto, ms = 6000, alTocar }) {
    const el = $('#notificacion');
    el.innerHTML = `<div class="noti-app">${icono(nombreApp === 'Correo' ? 'correo' : 'mensajes', 16)} ${esc(nombreApp)} · ahora</div>
      <div class="noti-de">${esc(de)}</div><div class="noti-texto">${esc(texto)}</div>`;
    el.hidden = false;
    el.onclick = () => { el.hidden = true; if (alTocar) alTocar(); };
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, ms);
  },
  // Ventana de permiso con el aspecto de la del navegador (simulada: no se pide la ubicación real).
  permiso({ texto, iconoNombre = 'ubicacion', alResponder }) {
    const capa = $('#capa');
    capa.innerHTML = `<div class="permiso" role="dialog" aria-label="Permiso del navegador">
      <div class="permiso-origen">${icono(iconoNombre, 18)} <b>mi.guaria</b> quiere</div>
      <div class="permiso-texto">${esc(texto)}</div>
      <div class="permiso-botones"><button data-r="bloquear">Bloquear</button><button data-r="permitir">Permitir</button></div>
      <div class="permiso-nota">Ventana simulada para la práctica. No se usa la ubicación real.</div></div>`;
    capa.classList.add('visible');
    capa.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => { app.cerrarCapa(); alResponder?.(b.dataset.r === 'permitir'); }));
  },
  hoja(html, montar) {
    const capa = $('#capa');
    capa.innerHTML = `<div class="hoja" role="dialog">${html}</div>`;
    capa.classList.add('visible', 'con-fondo');
    montar?.(capa.firstElementChild);
  },
  cerrarCapa() { const capa = $('#capa'); capa.innerHTML = ''; capa.className = 'capa'; capa.onclick = null; },
  menu() { abrirMenu(); },

  // ---------- Mensajes del buzón y del teléfono simulados ----------
  agregarMensaje(m) {
    const mensaje = { id: 'm' + Date.now() + Math.random().toString(36).slice(2, 5), hora: horaTelefono(), leido: false, ...m };
    estado.mensajes.push(mensaje);
    guardar();
    if (!m.silencioso) {
      app.notificar({
        app: m.app === 'correo' ? 'Correo' : m.app === 'whatsapp' ? 'WhatsApp' : 'Mensajes',
        de: m.de, texto: m.app === 'correo' ? m.asunto : m.cuerpo.replace(/\{enlace\}/g, m.enlace?.texto || ''),
        ms: m.notiMs || 6000,
        alTocar: m.persistente === false ? null : () => app.ir(m.app === 'correo' ? '/correo/' + mensaje.id : '/mensajes/' + m.hilo),
      });
    }
    if (rutaActual().ruta.startsWith('/correo') || rutaActual().ruta.startsWith('/mensajes') || rutaActual().ruta === '/telefono' || rutaActual().ruta === '/P07') render();
    return mensaje;
  },
  entregarBienvenida(codigo, canal, intento, token) {
    const contenido = contenidoBienvenida(codigo, canal, intento, token);
    return app.agregarMensaje({ ...contenido, clase: 'bienvenida', canal });
  },
  // Pide al servidor que mande el mensaje de bienvenida por el canal de la versión actual de P07 y lo entrega.
  mandarBienvenida(canal) {
    const codigo = estado.vendedoraPractica;
    if (!codigo) { app.aviso('No hay una vendedora aprobada. Primero apruebe la solicitud.'); return false; }
    const elegido = canal || (version('P07') === 'A' ? 'correo' : 'sms');
    const envio = servidor.enviarBienvenida(codigo, elegido);
    if (envio) app.entregarBienvenida(codigo, elegido, envio.intento, envio.token);
    return true;
  },
  aprobar() {
    const pendiente = servidor.solicitudesPendientes() > 0;
    const codigo = servidor.aprobarSolicitud({ puerta: pendiente ? 'autoafiliacion' : estado.puerta, campana: estado.campana, variante: version('P07') === 'A' ? 'a_correo_contrasena' : 'b_sms_codigo' });
    estado.vendedoraPractica = codigo;
    if (estado.solicitud) estado.solicitud.estado = 'aprobada';
    guardar();
    app.aviso(`Solicitud aprobada (práctica): ${codigo}. El mensaje de bienvenida sale en unos segundos.`);
    setTimeout(() => app.mandarBienvenida(), 1500);
  },

  // ---------- Sesión ----------
  completarIngreso(codigo, metodo) {
    const v = servidor.vendedora(codigo);
    estado.sesion = { codigo, metodo };
    estado.ingresoEnCurso = null;
    identificar(v.id_analitica);
    if (estado.escenario === '1') { guardar(); return app.ir('/fin'); }
    const primero = servidor.registrarIngreso(codigo);
    estado.ingresoPendiente = { es_primer_ingreso: primero, metodo };
    guardar();
    app.ir(primero ? '/P13' : '/P14');
  },
  tomarIngresoPendiente() {
    const ingreso = estado.ingresoPendiente;
    estado.ingresoPendiente = null;
    guardar();
    return ingreso;
  },
  // Para abrir directamente una pantalla con sesión (por ejemplo, desde un código QR) sin recorrer el flujo.
  asegurarSesion() {
    if (!estado.sesion) { estado.sesion = { codigo: 'V-00042', metodo: 'contrasena', muestra: true }; guardar(); }
    return estado.sesion;
  },
  salir() {
    cerrarSesion();
    estado.sesion = null;
    guardar();
    app.ir('/P09');
  },
  render: () => render(),
  guardar,
};

function horaTelefono() {
  return new Date().toLocaleTimeString('es-CR', { hour: 'numeric', minute: '2-digit', hour12: false });
}

function contenidoBienvenida(codigo, canal, intento, token) {
  const v = servidor.vendedora(codigo);
  const ruta = `/P09?utm_source=${canal}&utm_campaign=bienvenida&intento=${intento}&t=${token}`;
  const s = estado.escenario;
  if (canal === 'correo') {
    const base = { app: 'correo', de: 'Mi Guaria', remitente: 'avisos@mi.guaria (práctica)', enlace: { texto: 'Ingresar', ruta } };
    if (s === '1') return { ...base, asunto: 'Bienvenida a Cosméticos Guaria', cuerpo: `Estimada vendedora: su solicitud fue aprobada. Su código de vendedora es ${codigo} y su contraseña temporal es ${v.contrasena}. Ingrese en Mi Guaria con estos datos. Este mensaje se generó automáticamente, no lo responda.`, boton: 'Ir a Mi Guaria' };
    if (s === '4') return { ...base, asunto: 'Bienvenida a Mi Guaria: sus datos para entrar', cuerpo: `Usted ya es vendedora de Cosméticos Guaria. Su usuario es su código de vendedora: ${codigo}. Su contraseña temporal es: ${v.contrasena}. Entre en miguaria {enlace} y cambie la contraseña en las próximas 48 horas. Si no la cambia, el enlace vence`, enlace: { texto: '(enlace)', ruta } };
    return { ...base, asunto: 'Bienvenida a Mi Guaria', cuerpo: `Su usuario: ${codigo}. Su contraseña temporal: ${v.contrasena}. Vence en 24 horas.`, boton: 'Ingresar' };
  }
  if (canal === 'whatsapp') return { app: 'whatsapp', hilo: 'whatsapp', de: 'Mi Guaria (WhatsApp)', cuerpo: `Mi Guaria: estos son sus datos para entrar. Su código de vendedora es ${codigo}. Entre aquí: {enlace}`, enlace: { texto: 'mi.guaria/entrar', ruta } };
  const sms = { app: 'sms', hilo: 'miguaria', de: 'Mi Guaria', enlace: { texto: 'mi.guaria/entrar', ruta } };
  if (s === '4') return { ...sms, cuerpo: `Mi Guaria: bienvenida. Su código de vendedora es ${codigo}. Toque este enlace para activar su cuenta {enlace}. Al abrirlo le mandamos un código de 6 números a este teléfono`, enlace: { texto: '(enlace)', ruta } };
  return { ...sms, cuerpo: `Mi Guaria: bienvenida. Su código de vendedora es ${codigo}. Entre aquí: {enlace}` };
}

// Sesiones 1 y 4: la vendedora ya estaba nombrada, así que el mensaje de bienvenida está en el teléfono desde el arranque.
function asegurarArranque() {
  if (estado.escenario === '2' || estado.arranque === estado.escenario) return;
  const codigo = estado.escenario === '1' ? 'V-00042' : 'V-05012';
  estado.vendedoraPractica = codigo;
  estado.mensajes = estado.mensajes.filter((m) => m.clase !== 'bienvenida');
  for (const canal of ['correo', 'sms']) {
    const contenido = contenidoBienvenida(codigo, canal, 1, servidor.vendedora(codigo).id_analitica.slice(3) + '1');
    estado.mensajes.push({ id: 'arranque-' + canal, hora: '7:30', leido: false, ...contenido, clase: 'bienvenida', canal });
  }
  estado.arranque = estado.escenario;
  guardar();
}

// ---------- Dibujo ----------
function pintarEtiqueta() {
  const { ruta } = rutaActual();
  const id = ruta.split('/')[1];
  let texto = etiquetaManual;
  if (!texto) {
    const v = version(id);
    texto = VERSIONES[id] ? `${id} ${v}${id === 'P14' ? ' · ' + NOMBRES_P14[v] : ''}` : /^P\d\d$/.test(id) ? id : ({ correo: 'Correo', mensajes: 'Mensajes' }[id] || 'Teléfono');
  }
  $('#codigo-pantalla').textContent = texto;
}

function render() {
  temporizadores.forEach((t) => { clearTimeout(t); clearInterval(t); });
  temporizadores = [];
  etiquetaManual = null;
  app.cerrarCapa();
  const { ruta, params } = rutaActual();
  const partes = ruta.split('/').filter(Boolean);
  const pantalla = PANTALLAS[partes[0]] || PANTALLAS.P01;
  const raiz = $('#pantalla');
  const v = version(pantalla.id) || '';
  const web = pantalla.direccion !== undefined;
  $('#barra-direccion').hidden = !web;
  if (web) {
    $('#barra-direccion').innerHTML = `${icono('candado', 13)}<span>${esc(pantalla.direccion)}</span>`;
    estado.ultimaRutaWeb = ruta;
    guardar();
  }
  raiz.className = `pantalla pantalla-${pantalla.id} v-${v}`;
  raiz.scrollTop = 0;
  pantalla.dibujar(raiz, v, app, params, partes.slice(1));
  pintarEtiqueta();
  primeraCarga = false;
  document.title = `${pantalla.titulo || 'Mi Guaria'} · Mi Guaria (práctica)`;
}

// ---------- Menú de las pantallas con sesión ----------
// No tiene «Guardar pedido»: el pedido se guarda solo. Las tres primeras veces que se abre, el aviso lo explica.
function abrirMenu() {
  const capa = $('#capa');
  capa.innerHTML = `<div class="menu-desplegable" role="menu">
    <button data-ir="/P15" role="menuitem">Catálogo</button><button data-ir="/P16" role="menuitem">Mi pedido</button>
    <button data-ir="/P19" role="menuitem">Mis pedidos</button><button data-accion="ayuda" role="menuitem">Ayuda</button>
    <p class="aviso-info menu-aviso" hidden>Su pedido se guarda solo cada vez que agrega un producto. Puede salir y volver cuando quiera.</p></div>`;
  capa.classList.add('visible', 'con-fondo-claro');
  capa.onclick = (e) => {
    if (e.target === capa) app.cerrarCapa();
    if (e.target.closest('[data-accion="ayuda"]')) { app.cerrarCapa(); app.aviso('En la práctica, Ayuda abriría un mensaje a su líder de zona.'); }
  };
  estado.vecesMenu = (estado.vecesMenu || 0) + 1;
  guardar();
  if (estado.vecesMenu <= 3) app.despues(1500, () => { const aviso = $('.menu-aviso'); if (aviso) aviso.hidden = false; });
}

// ---------- Panel de quien presenta ----------
function abrirPanel() {
  const panel = $('#panel');
  const filas = Object.entries(VERSIONES).map(([id, opciones]) => `<label class="panel-version">${id}
      <select data-version="${id}">${opciones.map((o) => `<option value="${o}" ${version(id) === o ? 'selected' : ''}>${o}${id === 'P14' ? ' · ' + NOMBRES_P14[o] : ''}</option>`).join('')}</select></label>`).join('');
  const irA = Object.values(PANTALLAS).filter((p) => /^P\d\d$/.test(p.id)).map((p) => `<button data-ir="/${p.id}" title="${esc(p.titulo)}">${p.id}</button>`).join('');
  panel.innerHTML = `<div class="panel-caja" role="dialog" aria-label="Panel de quien presenta">
    <div class="panel-cabeza"><b>Panel de quien presenta</b><button data-panel="cerrar" aria-label="Cerrar">×</button></div>
    <p class="panel-nota">Datos de práctica. Este panel cambia solo este navegador o este celular.</p>
    <section><h3>Iniciales de la pareja</h3>
      <input id="panel-iniciales" maxlength="8" placeholder="Ej.: RR-JR" value="${esc(localStorage.getItem('mg_participante') === 'sin_iniciales' ? '' : localStorage.getItem('mg_participante') || '')}">
      <button data-panel="iniciales">Guardar iniciales</button></section>
    <section><h3>Versiones</h3>
      <div class="panel-fila"><button data-global="A" class="${estado.global === 'A' ? 'activo' : ''}">Versión A</button><button data-global="B" class="${estado.global === 'B' ? 'activo' : ''}">Versión B</button></div>
      <details><summary>Por pantalla</summary><div class="panel-versiones">${filas}</div></details></section>
    <section><h3>Escenario</h3>
      <select id="panel-escenario"><option value="1" ${estado.escenario === '1' ? 'selected' : ''}>Sesión 1 · V-00042 ya nombrada</option><option value="2" ${estado.escenario === '2' ? 'selected' : ''}>Sesiones 2 y 3 · afiliación nueva</option><option value="4" ${estado.escenario === '4' ? 'selected' : ''}>Sesión 4 · V-05012</option></select></section>
    <section><h3>Solicitudes y mensajes</h3>
      <p class="panel-nota">Pendientes: ${servidor.solicitudesPendientes()} · Vendedora de práctica: ${esc(estado.vendedoraPractica || 'ninguna')}</p>
      <label class="panel-version">Puerta de entrada si no hay solicitud
        <select id="panel-puerta">${['lider_zona', 'coordinadora', 'autoafiliacion'].map((p) => `<option ${estado.puerta === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
      <div class="panel-fila"><button data-panel="aprobar">Aprobar solicitudes pendientes</button><button data-panel="bienvenida">Enviar mensaje de bienvenida</button></div>
      <div class="panel-fila"><button data-panel="reenviar">Reenviar datos</button><button data-panel="vencer">${estado.enlaceVencido ? 'Enlace vencido (tocar para renovar)' : 'Hacer vencer el enlace'}</button></div></section>
    <section><h3>Este celular</h3>
      <div class="panel-fila"><button data-panel="aprobar">Simular aprobación</button><button data-panel="bienvenida">Simular mensaje de bienvenida</button></div></section>
    <section><h3>Pedido y campaña</h3>
      <label class="panel-version">Quién hace el pedido (hecho_por)
        <select id="panel-hecho">${['vendedora', 'lider_zona', 'coordinadora'].map((p) => `<option ${estado.hechoPor === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
      <div class="panel-fila"><button data-panel="campana">Pasar a la campaña siguiente (hoy ${estado.campana})</button></div></section>
    <section><h3>Eventos</h3>
      <p class="panel-nota">track.js en modo ${modo}${modo === 'consola' ? ' (js/config.js sin token)' : ''}.</p>
      <div class="panel-fila"><button data-panel="franja">${estado.franja ? 'Ocultar la franja' : 'Mostrar la franja'}</button><button data-panel="error">Evento con error (sesión 4)</button></div></section>
    <section><h3>Ir a una pantalla</h3><div class="panel-ir">${irA}<button data-ir="/telefono">Teléfono</button><button data-ir="/correo">Correo</button><button data-ir="/mensajes">Mensajes</button></div></section>
    <section><div class="panel-fila"><button data-panel="cero" class="peligro">Empezar de cero</button></div></section>
  </div>`;
  panel.hidden = false;
}

function accionPanel(accion) {
  const panel = $('#panel');
  if (accion === 'cerrar') { panel.hidden = true; return; }
  if (accion === 'iniciales') { fijarParticipante($('#panel-iniciales').value.trim().replace(/\s+/g, '_')); app.aviso('Iniciales guardadas.'); }
  if (accion === 'aprobar') app.aprobar();
  if (accion === 'bienvenida' || accion === 'reenviar') app.mandarBienvenida();
  if (accion === 'vencer') { estado.enlaceVencido = !estado.enlaceVencido; guardar(); }
  if (accion === 'campana') {
    estado.campana += 1;
    estado.carrito = [];
    estado.pedidos.forEach((p) => { p.estado = 'Entregado'; });
    guardar();
    app.aviso(`Ahora corre la campaña ${estado.campana} (práctica).`);
  }
  if (accion === 'franja') { estado.franja = !estado.franja; guardar(); aplicarFranja(); }
  if (accion === 'error') {
    track('PedidoRepetido', { telefono: 'dato rojo de práctica', productos: 4 }); // ejemplo de evento mal hecho para la sesión 4
  }
  if (accion === 'cero') {
    reiniciarRecorrido(); servidor.reiniciarBase(); cerrarSesion(); estado.arranque = null; guardar();
    asegurarArranque(); panel.hidden = true; app.ir('/P01'); return;
  }
  history.replaceState(null, '', location.pathname + busquedaActual() + location.hash);
  render();
  // Las acciones que simulan algo cierran el panel para que se vea el efecto; los ajustes lo dejan abierto.
  if (['aprobar', 'bienvenida', 'reenviar', 'campana', 'error'].includes(accion)) panel.hidden = true;
  else abrirPanel();
}

function aplicarFranja() {
  document.body.classList.toggle('sin-franja', !estado.franja);
  dibujarFranja();
}

// ---------- Eventos de la página ----------
function prepararLogo() {
  let toques = 0, reloj = null, presion = null;
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.logo')) return;
    presion = setTimeout(() => { presion = 'larga'; abrirPanel(); }, 650);
  });
  document.addEventListener('pointerup', (e) => {
    if (presion && presion !== 'larga') clearTimeout(presion);
    const fueLarga = presion === 'larga';
    presion = null;
    if (fueLarga || !e.target.closest('.logo')) return;
    toques += 1;
    clearTimeout(reloj);
    reloj = setTimeout(() => {
      if (toques >= 3) abrirPanel();
      else if (estado.sesion && /^\/P(1[3-9]|20)/.test(rutaActual().ruta)) app.ir('/P14');
      toques = 0;
    }, 380);
  });
}

document.addEventListener('click', (e) => {
  const ir = e.target.closest('[data-ir]');
  if (ir && !e.defaultPrevented) {
    e.preventDefault();
    if ($('#panel').contains(ir)) $('#panel').hidden = true;
    const destino = ir.dataset.ir.startsWith('/') ? ir.dataset.ir : '/' + ir.dataset.ir;
    app.ir(destino);
    return;
  }
  const global = e.target.closest('[data-global]');
  if (global) { fijarVersion('global', global.dataset.global); accionPanel('refrescar'); return; }
  const panelBoton = e.target.closest('[data-panel]');
  if (panelBoton) { accionPanel(panelBoton.dataset.panel); return; }
  const nav = e.target.closest('[data-nav]');
  if (nav) {
    if (nav.dataset.nav === 'atras') app.volver();
    if (nav.dataset.nav === 'inicio') app.ir('/telefono');
    if (nav.dataset.nav === 'recientes') app.ir(estado.ultimaRutaWeb || '/P01');
  }
  if (e.target.closest('[data-accion="menu"]')) abrirMenu();
  if (e.target.closest('[data-accion="dudas"]')) app.aviso('En la práctica este enlace abriría un mensaje a su líder de zona.');
  if (e.target.closest('[data-accion="no-disponible"]')) app.aviso('Esta opción no está en el prototipo de práctica.');
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-version]')) { fijarVersion(e.target.dataset.version, e.target.value); accionPanel('refrescar'); }
  if (e.target.id === 'panel-escenario') {
    estado.escenario = e.target.value; reiniciarRecorrido(); servidor.reiniciarBase(); estado.arranque = null; guardar(); asegurarArranque(); accionPanel('refrescar');
  }
  if (e.target.id === 'panel-puerta') { estado.puerta = e.target.value; guardar(); }
  if (e.target.id === 'panel-hecho') { estado.hechoPor = e.target.value; guardar(); }
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') { e.preventDefault(); $('#panel').hidden ? abrirPanel() : ($('#panel').hidden = true); }
  if (e.key === 'Escape' && !$('#panel').hidden) $('#panel').hidden = true;
});

$('#codigo-pantalla').addEventListener('click', abrirPanel);
window.addEventListener('hashchange', render);

aplicarParametros(location.search);
history.replaceState(null, '', location.pathname + busquedaActual() + location.hash);
asegurarArranque();
prepararLogo();
aplicarFranja();
render();
window.MiGuaria = { app, estado, servidor, abrirPanel, accionPanel, cantidadCarrito };
