// js/pantallas/pagina-publica.js · P01, página pública «Venda con Guaria».
import { logo, icono, imagenProducto } from '../ui.js';
import { PRODUCTOS } from '../datos.js';

const vitrina = () => [PRODUCTOS[5], PRODUCTOS[7], PRODUCTOS[0]].map((p) => imagenProducto(p, 72)).join('');

export default {
  id: 'P01', titulo: 'Venda con Guaria', direccion: 'mi.guaria',
  dibujar(raiz, v, app) {
    if (v === 'A') {
      raiz.innerHTML = `<div class="p01a">
        <div class="p01a-barra"><span>¡Campaña 7! Hable con una líder de zona hoy</span><button data-accion="llamar">${icono('telefono', 14)} Llamar ahora</button></div>
        <header class="p01a-cabeza">${logo(26)}<nav class="p01a-menu"><a data-accion="no-disponible">Inicio</a><a data-accion="no-disponible">Productos</a><a data-accion="no-disponible">Catálogo</a><a data-accion="no-disponible">Líderes</a><a data-ir="/P09">Ingresar</a></nav></header>
        <section class="p01a-portada">
          <h1 class="p01a-titulo">Venda con Guaria</h1>
          <p class="p01a-sub">GANE HASTA 35 % EN CADA PEDIDO</p>
          <div class="p01a-vitrina">${vitrina()}</div>
          <div class="p01a-acciones">
            <button data-ir="/P02">Afíliese</button>
            <button data-accion="no-disponible">Descargue el catálogo</button>
            <button data-accion="no-disponible">Hable con una líder de zona</button>
            <button data-ir="/P09">Ingrese a Mi Guaria</button>
            <button data-accion="no-disponible">Suscríbase al boletín</button>
          </div>
        </section>
        <section class="p01a-texto"><h2>Belleza que se vende sola</h2><p>Más de 5.500 vendedoras en todo el país ya trabajan con Cosméticos Guaria. Cada campaña trae productos nuevos, promociones y premios para las que más venden.</p></section>
        <footer class="p01a-pie"><button data-ir="/P02">Afíliese</button><p class="p01a-requisitos">Pedido mínimo ₡20.000. Sin costo de inscripción.</p><p class="p01a-requisitos">Cosméticos Guaria es una empresa inventada para un curso. Datos de práctica.</p></footer>
        <div class="p01a-chat" hidden><button class="p01a-chat-cerrar" aria-label="Cerrar">×</button>${icono('chat', 18)} ¿Tiene dudas? Chatee con nosotros</div>
      </div>`;
      raiz.querySelector('[data-accion="llamar"]').onclick = () => app.aviso('En la práctica no se hacen llamadas.');
      const chat = raiz.querySelector('.p01a-chat');
      app.despues(3000, () => { chat.hidden = false; });
      chat.querySelector('button').onclick = (e) => { e.stopPropagation(); chat.hidden = true; };
      return;
    }
    raiz.innerHTML = `<div class="p01b">
      <header class="enc-publico">${logo(28)}</header>
      <section class="p01b-portada">
        <h1>Venda con Guaria y gane entre 25 % y 35 % de cada pedido</h1>
        <p class="p01b-sub">Sin costo de inscripción. Pedido mínimo de ₡20.000 por campaña.</p>
        <div class="p01b-vitrina">${vitrina()}</div>
      </section>
      <section class="p01b-caja">
        <p class="p01b-pregunta">Afíliese en cuatro pasos. Primero: ¿ya vende por catálogo?</p>
        <div class="p01b-botones"><button class="btn-principal" data-respuesta="si">Sí</button><button class="btn-principal" data-respuesta="no">No</button></div>
      </section>
      <p class="p01b-ingresar"><button class="btn-texto" data-ir="/P09">¿Ya es vendedora? Ingrese aquí</button></p>
      <p class="p01b-pie">Cosméticos Guaria es una empresa inventada para un curso. Datos de práctica.</p>
    </div>`;
    raiz.querySelectorAll('[data-respuesta]').forEach((b) => (b.onclick = () => {
      app.estado.formulario = { yaVende: b.dataset.respuesta === 'si' };
      app.guardar();
      app.ir('/P02');
    }));
  },
};
