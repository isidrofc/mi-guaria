// js/ui.js · Piezas de interfaz que comparten las pantallas de Mi Guaria (datos de práctica).

export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function colones(monto) {
  return '₡' + Math.round(monto).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Logotipo propio de Cosméticos Guaria: una guaria (orquídea) dibujada con cinco figuras.
export function logo(tamano = 32, conNombre = true, claro = false) {
  const color = claro ? '#FFFFFF' : '#5E2A84';
  return `<span class="logo" role="button" tabindex="0" aria-label="Mi Guaria">
    <svg width="${tamano}" height="${tamano}" viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="11" rx="5.5" ry="9" fill="${claro ? '#F3E6FA' : '#7B3FA0'}"/>
      <ellipse cx="10.5" cy="19" rx="9" ry="5" transform="rotate(-22 10.5 19)" fill="${claro ? '#E9D3F5' : '#8E4DB5'}"/>
      <ellipse cx="29.5" cy="19" rx="9" ry="5" transform="rotate(22 29.5 19)" fill="${claro ? '#E9D3F5' : '#8E4DB5'}"/>
      <path d="M13 24 Q20 38 27 24 Q20 28 13 24Z" fill="${claro ? '#FFD1E6' : '#B5246B'}"/>
      <circle cx="20" cy="22" r="2.6" fill="#F5C542"/>
    </svg>${conNombre ? `<span class="logo-nombre" style="color:${color}">Mi Guaria</span>` : ''}</span>`;
}

const ICONOS = {
  bolsa: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  casa: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
  catalogo: '<path d="M5 4h10l4 4v12H5z"/><path d="M8 11h8M8 15h8"/>',
  ganancia: '<path d="M4 18 10 12l4 4 6-8"/><path d="M15 8h5v5"/>',
  pedidos: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  zona: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  capacitacion: '<path d="M3 9 12 5l9 4-9 4z"/><path d="M7 11v5c3 2 7 2 10 0v-5"/>',
  promociones: '<path d="M4 12 12 4h8v8l-8 8z"/><circle cx="16" cy="8" r="1.5"/>',
  ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><circle cx="12" cy="17" r=".6"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  visto: '<circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  ubicacion: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  mensajes: '<path d="M4 5h16v11H9l-5 4z"/>',
  navegador: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  buscar: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  basura: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  telefono: '<path d="M6 3h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
  flecha: '<path d="M15 5 8 12l7 7"/>',
};

export function icono(nombre, tamano = 22) {
  return `<svg class="icono" width="${tamano}" height="${tamano}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre] || ''}</svg>`;
}

// Imágenes de productos inventados, dibujadas en SVG.
export function imagenProducto(p, tamano = 64) {
  const [c1, c2] = p.colores;
  const formas = {
    tubo: `<rect x="28" y="10" width="24" height="44" rx="6" fill="${c1}"/><rect x="31" y="54" width="18" height="12" rx="2" fill="${c2}"/><rect x="32" y="22" width="16" height="16" rx="3" fill="#FFFFFF" opacity=".55"/>`,
    frasco: `<rect x="22" y="22" width="36" height="44" rx="8" fill="${c1}"/><rect x="33" y="10" width="14" height="12" rx="2" fill="${c2}"/><rect x="28" y="34" width="24" height="14" rx="3" fill="#FFFFFF" opacity=".55"/>`,
    perfume: `<rect x="22" y="28" width="36" height="38" rx="10" fill="${c1}"/><rect x="34" y="18" width="12" height="10" fill="${c2}"/><rect x="30" y="8" width="20" height="10" rx="3" fill="${c2}"/><circle cx="40" cy="47" r="7" fill="#FFFFFF" opacity=".5"/>`,
    labial: `<rect x="30" y="38" width="20" height="28" rx="3" fill="${c2}"/><rect x="32" y="26" width="16" height="12" fill="#D9C6A5"/><path d="M33 26 L33 12 Q40 6 47 14 L47 26Z" fill="${c1}"/>`,
    paleta: `<rect x="12" y="20" width="56" height="40" rx="6" fill="${c2}"/><circle cx="27" cy="34" r="7" fill="${c1}"/><circle cx="41" cy="34" r="7" fill="#E7A86B"/><circle cx="55" cy="34" r="7" fill="#7A4B8C"/><rect x="20" y="46" width="40" height="7" rx="3" fill="#FFFFFF" opacity=".5"/>`,
    brochas: `<rect x="18" y="34" width="8" height="32" rx="3" fill="${c2}"/><ellipse cx="22" cy="24" rx="7" ry="12" fill="${c1}"/><rect x="36" y="38" width="8" height="28" rx="3" fill="${c2}"/><ellipse cx="40" cy="30" rx="6" ry="10" fill="${c1}"/><rect x="54" y="40" width="7" height="26" rx="3" fill="${c2}"/><ellipse cx="57.5" cy="33" rx="5" ry="8" fill="${c1}"/>`,
    caja: `<rect x="14" y="26" width="52" height="38" rx="4" fill="${c1}"/><rect x="36" y="26" width="8" height="38" fill="${c2}"/><path d="M40 26 C30 10 22 20 40 26 C58 20 50 10 40 26Z" fill="${c2}"/>`,
    esmalte: `<rect x="26" y="34" width="28" height="30" rx="7" fill="${c1}"/><rect x="34" y="12" width="12" height="22" rx="2" fill="${c2}"/><rect x="30" y="42" width="8" height="14" rx="3" fill="#FFFFFF" opacity=".45"/>`,
    barra: `<rect x="26" y="18" width="28" height="48" rx="8" fill="${c1}"/><rect x="26" y="10" width="28" height="12" rx="5" fill="${c2}"/><rect x="31" y="34" width="18" height="18" rx="3" fill="#FFFFFF" opacity=".5"/>`,
  };
  return `<svg class="img-producto" width="${tamano}" height="${tamano}" viewBox="0 0 80 80" role="img" aria-label="${esc(p.nombre)}"><rect width="80" height="80" rx="12" fill="${p.fondo || '#F5EFF8'}"/>${formas[p.forma] || formas.frasco}</svg>`;
}

// Encabezado de las pantallas públicas (sin sesión).
export function encabezadoPublico(titulo = '') {
  return `<header class="enc-publico">${logo(28)}${titulo ? `<span class="enc-titulo">${esc(titulo)}</span>` : ''}</header>`;
}

// Encabezado de las pantallas con sesión iniciada. El pedido se llama «Mi pedido» en toda la aplicación.
export function encabezadoSesion(cantidad) {
  return `<header class="enc-sesion">
    ${logo(28)}
    <span class="enc-espacio"></span>
    <button class="btn-icono" data-ir="P16" aria-label="Mi pedido">${icono('bolsa')}${cantidad ? `<span class="insignia">${cantidad}</span>` : ''}</button>
    <button class="btn-icono" data-accion="menu" aria-label="Menú">${icono('menu')}</button>
  </header>`;
}

export function enlaceDudas() {
  return `<p class="dudas"><button class="btn-texto" data-accion="dudas">¿Tiene dudas? Escríbale a su líder de zona</button></p>`;
}
