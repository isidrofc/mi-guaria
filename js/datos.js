// js/datos.js · Datos de práctica de Mi Guaria: productos inventados, pedidos anteriores y padrón de nombres inventados.

export const REGLAS = {
  pedidoMinimo: 20000,
  escalones: [
    { desde: 80000, porcentaje: 35 },
    { desde: 40000, porcentaje: 30 },
    { desde: 0, porcentaje: 25 },
  ],
};

export function porcentajeGanancia(total) {
  return REGLAS.escalones.find((e) => total >= e.desde).porcentaje;
}

export function siguienteEscalon(total) {
  return [...REGLAS.escalones].reverse().find((e) => e.desde > total) || null;
}

export const PRODUCTOS = [
  { id: 'p1', codigo: '10234', nombre: 'Crema de manos Guaria', precio: 6500, pagina: 12, forma: 'tubo', colores: ['#E8A3C0', '#7B3FA0'] },
  { id: 'p2', codigo: '10877', nombre: 'Jabón líquido Café y Vainilla', precio: 4500, pagina: 14, forma: 'frasco', colores: ['#8C5A3C', '#E9D8C4'] },
  { id: 'p3', codigo: '10650', nombre: 'Champú Manzanilla', precio: 5000, pagina: 16, forma: 'frasco', colores: ['#F2C94C', '#2E7D4F'] },
  { id: 'p4', codigo: '11020', nombre: 'Crema facial Día', precio: 9800, pagina: 18, forma: 'barra', colores: ['#F7E1D7', '#B5246B'] },
  { id: 'p5', codigo: '20518', nombre: 'Colonia Brisa 100 ml', precio: 12000, pagina: 23, forma: 'perfume', colores: ['#9FD3E6', '#2B6E8F'] },
  { id: 'p6', codigo: '20640', nombre: 'Perfume Noche de Guaria 50 ml', precio: 18900, pagina: 24, forma: 'perfume', colores: ['#4B2364', '#C9A227'] },
  { id: 'p7', codigo: '20901', nombre: 'Desodorante Volcán', precio: 3000, pagina: 27, forma: 'barra', colores: ['#D9DEE3', '#C0392B'] },
  { id: 'p8', codigo: '30127', nombre: 'Labial Orquídea', precio: 7000, pagina: 31, forma: 'labial', colores: ['#B5246B', '#3A2A40'] },
  { id: 'p9', codigo: '30455', nombre: 'Sombras Atardecer', precio: 10500, pagina: 33, forma: 'paleta', colores: ['#D9734E', '#3A2A40'] },
  { id: 'p10', codigo: '30780', nombre: 'Esmalte Guanacaste', precio: 2900, pagina: 38, forma: 'esmalte', colores: ['#C0392B', '#2C2C2C'] },
  { id: 'p11', codigo: '40311', nombre: 'Set de brochas Guaria', precio: 7200, pagina: 45, forma: 'brochas', colores: ['#E8C9A0', '#5E2A84'] },
  { id: 'p12', codigo: '50102', nombre: 'Set Orquídea de regalo', precio: 14500, pagina: 52, forma: 'caja', colores: ['#7B3FA0', '#F5C542'] },
];

export const producto = (id) => PRODUCTOS.find((p) => p.id === id);
export const productoPorCodigo = (codigo) => PRODUCTOS.find((p) => p.codigo === String(codigo).trim());

// Carritos de muestra para abrir una pantalla directamente (por ejemplo, desde un código QR).
export const CARRITOS_DE_MUESTRA = {
  P16: [{ id: 'p1', cant: 2 }, { id: 'p5', cant: 1 }, { id: 'p8', cant: 1 }], // ₡32.000
  P17: [{ id: 'p1', cant: 2 }, { id: 'p5', cant: 1 }, { id: 'p8', cant: 1 }, { id: 'p9', cant: 1 }], // ₡42.500
  minimo: [{ id: 'p12', cant: 1 }], // ₡14.500
};

