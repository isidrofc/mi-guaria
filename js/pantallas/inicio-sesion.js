// js/pantallas/inicio-sesion.js · P09, inicio de sesión.
import { esc, logo, icono } from '../ui.js';
import { track } from '../track.js';

function promo() {
  return `<svg class="p09a-foto" viewBox="0 0 360 170" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="g09" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#F4C9DD"/><stop offset=".5" stop-color="#E9E4F2"/><stop offset="1" stop-color="#F7E7C6"/></linearGradient></defs>
    <rect width="360" height="170" fill="url(#g09)"/>
    <circle cx="300" cy="40" r="60" fill="#FFFFFF" opacity=".55"/><circle cx="40" cy="150" r="50" fill="#FFFFFF" opacity=".5"/>
    <rect x="210" y="60" width="38" height="70" rx="10" fill="#E8A3C0"/><rect x="220" y="46" width="18" height="14" fill="#7B3FA0"/>
    <rect x="262" y="78" width="30" height="52" rx="8" fill="#9FD3E6"/><rect x="270" y="66" width="14" height="12" fill="#2B6E8F"/>
    <rect x="300" y="92" width="18" height="38" rx="3" fill="#3A2A40"/><path d="M302 92 L302 74 Q309 68 316 76 L316 92Z" fill="#B5246B"/>
    <text x="18" y="132" font-size="15" fill="#FFFFFF" font-family="Georgia, serif" font-style="italic">Nueva campaña 7</text>
  </svg>`;
}

export default {
  id: 'P09', titulo: 'Inicio de sesión', direccion: 'mi.guaria/entrar',
  dibujar(raiz, v, app, params) {
    // P09 se abrió desde el enlace del mensaje de bienvenida.
    let enlaceVencido = false;
    if (params.utm_campaign === 'bienvenida') {
      enlaceVencido = !app.servidor.abrirEnlace(params.t, app.estado.enlaceVencido);
      track('enlace_abierto', { canal: params.utm_source, intento: Number(params.intento) || 1 });
      app.limpiarParametros();
    }
    const vencido = enlaceVencido ? `<div class="banda-error">El enlace de su mensaje de bienvenida venció. Pida uno nuevo abajo, en ${v === 'A' ? '«' + esc(textoAyudaA(app)) + '»' : '«No tengo mi código de vendedora»'}.</div>` : '';
    if (v === 'A') {
      raiz.innerHTML = `<div class="p09a">
        <div class="p09a-portada">${promo()}<div class="p09a-marca">${logo(30, false, true)}<span>Mi Guaria</span></div></div>
        <div class="banda-error" id="error" hidden>Error de verificación</div>${vencido}
        <form class="af-form p09a-form" novalidate>
          <div class="campo"><label for="usuario">Usuario</label><input id="usuario" autocomplete="username" autocapitalize="off"></div>
          <div class="campo"><label for="contrasena">Contraseña</label><input id="contrasena" type="password" autocomplete="current-password"><p class="p09a-reglas" hidden>La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo</p></div>
          <button class="btn-principal ancho" type="submit">Ingresar</button>
          <a class="p09a-ayuda" data-ir="/P12">${esc(textoAyudaA(app))}</a>
        </form></div>`;
    } else {
      raiz.innerHTML = `<div class="p09b">
        <header class="enc-publico">${logo(28)}</header>${vencido}
        <div class="af-cuerpo"><h1 class="af-titulo">Entrar a Mi Guaria</h1>
        <form class="af-form" novalidate>
          <div class="campo"><label for="codigo">Código de vendedora</label>
            <input id="codigo" autocomplete="username" autocapitalize="characters" placeholder="V-00042">
            <p class="campo-ayuda">Viene en su mensaje de bienvenida. Ejemplo: V-00042</p><p class="campo-error" id="error-codigo"></p></div>
          <button class="btn-principal ancho p09b-boton" type="submit">${icono('mensajes', 18)} Enviarme un código por mensaje de texto</button>
        </form>
        <button class="btn-texto-alto ancho" data-ir="/P12">No tengo mi código de vendedora</button></div></div>`;
    }
    raiz.querySelector('form').onsubmit = (e) => { e.preventDefault(); alEntrar(raiz, v, app); };
  },
};

function textoAyudaA(app) {
  return app.estado.escenario === '1' ? '¿Problemas para ingresar?' : '¿Primera vez o no tiene sus datos?';
}

// Maneja el botón «Entrar» de las dos versiones («Ingresar» en A y «Enviarme un código por mensaje de texto» en B).
function alEntrar(raiz, v, app) {
  const codigo = v === 'A' ? revisarUsuarioYContrasena(raiz, app) : revisarCodigoDeVendedora(raiz, app);
  if (!codigo) return;
  app.estado.ingresoEnCurso = { codigo, metodo: v === 'A' ? 'contrasena' : 'codigo_sms' };
  app.guardar();
  app.ir('/P10');
}

// A: el usuario son solo los cinco números del código. Si algo falla, el mensaje no dice qué.
function revisarUsuarioYContrasena(raiz, app) {
  const usuario = raiz.querySelector('#usuario').value.trim();
  const contrasena = raiz.querySelector('#contrasena').value;
  const codigo = app.servidor.iniciarSesion(usuario, contrasena);
  if (!codigo) {
    raiz.querySelector('#error').hidden = false;
    raiz.querySelector('.p09a-reglas').hidden = false;
  }
  return codigo;
}

// B: acepta V-00042, v00042, 00042 y con espacios.
function revisarCodigoDeVendedora(raiz, app) {
  const codigo = app.servidor.normalizarCodigo(raiz.querySelector('#codigo').value);
  const error = raiz.querySelector('#error-codigo');
  error.closest('.campo').classList.remove('con-error');
  if (codigo && app.servidor.vendedora(codigo)) return codigo;
  error.closest('.campo').classList.add('con-error');
  error.textContent = codigo
    ? `No encontramos el código ${codigo}. Revise los números del mensaje de bienvenida o toque «No tengo mi código de vendedora».`
    : 'Escriba su código de vendedora. Viene en su mensaje de bienvenida, por ejemplo V-00042.';
  return null;
}
