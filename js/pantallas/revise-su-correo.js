// js/pantallas/revise-su-correo.js · P08, «Revise su correo» después de pedir los datos de nuevo.
import { encabezadoPublico, icono } from '../ui.js';
import { URL_BUZON_FILTRADO } from '../datos.js';

export default {
  id: 'P08', titulo: 'Revise su correo', direccion: 'mi.guaria/recuperar/enviado',
  dibujar(raiz, v, app) {
    if (v === 'A') {
      raiz.innerHTML = `<div class="p08a">${encabezadoPublico()}<div class="af-cuerpo"><h1 class="af-titulo">Revise su correo</h1><p>Le enviamos sus datos de nuevo.</p></div></div>`;
      return;
    }
    const dominio = app.estado.formulario?.dominioRecuperacion || app.estado.formulario?.dominioCorreo || 'gmail.com';
    raiz.innerHTML = `<div class="p08b">${encabezadoPublico()}
      <div class="af-cuerpo">
        <div class="icono-grande">${icono('correo', 44)}</div>
        <h1 class="af-titulo">Revise su correo</h1>
        <p>Le enviamos sus datos al correo que termina en @${dominio}.</p>
        <button class="btn-principal ancho" id="abrir-correo">${icono('correo', 18)} Abrir mi correo</button>
        <p class="campo-ayuda centrado">Abre su correo con la búsqueda del remitente de Mi Guaria ya hecha, en todas las carpetas.</p>
        <p class="dudas"><button class="btn-texto" id="por-whatsapp">¿No le llegó? Recíbalos por WhatsApp</button></p>
        <button class="btn-secundario ancho" id="volver-enviar" disabled>Volver a enviar en 60 s</button>
      </div></div>`;
    raiz.querySelector('#abrir-correo').onclick = () => {
      // Con la cuenta de práctica de Gmail, FC Studio pone en datos.js la dirección del buzón filtrado por el remitente.
      if (URL_BUZON_FILTRADO) window.open(URL_BUZON_FILTRADO, '_blank', 'noopener');
      else app.ir('/correo', { buscar: 'miguaria' });
    };
    raiz.querySelector('#por-whatsapp').onclick = () => { if (app.mandarBienvenida('whatsapp')) app.aviso('Le enviamos sus datos por WhatsApp (simulado).'); };
    const boton = raiz.querySelector('#volver-enviar');
    let quedan = 60;
    const reloj = app.cada(1000, () => {
      quedan -= 1;
      if (quedan > 0) { boton.textContent = `Volver a enviar en ${quedan} s`; return; }
      clearInterval(reloj); boton.disabled = false; boton.textContent = 'Volver a enviar';
    });
    boton.onclick = () => { if (app.mandarBienvenida('correo')) app.aviso('Le enviamos sus datos otra vez.'); };
  },
};
