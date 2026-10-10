/**
 * ============================================================================
 * RAMEEN ALI'S 26TH BIRTHDAY CELEBRATION APP
 * Single Page Animated Web App
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let currentPage = 0;
  const totalPages = 7;
  let isTransitioning = false;
  let currentSlide = 0;
  const totalSlides = 5;
  let slideInterval = null;

  // --- DOM Elements ---
  const pages = document.querySelectorAll('.page-section');
  const navNextBtn = document.getElementById('navNextBtn');
  const navBackBtn = document.getElementById('navBackBtn');
  const nextBtnText = document.getElementById('nextBtnText');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressDots = document.querySelectorAll('.dot-btn');
  const pageIndicator = document.getElementById('pageIndicator');
  const ambientLayer = document.getElementById('ambientLayer');

  // Detect phones/tablets once, used to lighten effects
  const IS_MOBILE = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

  // Carousel Elements
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const carouselDots = document.querySelectorAll('.c-dot');
  const carouselPrevBtn = document.getElementById('carouselPrevBtn');
  const carouselNextBtn = document.getElementById('carouselNextBtn');
  const carouselStage = document.getElementById('carouselStage');

  // Audio Elements
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicLabel = document.getElementById('musicLabel');
  const bgAudio = document.getElementById('bgAudio');

  // Finale Elements
  const blowCandleBtn = document.getElementById('blowCandleBtn');
  const burstCelebrationBtn = document.getElementById('burstCelebrationBtn');
  const replayJourneyBtn = document.getElementById('replayJourneyBtn');
  const candlesRow = document.getElementById('candlesRow');
  const flames = document.querySelectorAll('.flame');

  // Next Button Labels per page
  const nextBtnLabels = [
    'See Memories 📸 →',
    "Read Mama's Wish 💌 →",
    "Read Papa's Wish 💌 →",
    "Read Yasmin's Wish 💌 →",
    "Read Mamoon's Wish 💌 →",
    'Grand Finale 🎂 →',
    'Relive From Start ↺'
  ];

  // ============================================================================
  // 1. PAGE NAVIGATION SYSTEM
  // ============================================================================

  function updatePageUI(targetIndex, direction = 1) {
    if (targetIndex < 0 || targetIndex >= totalPages) return;
    if (isTransitioning) return;
    isTransitioning = true;

    const oldPage = pages[currentPage];
    const newPage = pages[targetIndex];

    // Direction classes for smooth animated slide & zoom
    if (direction > 0) {
      oldPage.classList.add('slide-out-left');
      newPage.classList.add('slide-in-right');
    } else {
      oldPage.classList.add('slide-out-right');
      newPage.classList.add('slide-in-left');
    }

    newPage.classList.add('active');

    setTimeout(() => {
      oldPage.classList.remove('active', 'slide-out-left', 'slide-out-right');
      newPage.classList.remove('slide-in-right', 'slide-in-left');
      isTransitioning = false;
    }, 550);

    currentPage = targetIndex;

    // Update Progress Bar & Dots
    const progressPercent = ((currentPage + 1) / totalPages) * 100;
    progressBarFill.style.width = `${progressPercent}%`;

    progressDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentPage);
      dot.classList.toggle('passed', idx < currentPage);
    });

    if (pageIndicator) {
      pageIndicator.textContent = `${currentPage + 1} / ${totalPages}`;
    }

    // Update Back button visibility
    if (currentPage === 0) {
      navBackBtn.classList.remove('visible');
    } else {
      navBackBtn.classList.add('visible');
    }

    // Update Next Button Text
    nextBtnText.textContent = nextBtnLabels[currentPage];

    // Trigger Page-Specific Effects
    handlePageArrival(currentPage);
  }

  function handlePageArrival(pageIdx) {
    // Ambient floating motifs change depending on current page
    setupAmbientMotifs(pageIdx);

    // Page 0: Confetti shower & balloons
    if (pageIdx === 0) {
      triggerConfettiBurst(50);
      spawnBalloons(8);
    }

    // Page 1: Start memories auto-slide
    if (pageIdx === 1) {
      startMemoriesAutoSlide();
    } else {
      stopMemoriesAutoSlide();
    }

    // Page 2: Mama's Page - Floating hearts
    if (pageIdx === 2) {
      triggerPetalBurst(20);
    }

    // Page 6: Finale - Grand Fireworks & Confetti
    if (pageIdx === 6) {
      startGrandFinaleShow();
    }
  }

  // Next Button Click Handler
  navNextBtn.addEventListener('click', (e) => {
    createRipple(e, navNextBtn);
    initAudioOnInteraction();

    if (currentPage === totalPages - 1) {
      updatePageUI(0, -1);
    } else {
      updatePageUI(currentPage + 1, 1);
    }
  });

  // Back Button Click Handler
  navBackBtn.addEventListener('click', (e) => {
    createRipple(e, navBackBtn);
    if (currentPage > 0) {
      updatePageUI(currentPage - 1, -1);
    }
  });

  // Progress Dots Click Handler
  progressDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.getAttribute('data-step'), 10);
      if (step !== currentPage) {
        initAudioOnInteraction();
        updatePageUI(step, step > currentPage ? 1 : -1);
      }
    });
  });

  // Replay Button on Finale
  if (replayJourneyBtn) {
    replayJourneyBtn.addEventListener('click', () => {
      updatePageUI(0, -1);
    });
  }

  // ============================================================================
  // 2. MEMORIES CAROUSEL (Touch Swipe + Arrows + Dots)
  // ============================================================================

  function showSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    carouselSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    carouselDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (carouselNextBtn && carouselPrevBtn) {
    carouselNextBtn.addEventListener('click', () => {
      nextSlide();
      resetMemoriesAutoSlide();
    });
    carouselPrevBtn.addEventListener('click', () => {
      prevSlide();
      resetMemoriesAutoSlide();
    });
  }

  carouselDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.getAttribute('data-slide-target'), 10);
      showSlide(target);
      resetMemoriesAutoSlide();
    });
  });

  // Touch Swipe Handling for Carousel
  let touchStartX = 0;
  let touchEndX = 0;

  if (carouselStage) {
    carouselStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetMemoriesAutoSlide();
    }
  }

  function startMemoriesAutoSlide() {
    stopMemoriesAutoSlide();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopMemoriesAutoSlide() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  function resetMemoriesAutoSlide() {
    stopMemoriesAutoSlide();
    if (currentPage === 1) {
      startMemoriesAutoSlide();
    }
  }

  // ============================================================================
  // 3. AMBIENT PARTICLES & BALLOONS
  // ============================================================================

  const pageMotifs = {
    0: ['🎈', '✨', '🌸', '💖', '💛'],
    1: ['📸', '✨', '💫', '🌸', '💛'],
    2: ['🌸', '💖', '🌺', '🤍', '💗'], // Mama (Flowers & Hearts)
    3: ['👑', '⭐', '✨', '💛', '🌟'], // Papa (Gold Stars & Crowns)
    4: ['🎀', '🦋', '💖', '✨', '💋'], // Yasmin (Bows & Butterflies)
    5: ['🌟', '✨', '⭐', '🤍', '💫'], // Mamoon (Starlight & Peace)
    6: ['🎂', '🎆', '🎉', '✨', '💖']  // Finale
  };

  function setupAmbientMotifs(pageIdx) {
    ambientLayer.innerHTML = '';
    const motifs = pageMotifs[pageIdx] || pageMotifs[0];

    // Spawn 14 ambient gently rising items
    const motifCount = IS_MOBILE ? 6 : 14;
    for (let i = 0; i < motifCount; i++) {
      const el = document.createElement('div');
      el.className = 'floating-particle';
      el.textContent = motifs[Math.floor(Math.random() * motifs.length)];
      el.style.left = `${Math.random() * 95}%`;
      el.style.fontSize = `${1.2 + Math.random() * 1.4}rem`;
      el.style.animationDuration = `${8 + Math.random() * 10}s`;
      el.style.animationDelay = `${Math.random() * 5}s`;
      ambientLayer.appendChild(el);
    }
  }

  function spawnBalloons(count = 6) {
    if (IS_MOBILE) count = Math.min(count, 4);
    const colors = ['#f472b6', '#fbbf24', '#fbcfe8', '#f59e0b', '#ec4899', '#d4af37'];
    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon';
      const color = colors[i % colors.length];
      balloon.style.backgroundColor = color;
      balloon.style.left = `${10 + Math.random() * 80}%`;
      balloon.style.animationDuration = `${9 + Math.random() * 6}s`;
      balloon.style.animationDelay = `${i * 0.7}s`;

      const string = document.createElement('div');
      string.className = 'balloon-string';
      balloon.appendChild(string);

      ambientLayer.appendChild(balloon);

      // Clean up after animation
      setTimeout(() => {
        balloon.remove();
      }, 16000);
    }
  }

  // ============================================================================
  // 4. CANVAS CONFETTI & FIREWORKS ENGINE
  // ============================================================================

  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let particles = [];
  let fireworks = [];

  // Phones get a lighter show so everything stays smooth (IS_MOBILE is defined at the top)
  const FX_SCALE = IS_MOBILE ? 0.45 : 1;       // fewer particles on phones
  const MAX_PARTICLES = IS_MOBILE ? 70 : 400;  // hard cap
  const MAX_SPARKS = IS_MOBILE ? 120 : 600;    // hard cap
  const CANVAS_RES = IS_MOBILE ? 0.75 : 1;     // draw at lower resolution on phones

  function resizeCanvas() {
    canvas.width = Math.round(window.innerWidth * CANVAS_RES);
    canvas.height = Math.round(window.innerHeight * CANVAS_RES);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor(x, y, isGoldOnly = false) {
      this.x = x !== undefined ? x : Math.random() * canvas.width;
      this.y = y !== undefined ? y : -10;
      this.size = Math.random() * 8 + 4;
      this.color = isGoldOnly 
        ? ['#d4af37', '#ffd700', '#fbeea4', '#aa7c11'][Math.floor(Math.random() * 4)]
        : ['#f472b6', '#db2777', '#fbcfe8', '#d4af37', '#ffd700', '#ffffff'][Math.floor(Math.random() * 6)];
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 3 + 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 6 - 3;
      this.opacity = 1;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
      this.rotation += this.rotationSpeed;
      if (this.y > canvas.height - 20) {
        this.opacity -= 0.02;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class FireworkSpark {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
      this.gravity = 0.06;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.radius = Math.random() * 2.5 + 1.5;
    }

    update() {
      this.speedY += this.gravity;
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      if (!IS_MOBILE) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
      }
      ctx.fill();
      ctx.restore();
    }
  }

  function launchFirework(x, y) {
    const colors = [
      '#ff4081', '#ff80ab', '#ffd700', '#ffb300', '#f48fb1', '#fff', '#e040fb'
    ];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    const sparkCount = IS_MOBILE ? 16 : 36;
    for (let i = 0; i < sparkCount && fireworks.length < MAX_SPARKS; i++) {
      fireworks.push(new FireworkSpark(x, y, chosenColor));
    }
    startFX();
  }

  function triggerConfettiBurst(count = 40) {
    count = Math.max(4, Math.round(count * FX_SCALE));
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      particles.push(new ConfettiParticle(Math.random() * canvas.width, -10));
    }
    startFX();
  }

  function triggerPetalBurst(count = 20) {
    count = Math.max(4, Math.round(count * FX_SCALE));
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      particles.push(new ConfettiParticle(Math.random() * canvas.width, -10));
    }
    startFX();
  }

  function loopFX() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update & draw Confetti
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].opacity <= 0 || particles[i].y > canvas.height + 20) {
        particles.splice(i, 1);
      }
    }

    // Update & draw Fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw();
      if (fireworks[i].alpha <= 0) {
        fireworks.splice(i, 1);
      }
    }

    if (particles.length === 0 && fireworks.length === 0) {
      // Nothing left to draw: stop the loop so the phone can rest
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameId = null;
      return;
    }
    animationFrameId = requestAnimationFrame(loopFX);
  }

  function startFX() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(loopFX);
    }
  }

  // Finale Show Continuous Fireworks
  let finaleInterval = null;
  function startGrandFinaleShow() {
    triggerConfettiBurst(70);
    launchFirework(canvas.width * 0.3, canvas.height * 0.35);
    launchFirework(canvas.width * 0.7, canvas.height * 0.3);

    if (finaleInterval) clearInterval(finaleInterval);
    finaleInterval = setInterval(() => {
      if (currentPage === 6) {
        const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.15;
        launchFirework(x, y);
        if (Math.random() > 0.6) {
          triggerConfettiBurst(25);
        }
      } else {
        clearInterval(finaleInterval);
        finaleInterval = null;
      }
    }, IS_MOBILE ? 1800 : 1200);
  }

  if (burstCelebrationBtn) {
    burstCelebrationBtn.addEventListener('click', (e) => {
      createRipple(e, burstCelebrationBtn);
      triggerConfettiBurst(90);
      launchFirework(canvas.width * 0.5, canvas.height * 0.3);
      launchFirework(canvas.width * 0.25, canvas.height * 0.35);
      launchFirework(canvas.width * 0.75, canvas.height * 0.35);
    });
  }

  // ============================================================================
  // 5. INTERACTIVE BIRTHDAY CAKE CANDLES
  // ============================================================================

  let candlesExtinguished = false;

  function blowCandles() {
    if (candlesExtinguished) {
      // Relight
      flames.forEach(f => f.classList.remove('extinguished'));
      blowCandleBtn.querySelector('#blowBtnText').textContent = 'Tap to Blow Candles & Make a Wish! 🕯️';
      candlesExtinguished = false;
      return;
    }

    // Extinguish!
    flames.forEach(f => f.classList.add('extinguished'));
    candlesExtinguished = true;
    blowCandleBtn.querySelector('#blowBtnText').textContent = '✨ Wish Made! Tap to Relight 🎂';

    // Massive Celebration Explosion
    triggerConfettiBurst(100);
    launchFirework(canvas.width * 0.5, canvas.height * 0.3);
    launchFirework(canvas.width * 0.3, canvas.height * 0.25);
    launchFirework(canvas.width * 0.7, canvas.height * 0.25);

    playChimeMelody();
  }

  if (blowCandleBtn) {
    blowCandleBtn.addEventListener('click', blowCandles);
  }
  if (candlesRow) {
    candlesRow.addEventListener('click', blowCandles);
  }

  // ============================================================================
  // 6. MUSIC CONTROLLER (plays assets/music.mp3)
  // ============================================================================

  let isAudioPlaying = false;

  function setMusicUI(playing) {
    isAudioPlaying = playing;
    musicToggleBtn.classList.toggle('playing', playing);
    musicLabel.textContent = playing ? 'Mute 🔊' : 'Play Music 🎵';
  }

  function toggleMusic() {
    if (isAudioPlaying) {
      if (bgAudio) bgAudio.pause();
      setMusicUI(false);
    } else if (bgAudio) {
      bgAudio.volume = 0.6;
      const p = bgAudio.play();
      setMusicUI(true);
      if (p !== undefined) {
        p.catch(() => setMusicUI(false));
      }
    }
  }

  function initAudioOnInteraction() {
    if (!isAudioPlaying) {
      toggleMusic();
    }
  }

  musicToggleBtn.addEventListener('click', toggleMusic);

  // ---- Auto-start music when the site opens ----
  // Browsers may block sound until the visitor interacts with the page.
  // So: try to play right away; if blocked, start on the very first
  // tap / click / key press / scroll anywhere on the page.
  const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel'];

  function removeUnlockListeners() {
    unlockEvents.forEach((ev) => document.removeEventListener(ev, onFirstInteraction, true));
  }

  function onFirstInteraction(e) {
    // Let the music button handle its own taps
    if (e && e.target && e.target.closest && e.target.closest('#musicController')) return;
    removeUnlockListeners();
    if (!isAudioPlaying) toggleMusic();
  }

  function tryAutoplay() {
    if (!bgAudio) return;
    bgAudio.volume = 0.6;
    const p = bgAudio.play();
    if (p !== undefined) {
      p.then(() => {
        setMusicUI(true);
        removeUnlockListeners();
      }).catch(() => {
        // Blocked by the browser: wait for the first interaction
        setMusicUI(false);
      });
    }
  }

  unlockEvents.forEach((ev) => document.addEventListener(ev, onFirstInteraction, true));
  tryAutoplay();
  window.addEventListener('load', () => { if (!isAudioPlaying) tryAutoplay(); });

  // ============================================================================
  // 7. BUTTON RIPPLE EFFECT & UTILITIES
  // ============================================================================

  function createRipple(e, targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    const x = e.clientX ? e.clientX - rect.left - size / 2 : rect.width / 2 - size / 2;
    const y = e.clientY ? e.clientY - rect.top - size / 2 : rect.height / 2 - size / 2;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    targetBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }

  // Keyboard navigation support
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      if (currentPage === 1) {
        nextSlide();
      } else if (currentPage < totalPages - 1) {
        updatePageUI(currentPage + 1, 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentPage === 1) {
        prevSlide();
      } else if (currentPage > 0) {
        updatePageUI(currentPage - 1, -1);
      }
    }
  });

  // Initial setup
  setupAmbientMotifs(0);
  spawnBalloons(8);
  triggerConfettiBurst(40);
});
