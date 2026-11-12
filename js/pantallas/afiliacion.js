// js/pantallas/afiliacion.js · P02 a P05, afiliación en cuatro pasos (la versión A dice que son tres).
import { esc, encabezadoPublico, enlaceDudas, icono } from '../ui.js';
import { nombreDelPadron, PROVINCIAS } from '../datos.js';

// La versión A tiene el contador equivocado: P02 a P04 dicen «de 3» y P05 repite «Paso 3 de 3».
function titulo(paso, v) {
  if (v === 'A') return `<h1 class="af-titulo">Afiliación · Paso ${Math.min(paso, 3)} de 3</h1>`;
  return `<h1 class="af-titulo">Afiliación · Paso ${paso} de 4</h1>
    <div class="barra-avance" role="progressbar" aria-valuenow="${paso * 25}" aria-valuemin="0" aria-valuemax="100"><span style="width:${paso * 25}%"></span></div>
    ${paso === 1 ? '<p class="af-tiempo">Le toma unos 4 minutos</p>' : ''}`;
}

function formulario(app) { return (app.estado.formulario ||= {}); }

function marco(v, paso, contenido, boton = 'Siguiente') {
  return `<div class="afiliacion">${encabezadoPublico()}
    <div class="af-cuerpo">${titulo(paso, v)}<form class="af-form" novalidate>${contenido}
    <button class="btn-principal ancho" type="submit">${boton}</button></form>${enlaceDudas()}</div></div>`;
}

function errorJunto(campo, texto) {
  const caja = campo.closest('.campo');
  caja.classList.add('con-error');
  caja.querySelector('.campo-error').textContent = texto;
}
function limpiarErrores(raiz) {
  raiz.querySelectorAll('.con-error').forEach((c) => { c.classList.remove('con-error'); c.querySelector('.campo-error').textContent = ''; });
}

export const p02 = {
  id: 'P02', titulo: 'Afiliación, paso 1', direccion: 'mi.guaria/afiliacion',
  dibujar(raiz, v, app) {
    const f = formulario(app);
    const opciones = [
      ['contado', 'Contado', 'paga su pedido al recibirlo'],
      ['credito', 'Crédito', 'paga después, si se lo aprueban'],
      ['contado_con_opcion', 'Contado con opción de crédito', 'empieza de contado y puede pedir crédito después'],
    ];
    const condicion = v === 'A'
      ? `<div class="campo"><label for="condicion">Condición de venta</label>
          <select id="condicion" name="condicion"><option value="">Seleccione</option>${opciones.map(([val, txt]) => `<option value="${val}" ${f.condicion_venta === val ? 'selected' : ''}>${txt}</option>`).join('')}</select>
          <p class="campo-error"></p></div>`
      : `<fieldset class="campo opciones"><legend>Condición de venta</legend>
          ${opciones.map(([val, txt, linea]) => `<label class="opcion"><input type="radio" name="condicion" value="${val}" ${f.condicion_venta === val ? 'checked' : ''}><span><b>${txt}:</b> ${linea}</span></label>`).join('')}
          <p class="campo-error"></p></fieldset>`;
    raiz.innerHTML = marco(v, 1, `
      <div class="campo"><label for="identificacion">Número de identificación</label>
        <input id="identificacion" name="identificacion" inputmode="numeric" autocomplete="off" maxlength="12" value="${esc(f.identificacion || '')}">
        <p class="campo-ayuda">Use un número de práctica que empiece con 0</p><p class="campo-error"></p></div>
      ${condicion}`);
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      limpiarErrores(raiz);
      const campo = raiz.querySelector('#identificacion');
      const numero = campo.value.replace(/\D/g, '');
      const elegida = v === 'A' ? raiz.querySelector('#condicion').value : raiz.querySelector('[name="condicion"]:checked')?.value;
      let bien = true;
      if (numero.length !== 9) { errorJunto(campo, `El número de identificación tiene 9 dígitos y usted escribió ${numero.length}.`); bien = false; }
      else if (!numero.startsWith('0')) { errorJunto(campo, 'Para la práctica, use un número que empiece con 0, por ejemplo 000000042.'); bien = false; }
      if (!elegida) { errorJunto(raiz.querySelector(v === 'A' ? '#condicion' : '[name="condicion"]'), 'Elija una condición de venta.'); bien = false; }
      if (!bien) return;
      Object.assign(f, { identificacion: numero, condicion_venta: elegida });
      app.guardar();
      app.ir('/P03');
    };
  },
};

