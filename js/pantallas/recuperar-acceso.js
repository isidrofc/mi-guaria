// js/pantallas/recuperar-acceso.js · P12, recuperar acceso («¿Primera vez o no tiene sus datos?»).
import { encabezadoPublico } from '../ui.js';

export default {
  id: 'P12', titulo: 'Recuperar acceso', direccion: 'mi.guaria/recuperar',
  dibujar(raiz, v, app) {
    if (v === 'A') {
      raiz.innerHTML = `<div class="p12a">${encabezadoPublico()}
        <div class="af-cuerpo"><h1 class="af-titulo">Recuperar cuenta</h1>
          <form class="af-form" novalidate>
            <div class="campo"><label for="correo-rec">Ingrese su correo electrónico registrado</label><input id="correo-rec" type="email" autocomplete="off"></div>
            <button class="btn-principal ancho" type="submit">Enviar</button>
          </form><p class="p12a-resultado" hidden>Si el correo existe, recibirá instrucciones.</p></div></div>`;
      raiz.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        const correo = raiz.querySelector('#correo-rec').value.trim();
        if (!correo) return;
        app.estado.formulario = { ...(app.estado.formulario || {}), dominioRecuperacion: correo.split('@')[1] || '' };
        app.guardar();
        // Sesión 1: la pantalla se queda sin salida. Sesiones 2 a 4: sigue a P08 A y el correo llega de nuevo.
        if (app.estado.escenario === '1') { raiz.querySelector('form').hidden = true; raiz.querySelector('.p12a-resultado').hidden = false; return; }
        setTimeout(() => app.mandarBienvenida('correo'), 2500);
        app.ir('/P08');
      };
      return;
    }
    raiz.innerHTML = `<div class="p12b">${encabezadoPublico()}
      <div class="af-cuerpo"><h1 class="af-titulo">¿No tiene su código de vendedora?</h1>
        <form class="af-form" novalidate>
          <fieldset class="campo opciones"><legend>¿Cómo quiere recibirlo?</legend>
            <label class="opcion"><input type="radio" name="canal" value="sms" checked><span>Mensaje de texto al celular con el que se afilió</span></label>
            <label class="opcion"><input type="radio" name="canal" value="correo"><span>Correo electrónico</span></label></fieldset>
          <button class="btn-principal ancho" type="submit">Enviar</button>
        </form>
        <div class="p12b-resultado" hidden><p class="aviso-ok">Le enviamos su código al celular terminado en 34. Llega en menos de un minuto.</p>
          <button class="btn-secundario ancho" data-ir="/P09">Volver a entrar</button></div>
        <p class="dudas">Si cambió de número, escríbale a su líder de zona.</p>
        </div></div>`;
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const canal = raiz.querySelector('[name="canal"]:checked').value;
      if (canal === 'correo') { setTimeout(() => app.mandarBienvenida('correo'), 2500); app.ir('/P08'); return; }
      raiz.querySelector('form').hidden = true;
      raiz.querySelector('.p12b-resultado').hidden = false;
      setTimeout(() => app.mandarBienvenida('sms'), 2500);
    };
  },
};
