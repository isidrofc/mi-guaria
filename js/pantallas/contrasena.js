// js/pantallas/contrasena.js · P11, crear contraseña. A: requisitos ocultos. B: requisitos a la vista. C: se ofrece después del primer pedido.
import { encabezadoPublico, encabezadoSesion, icono } from '../ui.js';
import { cantidadCarrito } from '../estado.js';

function quien(app) {
  return app.estado.sesion?.codigo || app.estado.ingresoEnCurso?.codigo || app.estado.vendedoraPractica || 'V-00042';
}

// Formulario de la versión B, que también usa la C al tocar «Crear ahora».
export function formularioB(raiz, app, alGuardar) {
  raiz.innerHTML = `<div class="p11b">${app.estado.sesion ? encabezadoSesion(cantidadCarrito()) : encabezadoPublico()}
    <div class="af-cuerpo"><h1 class="af-titulo">Cree su contraseña</h1>
      <p>Use al menos 15 caracteres, puede ser una frase.</p>
      <form class="af-form" novalidate>
        <div class="campo"><label for="nueva">Contraseña nueva</label>
          <div class="con-boton"><input id="nueva" type="password" autocomplete="new-password"><button type="button" class="btn-ver" id="ver">${icono('ojo', 18)} Ver</button></div>
          <p class="campo-ayuda" id="cuenta">Lleva 0 de 15 caracteres. Ejemplo: «mi gata duerme en la hamaca»</p><p class="campo-error" id="error"></p></div>
        <button class="btn-principal ancho" type="submit">Guardar</button>
      </form></div></div>`;
  const campo = raiz.querySelector('#nueva');
  raiz.querySelector('#ver').onclick = () => {
    const ver = campo.type === 'password';
    campo.type = ver ? 'text' : 'password';
    raiz.querySelector('#ver').innerHTML = `${icono('ojo', 18)} ${ver ? 'Ocultar' : 'Ver'}`;
  };
  campo.oninput = () => { raiz.querySelector('#cuenta').textContent = `Lleva ${campo.value.length} de 15 caracteres.`; };
  raiz.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const caja = campo.closest('.campo');
    caja.classList.remove('con-error');
    if (!app.servidor.crearContrasena(quien(app), campo.value, 'B')) {
      caja.classList.add('con-error');
      raiz.querySelector('#error').textContent = `Le faltan ${15 - campo.value.length} caracteres. Puede escribir una frase con espacios.`;
      return;
    }
    alGuardar();
  };
}

function despuesDeGuardar(app) {
  app.estado.contrasenaCreada = true;
  app.guardar();
  if (!app.estado.sesion && app.estado.ingresoEnCurso) return app.completarIngreso(app.estado.ingresoEnCurso.codigo, 'contrasena');
  app.aviso('Listo. Su contraseña quedó guardada.');
  app.ir(app.estado.sesion ? '/P20' : '/P09');
}

export default {
  id: 'P11', titulo: 'Crear contraseña', direccion: 'mi.guaria/contrasena',
  dibujar(raiz, v, app) {
    if (v === 'B') return formularioB(raiz, app, () => despuesDeGuardar(app));
    if (v === 'C') {
      raiz.innerHTML = `<div class="p11c">${app.estado.sesion ? encabezadoSesion(cantidadCarrito()) : encabezadoPublico()}
        <div class="af-cuerpo"><div class="icono-grande">${icono('candado', 40)}</div>
          <h1 class="af-titulo">¿Quiere crear una contraseña para entrar más rápido la próxima vez?</h1>
          <button class="btn-principal ancho" id="crear">Crear ahora</button>
          <button class="btn-secundario ancho" id="despues">Después</button></div></div>`;
      raiz.querySelector('#crear').onclick = () => formularioB(raiz, app, () => despuesDeGuardar(app));
      raiz.querySelector('#despues').onclick = () => app.ir(app.estado.sesion ? '/P14' : '/P09');
      return;
    }
    raiz.innerHTML = `<div class="p11a">${encabezadoPublico()}
      <div class="af-cuerpo"><h1 class="af-titulo">Cree su contraseña</h1>
        <form class="af-form" novalidate>
          <div class="campo"><label for="nueva">Contraseña nueva</label><input id="nueva" type="password" autocomplete="new-password"></div>
          <div class="campo"><label for="repetir">Repita la contraseña</label><input id="repetir" type="password" autocomplete="new-password"></div>
          <p class="banda-error en-linea" id="error" hidden>Contraseña inválida</p>
          <button class="btn-principal ancho" type="submit">Guardar</button>
        </form></div></div>`;
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const nueva = raiz.querySelector('#nueva').value;
      const iguales = nueva === raiz.querySelector('#repetir').value;
      if (!iguales || !app.servidor.crearContrasena(quien(app), nueva, 'A')) { raiz.querySelector('#error').hidden = false; return; }
      despuesDeGuardar(app);
    };
  },
};