export const p03 = {
  id: 'P03', titulo: 'Afiliación, paso 2', direccion: 'mi.guaria/afiliacion',
  dibujar(raiz, v, app) {
    const f = formulario(app);
    const delPadron = nombreDelPadron(f.identificacion || '000000001');
    const nombre = f.nombre ?? delPadron;
    raiz.innerHTML = marco(v, 2, `
      ${v === 'B' && delPadron ? `<div class="aviso-ok">${icono('visto', 18)}<span><b>Datos cargados:</b> encontramos su nombre con su número de identificación. ¿Es usted? Si no, corríjalo.</span></div>` : ''}
      <div class="campo"><label for="nombre">Nombre completo</label><input id="nombre" autocomplete="off" value="${esc(nombre)}"><p class="campo-error"></p></div>
      <div class="campo"><label for="celular">Celular</label><input id="celular" inputmode="numeric" autocomplete="off" maxlength="9" placeholder="0000-0034" value="${esc(f.celular || '')}">
        <p class="campo-ayuda">No escriba su número real. Para la práctica use 0000-0034.</p><p class="campo-error"></p></div>
      <div class="campo"><label for="correo">${v === 'A' ? 'Correo electrónico' : 'Correo electrónico (opcional)'}</label><input id="correo" type="email" autocomplete="off" placeholder="nombre@ejemplo.test" value="${esc(f.correo || '')}">
        <p class="campo-ayuda">Use un correo de práctica, no el suyo.</p><p class="campo-error"></p></div>`);
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      limpiarErrores(raiz);
      const nombreCampo = raiz.querySelector('#nombre');
      const celular = raiz.querySelector('#celular');
      const correo = raiz.querySelector('#correo');
      let bien = true;
      if (nombreCampo.value.trim().length < 3) { errorJunto(nombreCampo, 'Escriba su nombre completo.'); bien = false; }
      if (celular.value.replace(/\D/g, '').length !== 8) { errorJunto(celular, `El celular tiene 8 números y usted escribió ${celular.value.replace(/\D/g, '').length}.`); bien = false; }
      if (v === 'A' && !correo.value.trim()) { errorJunto(correo, 'Campo obligatorio.'); bien = false; }
      if (correo.value.trim() && !/^\S+@\S+\.\S+$/.test(correo.value.trim())) { errorJunto(correo, 'Revise el correo: falta la arroba o el dominio, como en nombre@ejemplo.test.'); bien = false; }
      if (!bien) return;
      Object.assign(f, { nombre: nombreCampo.value.trim(), celular: celular.value, correo: correo.value.trim() });
      app.guardar();
      app.ir('/P04');
    };
  },
};

export const p04 = {
  id: 'P04', titulo: 'Afiliación, paso 3', direccion: 'mi.guaria/afiliacion',
  dibujar(raiz, v, app) {
    const f = formulario(app);
    const provincias = Object.keys(PROVINCIAS);
    raiz.innerHTML = marco(v, 3, `
      ${v === 'B' ? `<div class="ubicacion-caja"><button type="button" class="btn-secundario" id="usar-ubicacion">${icono('ubicacion', 18)} Usar mi ubicación</button>
        <p class="campo-ayuda">La usamos solo para asignarle su líder de zona. También puede escribir su dirección.</p></div>` : ''}
      <div class="campo"><label for="provincia">Provincia</label><select id="provincia"><option value="">Seleccione</option>${provincias.map((p) => `<option ${f.provincia === p ? 'selected' : ''}>${p}</option>`).join('')}</select><p class="campo-error"></p></div>
      <div class="campo"><label for="canton">Cantón</label><select id="canton"><option value="">Seleccione</option></select><p class="campo-error"></p></div>
      <div class="campo"><label for="distrito">Distrito</label><select id="distrito"><option value="">Seleccione</option></select><p class="campo-error"></p></div>
      <div class="campo"><label for="direccion">Dirección</label><textarea id="direccion" rows="2" placeholder="Escriba una dirección inventada">${esc(f.direccion || '')}</textarea><p class="campo-error"></p></div>`);
    const [prov, can, dis] = ['#provincia', '#canton', '#distrito'].map((s) => raiz.querySelector(s));
    const llenarCantones = () => { can.innerHTML = '<option value="">Seleccione</option>' + Object.keys(PROVINCIAS[prov.value] || {}).map((c) => `<option ${f.canton === c ? 'selected' : ''}>${c}</option>`).join(''); llenarDistritos(); };
    const llenarDistritos = () => { dis.innerHTML = '<option value="">Seleccione</option>' + ((PROVINCIAS[prov.value] || {})[can.value] || []).map((d) => `<option ${f.distrito === d ? 'selected' : ''}>${d}</option>`).join(''); };
    prov.onchange = llenarCantones; can.onchange = llenarDistritos;
    llenarCantones();
    const ponerUbicacion = (permitio) => {
      if (!permitio) return;
      prov.value = 'San José'; llenarCantones(); can.value = 'Montes de Oca'; llenarDistritos(); dis.value = 'San Pedro';
      app.aviso('Ubicación de práctica cargada: San José, Montes de Oca, San Pedro.');
    };
    if (v === 'A') app.despues(400, () => app.permiso({ texto: 'Saber tu ubicación', alResponder: ponerUbicacion }));
    else raiz.querySelector('#usar-ubicacion').onclick = () => app.permiso({ texto: 'Saber tu ubicación', alResponder: ponerUbicacion });
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      limpiarErrores(raiz);
      let bien = true;
      for (const [campo, texto] of [[prov, 'Elija la provincia.'], [can, 'Elija el cantón.'], [dis, 'Elija el distrito.']]) if (!campo.value) { errorJunto(campo, texto); bien = false; }
      const direccion = raiz.querySelector('#direccion');
      if (direccion.value.trim().length < 5) { errorJunto(direccion, 'Escriba una dirección de práctica con algún punto de referencia.'); bien = false; }
      if (!bien) return;
      Object.assign(f, { provincia: prov.value, canton: can.value, distrito: dis.value, direccion: direccion.value });
      app.guardar();
      app.ir('/P05');
    };
  },
};

