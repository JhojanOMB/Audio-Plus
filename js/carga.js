// carga.js
document.addEventListener("DOMContentLoaded", () => {
  // 1. Leer la última URL guardada (o usar la de inicio por defecto)
  const ultimaUrl = localStorage.getItem("ultimaPagina") || "paginas/inicio.html";
  cargarContenido(ultimaUrl).then(() => {
    // 2. Restaurar scroll si lo guardaste antes
    const y = parseInt(localStorage.getItem("ultimaPosY"), 10);
    if (!isNaN(y)) {
      window.scrollTo({ top: y, behavior: "auto" });
      localStorage.removeItem("ultimaPosY");
    }
  }).catch((e)=> {
    // silencioso; ya maneja errores la función cargarContenido
  });
});

// Carga dinámica de contenido y guardado de estado
function cargarContenido(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar la página");
      return response.text();
    })
    .then((html) => {
      // Inyecta el HTML en <main>
      const main = document.querySelector("main");
      if (!main) throw new Error("No se encontró el elemento <main>");
      main.innerHTML = html;

      // --- MITIGACIÓN: evitar que el HTML inyectado dispare aperturas accidentales ---
      try {
        // Si algún elemento recibió autofocus en el HTML inyectado, lo desenfocamos
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }

        // Forzar foco en main (evita que inputs con autofocus creen efectos secundarios)
        main.tabIndex = -1;
        main.focus();

        // Si usas AOS / WOW, refrescarlos tras inyectar
        if (window.AOS && typeof AOS.refresh === 'function') AOS.refresh();
        // reinit WOW (protegido con try)
        if (window.WOW) { try { new WOW().init(); } catch(e){} }
      } catch (e) {
        console.warn('Error mitigando foco tras carga dinámica:', e);
      }

      // Subir al inicio
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Guardar la URL actual
      localStorage.setItem("ultimaPagina", url);

      // --- REINICIALIZAR COMPONENTES DINÁMICOS ---
      if (typeof inicializarFormContacto === "function") {
        try { inicializarFormContacto(); } catch(e) { console.warn('inicializarFormContacto() falló', e); }
      }

      if (document.getElementById("contenedor-servicios")) {
        try { insertarTarjetasServicios(); } catch(e) { console.warn('insertarTarjetasServicios() falló', e); }
      }
      if (document.getElementById("proyectos-grid")) {
        try { insertarProyectosDestacados(); } catch(e) { console.warn('insertarProyectosDestacados() falló', e); }
      }
      if (document.getElementById("portafolio-grid")) {
        try { renderPortafolio(portafolioData); setupPortafolioControls(); } catch(e) { console.warn('Portafolio render fallo', e); }
      }
      if (document.getElementById("contenedor-faq")) {
        try { insertarPreguntasFrecuentes(); } catch(e) { console.warn('insertarPreguntasFrecuentes() falló', e); }
      }

      // Inicializar sección de descargas si está presente
      if (document.getElementById('descargas')) {
        try { initDescargas(); } catch(e) { console.warn('initDescargas fallo', e); }
      }

      // refrescar AOS de nuevo por si se añadieron elementos con data-aos
      if (window.AOS && typeof AOS.refresh === 'function') AOS.refresh();
    })
    .catch((error) => {
      document.querySelector("main").innerHTML =
        `<div class="alert alert-danger">Error: ${error.message}</div>`;
      console.error('cargarContenido error:', error);
      // Rechazamos para que quien llamó pueda saberlo opcionalmente
      return Promise.reject(error);
    });
}

// Antes de recargar o cerrar, guardo scroll
window.addEventListener("beforeunload", () => {
  try {
    localStorage.setItem("ultimaPosY", window.scrollY);
  } catch(e) { /* si storage falla, no hacemos nada */ }
});

