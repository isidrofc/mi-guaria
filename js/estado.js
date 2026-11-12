// js/estado.js · Estado de la aplicación en este navegador: versiones, escenario, pedido, mensajes y sesión (datos de práctica).
import { producto, totalLineas } from './datos.js';

const CLAVE = 'mg_estado';

// Pantallas con más de una versión. P14: A es la cuenta regresiva falsa, B la honesta y C la que no explica nada.
export const VERSIONES = {
  P01: ['A', 'B'], P02: ['A', 'B'], P03: ['A', 'B'], P04: ['A', 'B'], P05: ['A', 'B'], P06: ['A', 'B'],
  P07: ['A', 'B'], P08: ['A', 'B'], P09: ['A', 'B'], P10: ['A', 'B'], P11: ['A', 'B', 'C'], P12: ['A', 'B'],
  P13: ['A', 'B'], P14: ['A', 'B', 'C'], P16: ['A', 'B'], P17: ['A', 'B'], P18: ['A', 'B'],
};
export const NOMBRES_P14 = { A: 'falsa', B: 'honesta', C: 'sin explicación' };
const ALIAS_P14 = { falsa: 'A', honesta: 'B', sin: 'C', sin_explicacion: 'C' };

function inicial() {
  return {
    global: 'B', versiones: {}, escenario: '2', campana: 7,
    carrito: [], pedidos: [], mensajes: [], sesion: null, solicitud: null, formulario: {},
    hechoPor: 'vendedora', puerta: 'lider_zona', franja: true, enlaceVencido: false,
    tutorialVisto: false, ultimaRutaWeb: '/P01', p11cMostrada: false,
  };
}

function cargar() {
  try { return { ...inicial(), ...JSON.parse(localStorage.getItem(CLAVE) || '{}') }; } catch { return inicial(); }
}

export const estado = cargar();

export function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento: sigue en memoria */ }
}

// Borra el recorrido (pedido, sesión, mensajes), pero conserva versiones, escenario y franja.
export function reiniciarRecorrido() {
  const { global, versiones, escenario, franja } = estado;
  Object.assign(estado, inicial(), { global, versiones, escenario, franja });
  guardar();
}

export function version(id) {
  const opciones = VERSIONES[id];
  if (!opciones) return '';
  const propia = estado.versiones[id];
  if (propia && opciones.includes(propia)) return propia;
  return opciones.includes(estado.global) ? estado.global : opciones[0];
}

export function fijarVersion(id, v) {
  if (id === 'global') { estado.global = v; estado.versiones = {}; }
  else if (VERSIONES[id]?.includes(v)) estado.versiones[id] = v;
  guardar();
}

// Lee la dirección: ?v=A (todas), ?P09=B (una pantalla), ?P14=falsa, ?s=1 (escenario), ?franja=0, ?nuevo=1.
export function aplicarParametros(busqueda) {
  const p = new URLSearchParams(busqueda);
  const escenario = p.get('s');
  if (p.get('nuevo') === '1' || (escenario && escenario !== estado.escenario)) reiniciarRecorrido();
  if (escenario && ['1', '2', '3', '4'].includes(escenario)) estado.escenario = escenario === '3' ? '2' : escenario;
  const v = (p.get('v') || '').toUpperCase();
  if (['A', 'B'].includes(v)) { estado.global = v; estado.versiones = {}; }
  for (const id of Object.keys(VERSIONES)) {
    let valor = p.get(id);
    if (!valor) continue;
    valor = id === 'P14' && ALIAS_P14[valor.toLowerCase()] ? ALIAS_P14[valor.toLowerCase()] : valor.toUpperCase();
    if (VERSIONES[id].includes(valor)) estado.versiones[id] = valor;
  }
  if (p.has('franja')) estado.franja = p.get('franja') !== '0';
  guardar();
}

export function busquedaActual() {
  const p = new URLSearchParams();
  p.set('v', estado.global);
  if (estado.escenario !== '2') p.set('s', estado.escenario);
  for (const [id, v] of Object.entries(estado.versiones)) p.set(id, v);
  if (!estado.franja) p.set('franja', '0');
  return '?' + p.toString();
}

// Pedido en armado («Mi pedido»).
export function lineasCarrito() {
  return estado.carrito.map((l) => ({ ...l, producto: producto(l.id) }));
}
export const totalCarrito = () => totalLineas(estado.carrito);
export const cantidadCarrito = () => estado.carrito.reduce((s, l) => s + l.cant, 0);

export function agregarAlCarrito(id, cant = 1, precio) {
  const linea = estado.carrito.find((l) => l.id === id);
  if (linea) linea.cant += cant; else estado.carrito.push({ id, cant, ...(precio ? { precio } : {}) });
  guardar();
}