export const p05 = {
  id: 'P05', titulo: 'Afiliación, paso 4', direccion: 'mi.guaria/afiliacion',
  dibujar(raiz, v, app) {
    const f = formulario(app);
    raiz.innerHTML = marco(v, 4, `
      <div class="campo"><p class="campo-etiqueta">${v === 'A' ? 'Firme aquí para autorizar la consulta de crédito' : 'Autorice la consulta de crédito: firme aquí o suba una foto de una carta firmada.'}</p>
        <canvas class="firma" width="300" height="130" aria-label="Recuadro de firma"></canvas>
        <div class="firma-acciones"><button type="button" class="btn-texto" id="borrar-firma">Borrar firma</button>
        ${v === 'B' ? '<label class="btn-texto subir-foto">Subir una foto de la carta<input type="file" accept="image/*" id="foto-carta" hidden></label>' : ''}</div>
        <p class="campo-ayuda" id="foto-nombre"></p><p class="campo-error"></p></div>
      <fieldset class="campo opciones"><legend>¿Quiere el catálogo impreso?</legend>
        <label class="opcion"><input type="radio" name="impreso" value="si" ${v === 'A' ? 'checked' : ''}><span>Sí</span></label>
        <label class="opcion"><input type="radio" name="impreso" value="no"><span>No</span></label><p class="campo-error"></p></fieldset>`, 'Enviar solicitud');
    const lienzo = raiz.querySelector('.firma');
    const ctx = lienzo.getContext('2d');
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#2B1D36';
    let dibujando = false, trazos = 0, foto = false;
    const punto = (e) => { const r = lienzo.getBoundingClientRect(); return [(e.clientX - r.left) * (lienzo.width / r.width), (e.clientY - r.top) * (lienzo.height / r.height)]; };
    lienzo.onpointerdown = (e) => { dibujando = true; lienzo.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.moveTo(...punto(e)); };
    lienzo.onpointermove = (e) => {
      if (!dibujando) return;
      const [x, y] = punto(e);
      if (v === 'B' && (x < 2 || y < 2 || x > lienzo.width - 2 || y > lienzo.height - 2)) {
        dibujando = false; ctx.clearRect(0, 0, lienzo.width, lienzo.height); trazos = 0;
        errorJunto(lienzo, 'Su firma se salió del recuadro, inténtelo otra vez.');
        return;
      }
      ctx.lineTo(x, y); ctx.stroke(); trazos += 1;
    };
    lienzo.onpointerup = () => { dibujando = false; };
    raiz.querySelector('#borrar-firma').onclick = () => { ctx.clearRect(0, 0, lienzo.width, lienzo.height); trazos = 0; };
    const archivo = raiz.querySelector('#foto-carta');
    if (archivo) archivo.onchange = () => { foto = archivo.files.length > 0; raiz.querySelector('#foto-nombre').textContent = foto ? 'Foto lista. En la práctica no se guarda ni se envía.' : ''; };
    raiz.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      limpiarErrores(raiz);
      let bien = true;
      if (trazos < 5 && !foto) { errorJunto(lienzo, v === 'A' ? 'Firma requerida.' : 'Firme en el recuadro o suba la foto de la carta firmada.'); bien = false; }
      const impreso = raiz.querySelector('[name="impreso"]:checked');
      if (!impreso) { errorJunto(raiz.querySelector('[name="impreso"]'), 'Elija sí o no.'); bien = false; }
      if (!bien) return;
      app.servidor.recibirSolicitud({ condicion_venta: f.condicion_venta, tieneCorreo: !!f.correo });
      // Los datos personales del formulario no se guardan: solo queda lo que necesita el resto del recorrido.
      app.estado.formulario = { tieneCorreo: !!f.correo, dominioCorreo: (f.correo || '').split('@')[1] || '' };
      app.estado.solicitud = { estado: 'pendiente' };
      app.guardar();
      app.ir('/P06');
    };
  },
};