// ------------------ Servicios ------------------
function insertarTarjetasServicios() {
  const servicios = [
    { 
      titulo: "Utilidad", 
      icono: "bi bi-mortarboard-fill", 
      resumen: "Herramientas prácticas para el aula.", 
      detalles: "Recursos personalizados, acompañamiento continuo y materiales digitales que facilitan la enseñanza." 
    },
    { 
      titulo: "Desempeño", 
      icono: "bi bi-bar-chart-line-fill", 
      resumen: "Mejora del rendimiento en clase.", 
      detalles: "Monitoreo del progreso, retroalimentación inmediata y estrategias que impulsan el aprendizaje." 
    },
    { 
      titulo: "Concentración", 
      icono: "bi bi-eye-fill",
      resumen: "Ambiente sin distracciones.", 
      detalles: "Métodos que ayudan a mantener la atención, reducir interrupciones y fomentar la disciplina en el aula."
    },
  ];

  const contenedor = document.getElementById("contenedor-servicios");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  contenedor.className = "grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center"; 

  servicios.forEach((s, i) => {
    const delay = (i + 1) * 100;
    contenedor.innerHTML += `
      <div class="relative w-[300px] h-[300px] rounded-xl shadow-lg overflow-hidden group 
                  border border-gray-700"
           data-aos="fade-up" data-aos-delay="${delay}">
        
        <div class="w-full h-full relative">
          
          <!-- Front (más clara) -->
          <div class="front-content w-full h-full flex flex-col items-center justify-center gap-3 
                      bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300
                      transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] 
                      group-hover:-translate-y-[30%]">
            
            <div class="mb-4 w-20 h-20 flex items-center justify-center rounded-full 
                        bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400 shadow-md">
              <i class="${s.icono} text-gray-900 text-3xl"></i>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 text-center">${s.titulo}</h3>
            <p class="text-sm text-gray-700 text-center">${s.resumen}</p>
          </div>

          <!-- Back (oscura) -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 
                      bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 text-gray-100 p-5 rounded-md 
                      translate-y-[96%] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] 
                      group-hover:translate-y-0 pointer-events-none">
            
            <h4 class="text-xl font-bold text-white">Detalles</h4>
            <p class="text-sm leading-relaxed text-gray-300">${s.detalles}</p>
          </div>
        </div>
      </div>
    `;
  });
}


// ------------------ Proyectos Destacados ------------------

const proyectosData = [
  { nombre: 'App de Ventas', descripcion: 'Dashboard comercial con filtros avanzados y gráficos, además de generación de facturas electrónicas DIAN, PDF y QR.' },
  { nombre: 'Tienda Online', descripcion: 'E-commerce con pasarela de pagos y carrito dinámico.' },
];

function insertarProyectosDestacados() {
  const grid = document.getElementById('proyectos-grid');
  if (!grid) return;
  grid.innerHTML = "";

  proyectosData.forEach((app, idx) => {
    const card = document.createElement('div');
    card.className = `
      relative rounded-2xl overflow-hidden p-8 neumorph
      hover:neumorph-inset transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]
    `;
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', 200 + idx * 100);

    card.innerHTML = `
      <div class="neumorph-bg absolute right-4 top-4 bg-indigo-600 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md">
        <i class="bi bi-star-fill text-xl"></i>
      </div>
      <h5 class="text-xl font-semibold text-gray-800 mb-4">${app.nombre}</h5>
      <p class="text-gray-700 text-sm mb-6">${app.descripcion}</p>
      <a href="#"
         class="btn-neumorph inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors px-5">
        Ver más
        <i class="bi bi-arrow-right-short text-2xl"></i>
      </a>
    `;
    grid.appendChild(card);
  });
}

