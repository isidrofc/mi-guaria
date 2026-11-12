// js/servidor-simulado.js · Hace de servidor de Mi Guaria, que no tiene uno. Los eventos con emisor «servidor» salen de aquí.
// Guarda en localStorage, como si fuera la base de datos, a cada vendedora de práctica con su id_analitica.
import { trackServidor } from './track.js';

const CLAVE = 'mg_bd';
const CODIGO_SMS = '482913'; // código de verificación de práctica

function base() {
  return {
    siguiente: 123,
    solicitudes: [],
    // Vendedoras migradas de la aplicación vieja (sesiones 1 y 4). Ya estaban nombradas antes de la práctica.
    vendedoras: {
      'V-00042': { id_analitica: 'va_k3m9q2', zona: 'Z07', campana_nombramiento: 1, puerta_entrada: 'migracion', condicion_venta: 'contado', contrasena: 'Gu4ria*26', accesoCreado: false, pedidos: 2, intentos: 1, variante: 'a_correo_contrasena', historial: true },
      'V-05012': { id_analitica: 'va_p8t4w1', zona: 'Z12', campana_nombramiento: 6, puerta_entrada: 'lider_zona', condicion_venta: 'credito', contrasena: 'Rk7#qP2m', accesoCreado: false, pedidos: 0, intentos: 1, variante: 'a_correo_contrasena', historial: false },
    },
    codigo: null, // { vendedora, vence, intentos }
  };
}

let bd = cargar();
function cargar() { try { return JSON.parse(localStorage.getItem(CLAVE)) || base(); } catch { return base(); } }
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(bd)); }
const nuevoId = () => 'va_' + Math.random().toString(36).slice(2, 8);

export function reiniciarBase() { bd = base(); guardar(); }
export const vendedora = (codigo) => bd.vendedoras[codigo] || null;
export const solicitudesPendientes = () => bd.solicitudes.filter((s) => s.estado === 'pendiente').length;

export function normalizarCodigo(texto) {
  const numeros = String(texto || '').replace(/[^0-9]/g, '');
  return numeros ? 'V-' + numeros.padStart(5, '0').slice(-5) : '';
}

// P05 · La vendedora envía su solicitud de afiliación.
export function recibirSolicitud({ condicion_venta, tieneCorreo }) {
  bd.solicitudes.push({ estado: 'pendiente', condicion_venta: condicion_venta || 'contado', tieneCorreo: !!tieneCorreo, puerta_entrada: 'autoafiliacion' });
  guardar();
}

// Panel de quien presenta · El equipo de aprobaciones aprueba la solicitud. Si no hay una pendiente, crea una de práctica.
export function aprobarSolicitud({ puerta = 'lider_zona', campana = 7, variante = 'b_sms_codigo' } = {}) {
  let solicitud = bd.solicitudes.find((s) => s.estado === 'pendiente');
  if (!solicitud) { solicitud = { estado: 'pendiente', condicion_venta: 'contado', tieneCorreo: true, puerta_entrada: puerta }; bd.solicitudes.push(solicitud); }
  solicitud.estado = 'aprobada';
  const codigo = 'V-' + String(bd.siguiente++).padStart(5, '0');
  const v = { id_analitica: nuevoId(), zona: 'Z07', campana_nombramiento: campana, puerta_entrada: solicitud.puerta_entrada, condicion_venta: solicitud.condicion_venta, contrasena: variante === 'a_correo_contrasena' ? 'Gu4r!a-7Kp' : null, accesoCreado: false, pedidos: 0, intentos: 0, variante, historial: false };
  bd.vendedoras[codigo] = v;
  guardar();
  trackServidor('vendedora_nombrada', { puerta_entrada: v.puerta_entrada, zona: v.zona, campana, condicion_venta: v.condicion_venta }, v.id_analitica);
  return codigo;
}

// P07 · El proveedor de correo o de mensajes de texto acepta el envío del mensaje de bienvenida.
export function enviarBienvenida(codigo, canal) {
  const v = vendedora(codigo);
  if (!v) return null;
  v.intentos = Math.min((v.intentos || 0) + 1, 3);
  if (canal === 'correo' && !v.contrasena) v.contrasena = 'Gu4r!a-7Kp'; // contraseña temporal de práctica
  guardar();
  trackServidor('invitacion_enviada', { canal, intento: v.intentos, variante_activacion: v.variante }, v.id_analitica);
  return { intento: v.intentos, token: v.id_analitica.slice(3) + v.intentos };
}

