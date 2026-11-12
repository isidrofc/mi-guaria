// js/pantallas/primer-ingreso.js · P13, primer ingreso de la vendedora nueva.
import { encabezadoSesion, icono, colones } from '../ui.js';
import { track } from '../track.js';
import { cantidadCarrito } from '../estado.js';
import { cierre, REGLAS } from '../datos.js';

const TUTORIAL = [
  ['Bienvenida a Mi Guaria', 'Aquí arma su pedido de cada campaña, ve su ganancia y revisa sus pedidos anteriores.'],
  ['Así funciona su campaña', 'Cada campaña dura tres semanas. Envíe su pedido antes del cierre para que se lo facturen a tiempo.'],
  ['Así ve su ganancia', 'Su ganancia sube por escalones: 25 %, 30 % y 35 % según el monto de su pedido.'],
];
const TARJETAS = [
  ['Pedido', 'bolsa', '/P14'], ['Catálogo', 'catalogo', '/P15'], ['Mi ganancia', 'ganancia', '/P16'], ['Mis pedidos', 'pedidos', '/P19'],
  ['Mi zona', 'zona', ''], ['Capacitación', 'capacitacion', ''], ['Promociones', 'promociones', ''], ['Perfil', 'persona', '/P20'],
];

export default {
  id: 'P13', titulo: 'Primer ingreso', direccion: 'mi.guaria/inicio',
  dibujar(raiz, v, app) {
    app.asegurarSesion();
    const ingreso = app.tomarIngresoPendiente();
    if (ingreso) track('sesion_iniciada', ingreso);
    if (v === 'A') return versionA(raiz, app);
    const e = app.estado;
    const pedido = e.pedidos.length > 0;
    const contrasena = !!e.contrasenaCreada;
    const listos = 1 + (pedido ? 1 : 0) + (contrasena ? 1 : 0);
    const paso = (hecho, texto, destino) => `<li class="${hecho ? 'hecho' : ''}">${hecho ? icono('visto', 20) : '<span class="circulo"></span>'}${destino && !hecho ? `<a data-ir="${destino}">${texto}</a>` : `<span>${texto}</span>`}</li>`;
    raiz.innerHTML = `<div class="p13b">${encabezadoSesion(cantidadCarrito())}
      <div class="cuerpo">
        <h1 class="saludo">Hola. Su campaña de práctica cierra el ${cierre(e.campana)} a mediodía.</h1>
        <div class="p13b-tareas">
          <button class="tarea" data-ir="/P15">${icono('bolsa', 30)}<span>Hacer mi pedido</span></button>
          <button class="tarea" data-ir="/P16">${icono('ganancia', 30)}<span>Ver mi ganancia</span></button>
        </div>
        <section class="primeros-pasos"><h2>Primeros pasos · ${listos} de 3 listo${listos > 1 ? 's' : ''}</h2>
          <div class="barra-avance"><span style="width:${(listos / 3) * 100}%"></span></div>
          <ul>${paso(true, 'Entró a Mi Guaria')}${paso(pedido, `Haga su primer pedido (mínimo ${colones(REGLAS.pedidoMinimo)})`, '/P15')}${paso(contrasena, 'Cree su contraseña (opcional)', '/P11')}</ul>
        </section>
      </div></div>`;
  },
};

function versionA(raiz, app) {
  const tarjetas = () => {
    raiz.innerHTML = `<div class="p13a">${encabezadoSesion(cantidadCarrito())}
      <div class="cuerpo"><h1 class="saludo-a">Bienvenida</h1>
      <div class="p13a-tarjetas">${TARJETAS.map(([t, i, d]) => `<button class="p13a-tarjeta" ${d ? `data-ir="${d}"` : 'data-accion="no-disponible"'}>${icono(i, 28)}<span>${t}</span></button>`).join('')}</div></div></div>`;
  };
  if (app.estado.tutorialVisto) return tarjetas();
  let indice = 0;
  const cerrar = () => {
    app.estado.tutorialVisto = true;
    app.guardar();
    tarjetas();
    app.despues(300, () => app.permiso({ texto: 'Mostrar notificaciones', iconoNombre: 'campana' }));
  };
  const pintar = () => {
    const [titulo, texto] = TUTORIAL[indice];
    raiz.innerHTML = `<div class="p13a-tutorial">
      <button class="btn-texto saltar" id="saltar">Saltar</button>
      <div class="tutorial-dibujo">${icono(['bolsa', 'reloj', 'ganancia'][indice], 90)}</div>
      <h1>${titulo}</h1><p>${texto}</p>
      <div class="puntos">${TUTORIAL.map((_, i) => `<span class="${i === indice ? 'activo' : ''}"></span>`).join('')}</div>
      <button class="btn-principal ancho" id="siguiente">${indice < 2 ? 'Siguiente' : 'Empezar'}</button></div>`;
    raiz.querySelector('#siguiente').onclick = () => { if (indice < 2) { indice += 1; pintar(); } else cerrar(); };
    raiz.querySelector('#saltar').onclick = cerrar;
    let x0 = null;
    const caja = raiz.firstElementChild;
    caja.onpointerdown = (e) => { x0 = e.clientX; };
    caja.onpointerup = (e) => { if (x0 !== null && x0 - e.clientX > 40 && indice < 2) { indice += 1; pintar(); } x0 = null; };
  };
  pintar();
}