// ------------------ Datos de Portafolio ------------------
const portafolioData = [
  {
    nombre: 'Tienda Online',
    descripcion: 'E-commerce con carrito dinámico y pasarela de pagos.',
    imagen: 'img/JOMB.webp',
    live: "http://217.196.48.97/",
    category: 'web',
    tech: ['Django', 'Bootstrap', 'Tailwind', 'Chart.js']
  },
  {
    nombre: 'Masivos OLÉ! Logistics',
    descripcion: 'Sistema de gestión logistico con gráficos para manejo de cotizaciones de transporte.',
    imagen: 'img/JOMB.webp',
    live: "https://masivosolelogistics.com/",
    category: 'web',
    tech: ['Django', 'Bootstrap', 'Chart.js']
  },
  {
    nombre: 'Finanworld',
    descripcion: 'Sistema de créditos de libranza pensados para pensionados.',
    imagen: 'img/JOMB.webp',
    live: "https://jhojanomb.github.io/Finanworld/",
    category: 'web',
    tech: ['Django', 'Tailwind']
  },
  {
    nombre: 'Youtube-JOMB',
    descripcion: 'Aplicativo para descargar videos y audios de YouTube en múltiples formatos, sirve para Windows y Linux.',
    imagen: 'img/JOMB.webp',
    download: "https://github.com/JhojanOMB/Youtube-JOMB/releases/latest",
    category: 'desktop',
    tech: ['Python', 'Tkinter', 'Pytube']
  }, 
];

// Función que renderiza el grid completo
function renderPortafolio(items) {
  const grid = document.getElementById('portafolio-grid');
  const tpl  = document.getElementById('portafolio-card-template');
  if (!grid || !tpl) return;
  grid.innerHTML = '';

  items.forEach((app, i) => {
    const clone = tpl.content.cloneNode(true);

    // Imagen y alt
    const img = clone.querySelector('img');
    if (img) { img.src = app.imagen; img.alt = app.nombre; }

    // Título / descripción
    const titleEl = clone.querySelector('[data-role="title"]');
    const descEl = clone.querySelector('[data-role="desc"]');
    if (titleEl) titleEl.textContent = app.nombre;
    if (descEl) descEl.textContent  = app.descripcion;

    // Tech tags
    const tags = clone.querySelector('[data-role="tags"]');
    if (tags && app.tech) {
      app.tech.forEach(t => {
        const span = document.createElement('span');
        span.className = 'text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full neumorph-bg';
        span.textContent = t;
        tags.appendChild(span);
      });
    }

    // Acción (Live, candado o descarga)
    const action = clone.querySelector('[data-role="action"]');
    if (action) {
      if (app.live) {
        const a = document.createElement('a');
        a.href = app.live;
        a.target = '_blank';
        a.className = 'w-10 h-10 flex items-center justify-center text-white text-lg bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all';
        a.innerHTML = '<i class="bi bi-box-arrow-up-right"></i>';
        action.appendChild(a);
      } else if (app.download) {
        const a = document.createElement('a');
        a.href = app.download;
        a.download = '';
        a.className = 'w-10 h-10 flex items-center justify-center text-white text-lg bg-green-600 hover:bg-green-700 rounded-full transition-all';
        a.innerHTML = '<i class="bi bi-download"></i>';
        action.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.className = 'w-10 h-10 flex items-center justify-center text-white text-lg bg-gray-500 rounded-full';
        span.innerHTML = '<i class="bi bi-lock-fill"></i>';
        action.appendChild(span);
      }
    }

    // Delay AOS
    const card = clone.querySelector('.group') || clone.firstElementChild;
    if (card) card.setAttribute('data-aos-delay', 100 + i * 100);

    grid.appendChild(clone);
  });
}

