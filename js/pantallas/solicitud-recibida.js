// js/pantallas/solicitud-recibida.js · P06, solicitud recibida.
import { encabezadoPublico, icono } from '../ui.js';

export default {
  id: 'P06', titulo: 'Solicitud recibida', direccion: 'mi.guaria/afiliacion/recibida',
  dibujar(raiz, v, app) {
    if (v === 'A') {
      raiz.innerHTML = `<div class="p06a">${encabezadoPublico()}<div class="p06a-centro"><h1>¡Gracias!</h1></div></div>`;
      return;
    }
    raiz.innerHTML = `<div class="p06b">${encabezadoPublico()}
      <div class="af-cuerpo">
        <div class="icono-grande ok">${icono('visto', 44)}</div>
        <h1 class="af-titulo">Recibimos su solicitud</h1>
        <p>El equipo de aprobaciones la revisa en un plazo de un día hábil.</p>
        <p>Le avisamos por mensaje de texto al celular que nos dio.</p>
        <button class="btn-principal ancho" id="entendido">Entendido</button>
        <p class="dudas"><button class="btn-texto" id="whatsapp">¿Dudas? Escríbanos por WhatsApp</button></p>
      </div></div>`;
    raiz.querySelector('#entendido').onclick = () => { app.aviso('Puede cerrar Mi Guaria. El aviso le llega por mensaje de texto.'); app.ir('/telefono'); };
    raiz.querySelector('#whatsapp').onclick = () => app.aviso('En la práctica este enlace no abre WhatsApp ni muestra un número.');
  },
};
