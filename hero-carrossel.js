/* ============================================================
   HERO CARROSSEL — script separado.
   Inclua com <script src="hero-carrossel.js"></script> depois
   do seu script.js no index.html.

   Quando a campanha da Copa acabar: basta remover a tag <script>
   e o slide 1 do HTML — o restante do site não depende disso.
   ============================================================ */

(function () {
  'use strict';

  const chuvaFundo = document.getElementById('copa-chuva-fundo');

  /* ---------- SVG reutilizável da bolinha de nhoque ---------- */
  function gnocchiSvgInner(id) {
    return '<defs><radialGradient id="' + id + '" cx="35%" cy="33%" r="65%">' +
      '<stop offset="0%" stop-color="#FFF59D"/><stop offset="45%" stop-color="#FDD835"/>' +
      '<stop offset="85%" stop-color="#F57F17"/><stop offset="100%" stop-color="#E65100"/>' +
      '</radialGradient></defs>' +
      '<path d="M 60,15 C 88,17 106,35 104,60 C 102,84 84,103 58,105 C 32,107 14,88 16,62 C 18,34 32,13 60,15 Z" fill="url(#' + id + ')"/>' +
      '<path d="M 38,32 C 40,30 45,31 43,35 C 41,39 36,37 38,32 Z" fill="#1B5E20" opacity="0.85"/>' +
      '<path d="M 72,38 C 75,36 78,40 76,43 C 73,45 70,41 72,38 Z" fill="#2E7D32" opacity="0.9"/>' +
      '<path d="M 48,55 C 52,53 54,58 50,60 C 46,61 45,57 48,55 Z" fill="#388E3C" opacity="0.8"/>' +
      '<path d="M 36,30 A 24,24 0 0,1 54,20" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.45"/>';
  }

  /* ---------- Chuva de bolinhas decorativa no fundo do slide ---------- */
  if (chuvaFundo && chuvaFundo.childElementCount === 0) {
    const config = [
      { left: '3%', size: 40, dur: 8, delay: 0, opacity: 0.85 },
      { left: '13%', size: 26, dur: 10, delay: -3, opacity: 0.7 },
      { left: '24%', size: 34, dur: 9, delay: -6, opacity: 0.8 },
      { left: '37%', size: 22, dur: 11, delay: -1, opacity: 0.65 },
      { left: '47%', size: 30, dur: 8.5, delay: -4, opacity: 0.75 },
      { left: '58%', size: 21, dur: 12, delay: -7, opacity: 0.62 },
      { left: '68%', size: 32, dur: 9.5, delay: -2, opacity: 0.78 },
      { left: '78%', size: 24, dur: 10.5, delay: -5, opacity: 0.68 },
      { left: '88%', size: 36, dur: 8.8, delay: -8, opacity: 0.82 },
      { left: '95%', size: 20, dur: 11.5, delay: -1.5, opacity: 0.6 }
    ];
    config.forEach(function (cfg, i) {
      const wrap = document.createElement('div');
      wrap.className = 'copa-bolinha-chuva';
      wrap.style.left = cfg.left;
      wrap.style.width = cfg.size + 'px';
      wrap.style.height = cfg.size + 'px';
      wrap.style.opacity = cfg.opacity;
      wrap.style.animation = 'copaChuvaFall ' + cfg.dur + 's linear infinite';
      wrap.style.animationDelay = cfg.delay + 's';
      const id = 'copaChuvaBall' + i;
      wrap.innerHTML = '<svg viewBox="0 0 120 120" width="100%" height="100%">' + gnocchiSvgInner(id) + '</svg>';
      chuvaFundo.appendChild(wrap);
    });
  }

  /* ---------- Carrossel de slides ---------- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let autoplayTimer = null;

  function goToSlide(index) {
    if (index === currentSlide) return;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    currentSlide = index;
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(idx);
      resetAutoplay();
    });
  });

  function startAutoplay() {
    autoplayTimer = setInterval(function () {
      goToSlide((currentSlide + 1) % slides.length);
    }, 12000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }
  if (slides.length > 1) startAutoplay();

})();