// ------------------ Búsqueda y Filtros ------------------
function setupPortafolioControls() {
  const input   = document.getElementById('portafolio-search');
  const buttons = document.querySelectorAll('.btn-neumorph');
  let cat   = 'all';
  let query = '';

  function apply() {
    const filtered = portafolioData
      .filter(p => cat === 'all' || p.category === cat)
      .filter(p => p.nombre.toLowerCase().includes(query));
    renderPortafolio(filtered);
  }

  if (input) {
    input.addEventListener('input', e => {
      query = e.target.value.trim().toLowerCase();
      apply();
    });
  }

  buttons.forEach(btn =>
    btn.addEventListener('click', () => {
      // Actualiza clases en botones
      buttons.forEach(b => {
        b.classList.replace('bg-indigo-100','bg-transparent');
        b.classList.replace('text-indigo-700','text-gray-600');
      });
      btn.classList.replace('bg-transparent','bg-indigo-100');
      btn.classList.replace('text-gray-600','text-indigo-700');

      cat = btn.dataset.cat;
      apply();
    })
  );

  // Render inicial
  apply();
}

// ------------------ Preguntas Frecuentes ------------------
function insertarPreguntasFrecuentes() {
  const faqs = [
    { pregunta: "¿Cómo puedo solicitar un servicio?", respuesta: "Puedes usar el formulario de contacto o escribirnos directamente a WhatsApp." },
    { pregunta: "¿Trabajan de forma remota?", respuesta: "Sí, ofrecemos soporte remoto y presencial según el caso." },
    { pregunta: "¿Aceptan pagos en línea?", respuesta: "Sí, aceptamos transferencias, tarjetas y plataformas digitales." },
    { pregunta: "¿Qué tiempo tardan en responder?", respuesta: "Generalmente respondemos en menos de 24 horas." }
  ];

  const contenedor = document.getElementById("contenedor-faq");
  if (!contenedor) return;
  contenedor.innerHTML = ""; // limpiar

  faqs.forEach((f, i) => {
    const delay = (i + 1) * 100;
    contenedor.innerHTML += `
      <div class="border border-gray-200 rounded-lg overflow-hidden neumorph" data-aos="fade-up" data-aos-delay="${delay}">
        <button type="button" class="faq-toggle w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition focus:outline-none">
          <div class="flex items-center space-x-2">
            <i class="fa-solid fa-question-circle text-indigo-600"></i>
            <span class="font-medium text-gray-800">${f.pregunta}</span>
          </div>
          <i class="fa-solid fa-chevron-down text-gray-600"></i>
        </button>
        <div class="faq-answer max-h-0 overflow-hidden px-4 bg-white text-gray-700 border-t border-gray-200 transition-all duration-300">
          <p class="py-3">${f.respuesta}</p>
        </div>
      </div>
    `;
  });

  // Añadir listeners
  contenedor.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const icon = btn.querySelector('i.fa-chevron-down, i.fa-chevron-up');

      // Si ya está abierto, cerrarlo
      if (answer.style.maxHeight && answer.style.maxHeight !== '0px') {
        answer.style.maxHeight = '0px';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      } else {
        // cerrar otros (comportamiento accordion)
        contenedor.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = '0px');
        contenedor.querySelectorAll('.faq-toggle i.fa-chevron-up').forEach(ic => { ic.classList.remove('fa-chevron-up'); ic.classList.add('fa-chevron-down'); });

        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      }
    });
  });

  if (window.AOS && typeof AOS.refresh === 'function') AOS.refresh();
}

