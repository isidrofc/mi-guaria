// js/pantallas/codigo.js · P10, código de verificación por mensaje de texto.
import { esc, encabezadoPublico, enlaceDudas, icono } from '../ui.js';

function ingresoEnCurso(app) {
  if (!app.estado.ingresoEnCurso) {
    const codigo = app.estado.vendedoraPractica || 'V-00042';
    app.estado.ingresoEnCurso = { codigo, metodo: app.version('P10') === 'A' ? 'contrasena' : 'codigo_sms' };
    app.guardar();
  }
  return app.estado.ingresoEnCurso;
}

// Después del código: en A con sesión 2 o 4 falta crear la contraseña (P11 A), salvo que P11 esté en la versión C.
function seguir(app, ingreso, v) {
  const faltaContrasena = v === 'A' && app.estado.escenario !== '1' && app.version('P11') !== 'C';
  if (faltaContrasena) return app.ir('/P11');
  app.completarIngreso(ingreso.codigo, ingreso.metodo);
}

export default {
  id: 'P10', titulo: 'Código de verificación', direccion: 'mi.guaria/entrar/codigo',
  dibujar(raiz, v, app) {
    const ingreso = ingresoEnCurso(app);
    const creaAcceso = !(v === 'A' && app.estado.escenario !== '1' && app.version('P11') !== 'C');
    if (v === 'A') return versionA(raiz, app, ingreso, creaAcceso);
    return versionB(raiz, app, ingreso, creaAcceso);
  },
};

function versionA(raiz, app, ingreso, creaAcceso) {
  const codigoSms = app.servidor.enviarCodigo(ingreso.codigo, 60);
  raiz.innerHTML = `<div class="p10a">${encabezadoPublico()}
    <div class="af-cuerpo"><h1 class="af-titulo">Verificación</h1>
      <p>Ingrese el código enviado</p>
      <form class="af-form" novalidate>
        <div class="casillas">${Array.from({ length: 6 }, (_, i) => `<input class="casilla" maxlength="1" inputmode="text" autocomplete="off" aria-label="Dígito ${i + 1}">`).join('')}</div>
        <p class="banda-error en-linea" id="error" hidden>Error de verificación</p>
        <p class="p10a-vence">El código vence en 60 segundos</p>
        <button class="btn-principal ancho" type="submit">Verificar</button>
      </form>
      <div class="p10a-vencido" hidden><p class="banda-error en-linea">Código vencido</p><button class="btn-principal ancho" id="volver">Volver al inicio</button></div>
    </div></div>`;
  // El aviso del mensaje de texto dura cinco segundos y no queda guardado en el teléfono.
  app.despues(700, () => app.notificar({ app: 'Mensajes', de: 'Mi Guaria', texto: `Mi Guaria: su código es ${codigoSms}`, ms: 5000 }));
  const casillas = [...raiz.querySelectorAll('.casilla')];
  casillas.forEach((c, i) => {
    c.addEventListener('paste', (e) => e.preventDefault());
    c.addEventListener('input', () => { c.value = c.value.slice(-1); if (c.value && casillas[i + 1]) casillas[i + 1].focus(); });
    c.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !c.value && casillas[i - 1]) casillas[i - 1].focus(); });
  });
  const vencer = () => {
    app.servidor.marcarCodigoVencido();
    raiz.querySelector('form').hidden = true;
    raiz.querySelector('.p10a-vencido').hidden = false;
  };
  app.despues(60000, vencer);
  raiz.querySelector('#volver').onclick = () => { app.estado.ingresoEnCurso = null; app.guardar(); app.ir('/P09'); };
  raiz.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const resultado = app.servidor.validarCodigo(casillas.map((c) => c.value).join(''), creaAcceso);
    if (resultado === 'ok') return seguir(app, ingreso, 'A');
    if (resultado === 'vencido') return vencer();
    raiz.querySelector('#error').hidden = false;
  };
  raiz.vencerCodigo = vencer; // para las capturas de la presentación
}

function versionB(raiz, app, ingreso, creaAcceso) {
  const mandar = () => {
    const codigoSms = app.servidor.enviarCodigo(ingreso.codigo, 600);
    app.despues(800, () => app.agregarMensaje({ app: 'sms', hilo: 'miguaria', de: 'Mi Guaria', clase: 'codigo', cuerpo: `Mi Guaria: su código es ${codigoSms}. Sirve por 10 minutos.\n\n@mi.guaria #${codigoSms}` }));
    return codigoSms;
  };
  const codigoSms = mandar();
  raiz.innerHTML = `<div class="p10b">${encabezadoPublico()}
    <div class="af-cuerpo"><h1 class="af-titulo">Escriba el código</h1>
      <p>Escriba el código que le enviamos al celular terminado en 34. <button class="btn-texto" id="cambiar">Cambiar número</button></p>
      <form class="af-form" novalidate>
        <div class="campo"><label for="otp">Código de 6 números</label>
          <input id="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" class="otp">
          <button type="button" class="sugerencia" id="sugerencia" hidden>${icono('mensajes', 16)} De Mensajes: <b>${esc(codigoSms)}</b></button>
          <p class="campo-ayuda">El código sirve por 10 minutos.</p><p class="campo-error" id="error"></p></div>
        <button class="btn-principal ancho" type="submit">Entrar</button>
      </form>
      <p class="p10b-reenvio" id="reenvio">Puede pedir otro en 0:45</p>
      ${enlaceDudas().replace('¿Tiene dudas? Escríbale a su líder de zona', '¿No le llegó? Escríbale a su líder de zona')}
    </div></div>`;
  const campo = raiz.querySelector('#otp');
  const sugerencia = raiz.querySelector('#sugerencia');
  app.despues(900, () => { sugerencia.hidden = false; });
  sugerencia.onclick = () => { campo.value = codigoSms; campo.focus(); };
  raiz.querySelector('#cambiar').onclick = () => app.aviso('En la práctica el número no se puede cambiar. Su líder de zona lo cambia en la vida real.');
  const reenvio = raiz.querySelector('#reenvio');
  const contar = () => {
    let quedan = 45;
    reenvio.textContent = 'Puede pedir otro en 0:45';
    const reloj = app.cada(1000, () => {
      quedan -= 1;
      if (quedan > 0) { reenvio.textContent = `Puede pedir otro en 0:${String(quedan).padStart(2, '0')}`; return; }
      clearInterval(reloj);
      reenvio.innerHTML = '<button class="btn-secundario" id="otro">Enviar otro código</button>';
      reenvio.querySelector('#otro').onclick = () => { mandar(); app.aviso('Le enviamos otro código.'); contar(); };
    });
  };
  contar();
  raiz.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const error = raiz.querySelector('#error');
    const caja = error.closest('.campo');
    caja.classList.remove('con-error');
    const numeros = campo.value.replace(/\D/g, '');
    if (numeros.length !== 6) { caja.classList.add('con-error'); error.textContent = `El código tiene 6 números y usted escribió ${numeros.length}.`; return; }
    const resultado = app.servidor.validarCodigo(numeros, creaAcceso);
    if (resultado === 'ok') return seguir(app, ingreso, 'B');
    caja.classList.add('con-error');
    error.textContent = resultado === 'vencido'
      ? 'Ese código ya venció. Toque «Enviar otro código» cuando aparezca.'
      : 'Ese código no coincide con el último que le enviamos. Revise el mensaje o pida otro.';
  };
}
