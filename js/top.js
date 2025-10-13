// top.js
document.addEventListener('DOMContentLoaded', () => {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  // Mostrar/ocultar botón con scroll
  const onScroll = () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Debounce simple para evitar múltiples activaciones
  let lastClick = 0;
  const CLICK_DEBOUNCE_MS = 300;

  // Función para cerrar menú móvil si está abierto (protección)
  function ensureMenuClosed() {
    const mobileNav = document.getElementById('mobile-menu');
    if (!mobileNav) return;
    // Si el overlay está visible (aria-hidden = "false" o no tiene la clase -translate-x-full)
    const isOpen = mobileNav.getAttribute('aria-hidden') === 'false' || !mobileNav.classList.contains('-translate-x-full');
    if (isOpen) {
      // Intentamos cerrarlo "suavemente"
      mobileNav.classList.add('-translate-x-full');
      mobileNav.setAttribute('aria-hidden', 'true');
      // bloquear pointer events si tienes esa lógica (ver nota abajo)
      mobileNav.classList.add('pointer-events-none');
      // también aseguramos que el body no tenga overflow-hidden
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Usar pointerdown para capturar antes que overlays problemáticos
  backToTop.addEventListener('pointerdown', (e) => {
    const now = Date.now();
    if (now - lastClick < CLICK_DEBOUNCE_MS) {
      e.preventDefault();
      return;
    }
    lastClick = now;

    // Si hay un overlay visible, lo cerramos antes de hacer scroll
    ensureMenuClosed();

    // Pequeña pausa (10-50ms) para que la UI actualice y no quede interceptado el evento
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 30);
  });

  // opcional: soporte para keyboard (Enter / Space)
  backToTop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      backToTop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    }
  });
});
