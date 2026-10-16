// Placeholder para imagens que ainda não foram adicionadas
document.querySelectorAll('img[data-placeholder]').forEach((img) => {
  const markMissing = () => {
    img.parentElement.classList.add('img-missing');
    img.parentElement.dataset.label = img.dataset.placeholder;
  };
  if (img.complete && img.naturalWidth === 0) markMissing();
  img.addEventListener('error', markMissing);
});

// Animação ao rolar + contador dos números
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    const counter = entry.target.querySelector('[data-count]');
    if (counter) animateCount(counter);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Carrossel de recados: bolinhas indicadoras
const notes = document.querySelector('.notes');
const dots = document.querySelector('.notes__dots');
if (notes && dots) {
  const items = [...notes.children];
  items.forEach(() => dots.appendChild(document.createElement('i')));
  const update = () => {
    const center = notes.scrollLeft + notes.clientWidth / 2;
    let active = 0;
    items.forEach((item, i) => {
      if (Math.abs(item.offsetLeft + item.offsetWidth / 2 - center) <
          Math.abs(items[active].offsetLeft + items[active].offsetWidth / 2 - center)) active = i;
    });
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === active));
  };
  notes.addEventListener('scroll', update, { passive: true });
  update();
}

// Lightbox da galeria (fotos e vídeos)
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxVideo = lightbox.querySelector('video');
document.querySelectorAll('.gallery__item').forEach((item) => {
  item.addEventListener('click', () => {
    if (item.classList.contains('img-missing')) return;
    const video = item.querySelector('video');
    lightboxImg.hidden = !!video;
    lightboxVideo.hidden = !video;
    if (video) {
      lightboxVideo.src = video.currentSrc || video.src;
      lightboxVideo.play();
    } else {
      lightboxImg.src = item.querySelector('img').src;
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});
const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxVideo.pause();
  document.body.style.overflow = '';
};
lightbox.addEventListener('click', closeLightbox);
lightboxVideo.addEventListener('click', (e) => e.stopPropagation());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Música: o botão só aparece se audio/musica.mp3 existir
const audio = document.getElementById('audio');
const musicBtn = document.getElementById('music');
audio.preload = 'metadata';
audio.addEventListener('loadedmetadata', () => { musicBtn.hidden = false; });
const playMusic = () => audio.play().catch(() => {});
musicBtn.addEventListener('click', () => {
  if (audio.paused) playMusic(); else audio.pause();
});
audio.addEventListener('play', () => {
  musicBtn.classList.add('playing', 'compact');
  musicBtn.setAttribute('aria-label', 'Pausar música');
});
audio.addEventListener('pause', () => {
  musicBtn.classList.remove('playing');
  musicBtn.setAttribute('aria-label', 'Tocar música');
});

// Confete
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const colors = ['#b5762a', '#e8c99a', '#f7f2ea', '#d94f4f', '#4f8fd9', '#5fbf7a'];

function launchConfetti() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pieces = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.7,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 6,
    size: Math.random() * 6 + 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = false;
    pieces.forEach((p) => {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y < innerHeight + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  };
  tick();
}

document.getElementById('celebrate').addEventListener('click', (e) => {
  launchConfetti();
  if (audio.paused) playMusic();
  e.currentTarget.textContent = 'Parabéns! 🎉';
  if (navigator.vibrate) navigator.vibrate(80);
});