// P09 · Se abre el enlace del mensaje de bienvenida. Devuelve false si el enlace venció.
export function abrirEnlace(token, vencido) {
  const v = Object.values(bd.vendedoras).find((x) => token && token.startsWith(x.id_analitica.slice(3)));
  if (!vencido) return true;
  if (v) trackServidor('acceso_fallido', { tipo_error: 'enlace_vencido' }, v.id_analitica);
  return false;
}

// P09 A · Usuario (solo los cinco números) y contraseña temporal.
export function iniciarSesion(usuario, contrasena) {
  const codigo = /^\d{5}$/.test(usuario) ? 'V-' + usuario : null;
  const v = codigo && vendedora(codigo);
  if (v && v.contrasena && v.contrasena === contrasena) return codigo;
  if (v) trackServidor('acceso_fallido', { tipo_error: 'contrasena_rechazada' }, v.id_analitica);
  return null;
}

// P09 B y P10 · El servidor manda el código de verificación por mensaje de texto.
export function enviarCodigo(codigo, segundos) {
  bd.codigo = { vendedora: codigo, vence: Date.now() + segundos * 1000, intentos: 0 };
  guardar();
  return CODIGO_SMS;
}

// P10 · El servidor revisa el código. creaAcceso dice si este paso crea el acceso de la vendedora.
export function validarCodigo(ingresado, creaAcceso) {
  const c = bd.codigo;
  const v = c && vendedora(c.vendedora);
  if (!v) return 'incorrecto';
  c.intentos += 1;
  guardar();
  if (Date.now() > c.vence) {
    trackServidor('acceso_fallido', { tipo_error: 'codigo_vencido' }, v.id_analitica);
    return 'vencido';
  }
  if (String(ingresado).replace(/\s/g, '') !== CODIGO_SMS) {
    trackServidor('acceso_fallido', { tipo_error: 'codigo_incorrecto' }, v.id_analitica);
    return 'incorrecto';
  }
  if (creaAcceso && !v.accesoCreado) {
    v.accesoCreado = true; guardar();
    trackServidor('acceso_creado', { metodo: 'codigo_sms', intentos: c.intentos }, v.id_analitica);
  }
  return 'ok';
}

// P10 A · El código venció sin que la vendedora lo escribiera.
export function marcarCodigoVencido() {
  const v = bd.codigo && vendedora(bd.codigo.vendedora);
  if (v) trackServidor('acceso_fallido', { tipo_error: 'codigo_vencido' }, v.id_analitica);
}

// P11 · El servidor acepta o rechaza la contraseña nueva. Reglas A: 8 caracteres, mayúscula, número y símbolo. Reglas B y C: 15 caracteres.
export function crearContrasena(codigo, contrasena, reglas) {
  const v = vendedora(codigo);
  if (!v) return false;
  v.intentosContrasena = (v.intentosContrasena || 0) + 1;
  const valida = reglas === 'A'
    ? contrasena.length >= 8 && /[A-Z]/.test(contrasena) && /[a-z]/.test(contrasena) && /\d/.test(contrasena) && /[^A-Za-z0-9]/.test(contrasena)
    : contrasena.length >= 15;
  if (!valida) {
    guardar();
    trackServidor('acceso_fallido', { tipo_error: 'contrasena_rechazada' }, v.id_analitica);
    return false;
  }
  v.contrasena = contrasena;
  const primera = !v.accesoCreado;
  v.accesoCreado = true;
  guardar();
  if (primera) trackServidor('acceso_creado', { metodo: 'contrasena', intentos: v.intentosContrasena }, v.id_analitica);
  return true;
}

// P13 y P14 · El servidor anota el ingreso. Devuelve true si es el primero.
export function registrarIngreso(codigo) {
  const v = vendedora(codigo);
  if (!v) return false;
  v.ingresos = (v.ingresos || 0) + 1;
  guardar();
  return v.ingresos === 1;
}

// P17 · El servidor guarda el pedido y le asigna su número.
export function recibirPedido(codigo, { lineas, total, campana, hechoPor }) {
  const v = vendedora(codigo);
  if (!v) return null;
  v.pedidos += 1;
  guardar();
  const monto_rango = total >= 80000 ? '80000_o_mas' : total >= 40000 ? '40000_79999' : '20000_39999';
  trackServidor('pedido_enviado', { numero_pedido: v.pedidos, hecho_por: hechoPor, monto_rango, lineas, campana }, v.id_analitica);
  return v.pedidos;
}
