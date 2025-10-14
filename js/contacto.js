function inicializarFormContacto() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const modal = document.getElementById("modal-msg");
  const modalText = document.getElementById("modal-text");
  const closeModal = document.getElementById("closeModal");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validadores
  const validators = {
    nombre: v => v.trim().length >= 2 || "Ingresa un nombre válido (mínimo 2 letras).",
    correo: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(v) || "Ingresa un correo válido.",
    telefono: v => v.trim() === "" || (/^[0-9]{7,15}$/).test(v) || "Ingresa un teléfono válido (7 a 15 números).",
    mensaje: v => v.trim().length >= 5 || "El mensaje debe tener al menos 5 caracteres."
  };

  // Helpers de UI (errores/éxito)
  function clearError(input) {
    if (!input) return;
    input.classList.remove("border-red-500", "ring-red-300", "error");
    input.classList.remove("border-green-500", "ring-green-300", "success");
    const parent = input.closest(".relative") || input.parentElement;
    const err = parent && parent.querySelector(".error-mesagge");
    if (err) err.remove();
  }

  function showError(input, message) {
    if (!input) return;
    input.classList.remove("success", "border-green-500", "ring-green-300");
    input.classList.add("error", "border-red-500", "ring-red-300");

    const parent = input.closest(".relative") || input.parentElement;
    let err = parent.querySelector(".error-mesagge");
    if (!err) {
      err = document.createElement("p");
      err.className = "error-mesagge mt-1 text-xs sm:text-sm text-red-500";
      parent.appendChild(err);
    }
    err.textContent = message;
  }

  function showSuccess(input) {
    if (!input) return;
    input.classList.remove("error", "border-red-500", "ring-red-300");
    input.classList.add("success", "border-green-500", "ring-green-300");
    const parent = input.closest(".relative") || input.parentElement;
    const err = parent.querySelector(".error-mesagge");
    if (err) err.remove();
  }

  // Focus visual wrapper class (para mantener tu CSS consistente)
  const inputs = form.querySelectorAll('.input-wrap input, .input-wrap textarea');
  inputs.forEach(el => {
    const wrap = el.closest('.input-wrap');
    el.addEventListener('focus', () => wrap?.classList.add('is-focused-wrap'));
    el.addEventListener('blur', () => wrap?.classList.remove('is-focused-wrap'));
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('blur', () => {
      const res = validators[el.name] ? validators[el.name](el.value) : true;
      if (res === true) showSuccess(el); else showError(el, res);
    });
  });

  // Extrae número WA desde el enlace tel: dentro de #contacto; si no existe, usa fallback
  function obtenerNumeroWhatsApp() {
    const telAnchor = document.querySelector('#contacto a[href^="tel:"]');
    if (telAnchor) {
      const raw = telAnchor.getAttribute('href') || telAnchor.textContent || '';
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 7) return digits;
    }
    // fallback (ajusta aquí si necesitas otro número)
    return '573209815556';
  }

  function abrirWhatsAppEnNuevaPestana(numeroSinSimbolo, mensajeTexto) {
    const safeNumber = (numeroSinSimbolo || '').replace(/\D/g, '');
    if (!safeNumber) {
      console.warn('No hay número WhatsApp válido.');
      return null;
    }
    const encoded = encodeURIComponent(mensajeTexto);
    const waUrl = `https://wa.me/${safeNumber}?text=${encoded}`;
    // Intentar abrir en nueva pestaña/ventana
    const win = window.open(waUrl, '_blank');
    return { win, waUrl };
  }

  // Función para asegurarnos de mostrar botón dentro del modal para abrir WA si el popup fue bloqueado
  function asegurarBotonAbrirWA(waUrl) {
    // Si ya existe botón lo actualizamos
    let openBtn = modal.querySelector('#modal-open-wa');
    if (!openBtn) {
      openBtn = document.createElement('button');
      openBtn.id = 'modal-open-wa';
      openBtn.type = 'button';
      // estilos tailwind-like (puedes ajustar)
      openBtn.className = 'mt-4 inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 focus:outline-none';
      openBtn.textContent = 'Abrir WhatsApp';
      // insertarlo antes del close button (si existe)
      const closeBtn = modal.querySelector('#closeModal');
      if (closeBtn) closeBtn.insertAdjacentElement('beforebegin', openBtn);
      else modal.appendChild(openBtn);
    }
    openBtn.onclick = () => {
      // abrir en la misma pestaña si bloqueo persistente
      window.location.href = waUrl;
    };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    const data = {};

    // validar campos
    for (const name of ["nombre", "correo", "telefono", "mensaje"]) {
      const el = form.elements[name];
      const value = el ? (el.value || '').trim() : "";
      data[name] = value;
      const res = validators[name] ? validators[name](value) : true;
      if (res !== true) {
        valid = false;
        showError(el, res);
      } else {
        showSuccess(el);
      }
    }

    if (!valid) {
      const firstErr = form.querySelector(".error-mesagge");
      if (firstErr) firstErr.previousElementSibling?.focus?.();
      return;
    }

    // bloquear botón y dar feedback
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Abriendo WhatsApp…';

    // construir mensaje multilinea
    const waMessage = [
      'Hola Audio Plus, me pongo en contacto con ustedes:',
      `Nombre: ${data.nombre || '-'}`,
      `Correo: ${data.correo || '-'}`,
      `Teléfono: ${data.telefono || '-'}`,
      `Mensaje: ${data.mensaje || '-'}`,
    ].join('\n');

    // obtener número y abrir WA
    const numero = obtenerNumeroWhatsApp();
    const result = abrirWhatsAppEnNuevaPestana(numero, waMessage);

    // Si window.open devolvió null (bloqueado), mostrar modal con botón para abrir WA manualmente
    if (!result || !result.win) {
      const waUrl = result ? result.waUrl : `https://wa.me/${numero.replace(/\D/g,'')}?text=${encodeURIComponent(waMessage)}`;
      modalText.textContent = "Se intentó abrir WhatsApp automáticamente. Si no se abrió, pulsa el botón para abrirlo manualmente.";
      asegurarBotonAbrirWA(waUrl);
      // mostrar modal
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      // restaurar estado del botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    // si se abrió correctamente, mostramos modal informativo opcional y reset
    modalText.textContent = "Se abrió WhatsApp con tu mensaje. Si no llegó la app, revisa tu navegador o pulsa 'Abrir WhatsApp' en el modal.";
    // aseguramos también el botón por si el usuario cerró la pestaña emergente antes
    asegurarBotonAbrirWA(result.waUrl);
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // restaurar UI y opcionalmente resetear formulario
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      // si quieres limpiar el form descomenta la siguiente línea:
      // form.reset();
    }, 800);
  });

  // cerrar modal
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  // cerrar modal con Escape o clic en overlay
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { modal.classList.add('hidden'); modal.classList.remove('flex'); }});
  modal.addEventListener('click', (ev) => { if (ev.target === modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }});
}

// inicializar al cargar la página
document.addEventListener('DOMContentLoaded', inicializarFormContacto);