// --------- Inicializador de la sección "Descargas" ---------
function initDescargas() {
  // --- QR ---
  try {
    const defaultApkPath = './media/Audio_Plus.apk';
    const apkBtn = document.getElementById('apkBtn');
    const apkPath = apkBtn?.getAttribute('data-apk') || defaultApkPath;
    const apkUrl = new URL(apkPath, window.location.href).href;

    const qrImg = document.getElementById('apkQr');
    const qrLink = document.getElementById('apkQrLink');
    const confirmLink = document.getElementById('confirmApkLink');

    // Dos proveedores: Google Charts primero (muy usado), fallback a qrserver si falla
    const googleQR = 'https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=' + encodeURIComponent(apkUrl);
    const qrServer = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(apkUrl);

    if (qrImg) {
      qrImg.src = googleQR;
      // fallback si la API de Google está bloqueada
      qrImg.onerror = () => { qrImg.onerror = null; qrImg.src = qrServer; };
    }
    if (qrLink) qrLink.href = apkUrl;
    if (confirmLink) confirmLink.setAttribute('href', apkUrl);
  } catch (e) {
    console.warn('initDescargas: error preparando QR', e);
  }

  // --- Previsualización de archivos (botones .preview-btn) ---
  try {
    const previewBtns = Array.from(document.querySelectorAll('.preview-btn'));
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    const closePreview = document.getElementById('closePreview');

    previewBtns.forEach(b => {
      // evitar re-binding
      if (b.dataset.__boundPreview) return;
      b.dataset.__boundPreview = '1';

      b.addEventListener('click', (ev) => {
        ev.preventDefault();
        const file = b.getAttribute('data-file');
        if (!previewModal || !previewContent) return;
        previewContent.innerHTML = '';

        if (!file) {
          previewContent.innerHTML = '<p class="text-sm text-gray-600">Archivo no encontrado.</p>';
        } else if (file.match(/\.(png|jpg|jpeg|gif)$/i)) {
          const img = document.createElement('img');
          img.src = file;
          img.alt = 'Previsualización';
          img.className = 'w-full h-[60vh] object-contain';
          previewContent.appendChild(img);
        } else if (file.endsWith('.pdf')) {
          const iframe = document.createElement('iframe');
          iframe.src = file;
          iframe.className = 'w-full h-[70vh]';
          previewContent.appendChild(iframe);
        } else {
          previewContent.innerHTML = '<p class="text-sm text-gray-600">Previsualización no disponible para este tipo de archivo.</p>';
        }

        previewModal.classList.remove('hidden');
        previewModal.classList.add('flex');
      });
    });

    // cerrar preview
    closePreview?.addEventListener('click', () => {
      previewModal.classList.add('hidden'); previewModal.classList.remove('flex'); previewContent.innerHTML = '';
    });

    // cerrar con ESC y clic fuera (solo una vez)
    if (!document.body.dataset.__previewGlobalHandlers) {
      document.body.dataset.__previewGlobalHandlers = '1';

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (previewModal) { previewModal.classList.add('hidden'); previewModal.classList.remove('flex'); }
          const apkConfirm = document.getElementById('apkConfirm');
          if (apkConfirm) { apkConfirm.classList.add('hidden'); apkConfirm.classList.remove('flex'); }
        }
      });

      document.addEventListener('click', (e) => {
        const previewModal = document.getElementById('previewModal');
        const apkConfirm = document.getElementById('apkConfirm');
        if (e.target === previewModal) { previewModal.classList.add('hidden'); previewModal.classList.remove('flex'); }
        if (e.target === apkConfirm) { apkConfirm.classList.add('hidden'); apkConfirm.classList.remove('flex'); }
      });
    }
  } catch (e) {
    console.warn('initDescargas: error initializing preview handlers', e);
  }

  // --- Lógica del modal de confirmación APK ---
  try {
    const apkBtnEl = document.getElementById('apkBtn');
    const apkConfirm = document.getElementById('apkConfirm');
    const cancelApk = document.getElementById('cancelApk');

    if (apkBtnEl && !apkBtnEl.dataset.__boundApk) {
      apkBtnEl.dataset.__boundApk = '1';
      apkBtnEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (!apkConfirm) return;
        apkConfirm.classList.remove('hidden'); apkConfirm.classList.add('flex');
      });
    }

    if (cancelApk && !cancelApk.dataset.__boundApkCancel) {
      cancelApk.dataset.__boundApkCancel = '1';
      cancelApk.addEventListener('click', (e) => {
        e.preventDefault();
        if (!apkConfirm) return;
        apkConfirm.classList.add('hidden'); apkConfirm.classList.remove('flex');
      });
    }
  } catch (e) {
    console.warn('initDescargas: error initializing APK modal handlers', e);
  }
}
