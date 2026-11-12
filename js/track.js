// js/track.js · El único módulo que manda eventos de Mi Guaria. Todos los datos son de práctica.
import { config } from './config.js';
import { cargarMixpanel } from './mixpanel-cargador.js';

// Semáforo rojo puesto en código: ninguna propiedad con estos nombres sale del navegador.
const LISTA_ROJA = ['nombre', 'apellido', 'identificacion', 'cedula', 'telefono', 'celular', 'correo', 'email', 'direccion',
  'ubicacion', 'latitud', 'longitud', 'firma', 'foto', 'codigo_vendedora', 'saldo', 'credito'];
const FORMA = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/; // objeto_accion, minúscula, sin tildes ni eñes
const HOSTS = { us: 'https://api-js.mixpanel.com', eu: 'https://api-eu.mixpanel.com', in: 'https://api-in.mixpanel.com' };
export const modo = config.tokenMixpanel ? 'mixpanel' : 'consola';
const supers = { datos_de_practica: true, participante: localStorage.getItem('mg_participante') || 'sin_iniciales' };
const nuevoAnonimo = () => { const id = 'anon-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('mg_anonimo', id); return id; };
let idActual = localStorage.getItem('mg_id_actual') || localStorage.getItem('mg_anonimo') || nuevoAnonimo();

if (modo === 'mixpanel') {
  cargarMixpanel();
  window.mixpanel.init(config.tokenMixpanel, { debug: true, persistence: 'localStorage', api_host: HOSTS[config.region] || HOSTS.us });
  window.mixpanel.register(supers);
} else {
  window.mixpanel = window.mixpanel || { track: (n, p) => console.info('[mixpanel directo, sin pasar por track.js]', n, p) };
}

const mostrar = (detalle) => window.dispatchEvent(new CustomEvent('mg:evento', { detail: { hora: new Date(), modo, ...detalle } }));

function enviar(nombre, propiedades = {}, emisor, distinctId) {
  const limpias = {}, rojas = [];
  for (const [clave, valor] of Object.entries(propiedades)) {
    if (LISTA_ROJA.includes(clave.toLowerCase())) rojas.push(clave); else limpias[clave] = valor;
  }
  if (rojas.length) console.warn(`track.js quitó de «${nombre}» las propiedades de la lista roja: ${rojas.join(', ')}`);
  if (!FORMA.test(nombre) || nombre.length >= 40) {
    console.warn(`track.js rechazó el evento «${nombre}»: el nombre no tiene la forma objeto_accion.`);
    return mostrar({ nombre, propiedades, emisor, distinctId, rojas, rechazado: 'nombre fuera de la forma objeto_accion' });
  }
  const final = { ...limpias, emisor, ...(emisor === 'servidor' ? { distinct_id: distinctId } : {}) };
  if (modo === 'mixpanel') window.mixpanel.track(nombre, final);
  mostrar({ nombre, propiedades: { ...final, ...supers }, emisor, distinctId, rojas });
}

export const track = (nombre, propiedades) => enviar(nombre, propiedades, 'navegador', idActual);
export const trackServidor = (nombre, propiedades, idAnalitica) => enviar(nombre, propiedades, 'servidor', idAnalitica);

export function identificar(idAnalitica) {
  idActual = idAnalitica; localStorage.setItem('mg_id_actual', idAnalitica);
  if (modo === 'mixpanel') window.mixpanel.identify(idAnalitica);
  mostrar({ identidad: 'identify', distinctId: idAnalitica });
}

export function cerrarSesion() {
  if (modo === 'mixpanel') window.mixpanel.reset();
  localStorage.removeItem('mg_id_actual'); idActual = nuevoAnonimo();
  mostrar({ identidad: 'reset', distinctId: idActual });
}

export function fijarParticipante(iniciales) {
  supers.participante = iniciales || 'sin_iniciales'; localStorage.setItem('mg_participante', supers.participante);
  if (modo === 'mixpanel') window.mixpanel.register({ participante: supers.participante });
}

export const idDeAhora = () => idActual;
