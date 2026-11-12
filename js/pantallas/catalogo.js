// js/pantallas/catalogo.js · P15, catálogo por página y por código. Las dos vías llegan al mismo pedido.
import { esc, encabezadoSesion, imagenProducto, colones, icono } from '../ui.js';
import { track } from '../track.js';
import { PRODUCTOS, producto, productoPorCodigo } from '../datos.js';
import { agregarAlCarrito, totalCarrito, cantidadCarrito } from '../estado.js';

function filtrar(texto) {
  const t = texto.trim().toLowerCase();
  if (!t) return PRODUCTOS;
  const pagina = t.match(/^(?:p[aá]gina|p[aá]g\.?|p)\s*(\d+)$/);
  if (pagina) return PRODUCTOS.filter((p) => p.pagina === Number(pagina[1]));
  if (/^\d{5}$/.test(t)) return PRODUCTOS.filter((p) => p.codigo === t);
  const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return PRODUCTOS.filter((p) => sinTildes(p.nombre).includes(sinTildes(t)) || String(p.pagina) === t);
}

export default {
  id: 'P15', titulo: 'Catálogo', direccion: 'mi.guaria/catalogo',
  dibujar(raiz, v, app, params) {
    app.asegurarSesion();
    let via = params.via === 'codigo' ? 'codigo' : 'catalogo';
    let busqueda = params.buscar || '';

    const avisoAgregado = (p) => {
      app.aviso(`Se agregó ${p.nombre} (${colones(p.precio)}). Lleva ${colones(totalCarrito())}.`, { accion: { texto: 'Ver Mi pedido', fn: () => app.ir('/P16') } });
      const insignia = raiz.querySelector('.enc-sesion .insignia');
      if (insignia) insignia.textContent = cantidadCarrito();
      else raiz.querySelector('[data-ir="P16"]')?.insertAdjacentHTML('beforeend', `<span class="insignia">${cantidadCarrito()}</span>`);
    };

    const pintar = () => {
      const lista = filtrar(busqueda);
      const paginas = [...new Set(lista.map((p) => p.pagina))];
      raiz.innerHTML = `<div class="p15">${encabezadoSesion(cantidadCarrito())}
        <div class="cuerpo">
          <h1 class="titulo-seccion">Catálogo · Campaña ${app.estado.campana}</h1>
          <div class="pestanas" role="tablist">
            <button role="tab" aria-selected="${via === 'catalogo'}" data-via="catalogo">Por página</button>
            <button role="tab" aria-selected="${via === 'codigo'}" data-via="codigo">Por código</button>
          </div>
          ${via === 'catalogo' ? `
            <label class="buscador">${icono('buscar', 18)}<input id="buscar" type="search" placeholder="Busque por nombre o por página (ej.: página 45)" value="${esc(busqueda)}"></label>
            ${busqueda && /guardar/i.test(busqueda) ? '<p class="aviso-info">Su pedido se guarda solo cada vez que agrega un producto. Puede salir y volver cuando quiera.</p>' : ''}
            ${lista.length ? '' : `<p class="vacio">No encontramos «${esc(busqueda)}». Pruebe con el nombre, el código de 5 números o «página 45».</p>`}
            ${paginas.map((n) => `<section class="pagina"><h2>Página ${n}</h2>
              ${lista.filter((p) => p.pagina === n).map((p) => `<article class="producto">${imagenProducto(p)}
                <div class="producto-datos"><b>${esc(p.nombre)}</b><small>Código ${p.codigo}</small><span class="precio">${colones(p.precio)}</span></div>
                <button class="btn-agregar" data-agregar="${p.id}">Agregar</button></article>`).join('')}</section>`).join('')}`
          : `
            <form class="por-codigo" novalidate>
              <div class="campo"><label for="codigo">Código del producto (5 números, viene en el catálogo impreso)</label>
                <div class="fila-codigo"><input id="codigo" inputmode="numeric" maxlength="5" autocomplete="off" placeholder="10234">
                <input id="cantidad" type="number" min="1" max="20" value="1" aria-label="Cantidad"></div>
                <div id="vista-previa" class="vista-previa"></div><p class="campo-error" id="error"></p></div>
              <button class="btn-principal ancho" type="submit">Agregar a Mi pedido</button>
            </form>
            <p class="campo-ayuda">Quien prefiere buscar puede usar la pestaña «Por página». Todo llega al mismo pedido.</p>`}
        </div></div>`;
      raiz.querySelectorAll('[data-via]').forEach((b) => (b.onclick = () => { via = b.dataset.via; pintar(); }));
      if (via === 'catalogo') {
        const campo = raiz.querySelector('#buscar');
        campo.oninput = () => {
          busqueda = campo.value;
          const posicion = campo.selectionStart;
          pintar();
          const nuevo = raiz.querySelector('#buscar');
          nuevo.focus(); nuevo.setSelectionRange(posicion, posicion);
        };
        raiz.querySelectorAll('[data-agregar]').forEach((b) => (b.onclick = () => {
          const p = producto(b.dataset.agregar);
          agregarAlCarrito(p.id, 1);
          track('producto_agregado', { via: 'catalogo' });
          avisoAgregado(p);
        }));
        return;
      }
      const codigo = raiz.querySelector('#codigo');
      const vista = raiz.querySelector('#vista-previa');
      codigo.oninput = () => {
        const p = productoPorCodigo(codigo.value);
        vista.innerHTML = p ? `${imagenProducto(p, 48)}<span><b>${esc(p.nombre)}</b><br>${colones(p.precio)}</span>` : '';
      };
      raiz.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const caja = codigo.closest('.campo');
        caja.classList.remove('con-error');
        const p = productoPorCodigo(codigo.value);
        if (!p) {
          caja.classList.add('con-error');
          raiz.querySelector('#error').textContent = codigo.value.length !== 5
            ? `El código tiene 5 números y usted escribió ${codigo.value.length}.`
            : `No hay ningún producto con el código ${codigo.value} en la campaña ${app.estado.campana}. Revise el catálogo impreso.`;
          return;
        }
        const cantidad = Math.max(1, Math.min(20, Number(raiz.querySelector('#cantidad').value) || 1));
        agregarAlCarrito(p.id, cantidad);
        track('producto_agregado', { via: 'codigo' });
        avisoAgregado(p);
        codigo.value = ''; vista.innerHTML = ''; codigo.focus();
      };
    };
    pintar();
  },
};