// Pedidos anteriores de práctica que muestra P19 para una vendedora con historial.
export const HISTORIAL = [
  { campana: 6, fecha: 'Martes 18', estado: 'Entregado', lineas: [{ id: 'p5', cant: 2 }, { id: 'p1', cant: 2 }, { id: 'p2', cant: 1 }, { id: 'p3', cant: 1 }] }, // ₡46.500
  { campana: 5, fecha: 'Martes 28', estado: 'Entregado', lineas: [{ id: 'p1', cant: 2 }, { id: 'p3', cant: 1 }, { id: 'p8', cant: 1 }, { id: 'p7', cant: 1 }] }, // ₡28.000
];

export function totalLineas(lineas) {
  return lineas.reduce((suma, l) => suma + (l.precio ?? producto(l.id).precio) * l.cant, 0);
}

// Cierre de cada campaña de práctica (tres semanas entre una y otra).
export const CIERRES = { 7: 'martes 9', 8: 'martes 30', 9: 'martes 20', 10: 'martes 10', 11: 'martes 31', 12: 'martes 21' };
export const cierre = (campana) => CIERRES[campana] || 'martes';

// Padrón de práctica: 100 nombres inventados, uno por número de identificación de práctica (000000001 a 000000100).
const NOMBRES = ['Ana', 'María', 'Laura', 'Carmen', 'Rosa', 'Sofía', 'Daniela', 'Paola', 'Andrea', 'Lucía'];
const APELLIDOS = ['Rojas', 'Mora', 'Solano', 'Vargas', 'Jiménez', 'Quesada', 'Brenes', 'Chaves', 'Arias', 'Salas'];
export function nombreDelPadron(identificacion) {
  const n = Number(identificacion);
  if (!/^0\d{8}$/.test(identificacion) || n < 1 || n > 100) return '';
  return `${NOMBRES[(n - 1) % 10]} Práctica ${APELLIDOS[Math.floor((n - 1) / 10)]}`;
}

export const PROVINCIAS = {
  'San José': { 'Montes de Oca': ['San Pedro', 'Sabanilla'], 'Desamparados': ['San Rafael', 'Gravilias'] },
  'Alajuela': { 'Grecia': ['Tacares', 'San Isidro'], 'San Ramón': ['Santiago', 'Piedades Norte'] },
  'Cartago': { 'Paraíso': ['Orosi', 'Cachí'], 'Turrialba': ['La Suiza', 'Santa Rosa'] },
  'Heredia': { 'Barva': ['San Pablo', 'Santa Lucía'] },
  'Guanacaste': { 'Nicoya': ['Mansión', 'San Antonio'] },
  'Puntarenas': { 'Esparza': ['Macacona', 'San Rafael'] },
  'Limón': { 'Pococí': ['Guápiles', 'Jiménez'] },
};

// Correos de relleno del buzón simulado. Remitentes inventados.
export const BOLETINES = [
  { de: 'Pulpería Digital La Esquina', asunto: 'Ofertas de esta semana (práctica)', hora: '8:02' },
  { de: 'Club de Lectura Ejemplo', asunto: 'Su lista de lecturas de noviembre', hora: 'Ayer' },
  { de: 'Ferretería Ejemplo', asunto: 'Herramientas con descuento hasta el domingo', hora: 'Ayer' },
  { de: 'Escuela de Música Práctica', asunto: 'Horarios del próximo trimestre', hora: 'Lun.' },
  { de: 'Supermercado de Práctica', asunto: 'Cupones para su próxima compra', hora: 'Dom.' },
  { de: 'Boletín del Barrio', asunto: 'Feria del agricultor: nuevo horario', hora: 'Sáb.' },
];

// P08 B · «Abrir mi correo». Vacío: abre el buzón simulado con la búsqueda hecha. Con la cuenta de práctica de Gmail
// (sesión 2), FC Studio pone aquí https://mail.google.com/mail/u/0/#search/from%3A(%40<dominio de práctica>)+in%3Aanywhere
export const URL_BUZON_FILTRADO = '';
