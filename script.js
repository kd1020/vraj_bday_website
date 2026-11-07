/* ==========================================================================
   ROMANTIC BIRTHDAY WEBSITE — INTERACTIVITY, AUDIO & RONALDO SURPRISE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const floatingHeartsContainer = document.getElementById('floatingHearts');

  // Audio Elements
  const bgMusic = document.getElementById('bgMusic');
  const voiceNoteAudio = document.getElementById('voiceNoteAudio');
  const ronaldoAudio = document.getElementById('ronaldoAudio');

  // Music Controls
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');

  // Voice Note Player Elements
  const voicePlayer = document.getElementById('voicePlayer');
  const voicePlayBtn = document.getElementById('voicePlayBtn');
  const voicePlayIcon = document.getElementById('voicePlayIcon');
  const voicePauseIcon = document.getElementById('voicePauseIcon');
  const voiceProgressWrap = document.getElementById('voiceProgressWrap');
  const voiceProgressFill = document.getElementById('voiceProgressFill');
  const voiceCurrentTime = document.getElementById('voiceCurrentTime');
  const voiceTotalDuration = document.getElementById('voiceTotalDuration');

  // Ronaldo Surprise Elements
  const ronaldoOverlay = document.getElementById('ronaldoOverlay');
  const sendLoveBtn = document.getElementById('sendLoveBtn');

  // State Tracking
  let isExperienceStarted = false;
  let isBgMusicPlaying = false;
  let wasBgMusicPlayingBeforeVoice = false;
  let normalBgVolume = 0.65;
  let duckedBgVolume = 0.12;
  bgMusic.volume = normalBgVolume;

  /* --------------------------------------------------------------------------
     1. GRACEFUL IMAGE FALLBACK (IF LOCAL FILES ARE NOT YET PLACED IN FOLDER)
     -------------------------------------------------------------------------- */
  const allImages = document.querySelectorAll('img');
  allImages.forEach((img) => {
    img.addEventListener('error', function handleImgError() {
      if (this.dataset.fallbackApplied === 'true') return;
      this.dataset.fallbackApplied = 'true';
      const srcPath = this.getAttribute('src') || 'photo';
      const isRonaldo = srcPath.includes('image1.jpeg');
      const bgGrad = isRonaldo
        ? '%23dfeee3'
        : '%23eff7f1';
      const accentColor = isRonaldo ? '%23244031' : '%23d87a94';
      const emoji = isRonaldo ? '⚡ SUIIII! ⚡' : '💌';
      const svgPlaceholder =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
            `<rect width="400" height="400" fill="${decodeURIComponent(bgGrad)}"/>` +
            `<circle cx="200" cy="175" r="56" fill="#ffffff" opacity="0.85"/>` +
            `<text x="200" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${decodeURIComponent(accentColor)}">${emoji}</text>` +
            `<text x="200" y="275" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="#244031">${srcPath}</text>` +
            `<text x="200" y="302" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#436251">Place your photo at ${srcPath}</text>` +
          `</svg>`
        );
      this.src = svgPlaceholder;
    });
  });

  /* --------------------------------------------------------------------------
     2. AMBIENT FLOATING HEARTS GENERATOR
     -------------------------------------------------------------------------- */
  function createFloatingHearts() {
    const symbols = ['♡', '♥', '💌', '✨', '🌸'];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'floating-particle';
      span.textContent = symbols[i % symbols.length];
      const leftPos = Math.random() * 96 + 2;
      const duration = 12 + Math.random() * 14;
      const delay = Math.random() * 12;
      const size = 0.85 + Math.random() * 0.75;
      span.style.left = `${leftPos}%`;
      span.style.animationDuration = `${duration}s`;
      span.style.animationDelay = `-${delay}s`;
      span.style.fontSize = `${size}rem`;
      span.style.color = i % 2 === 0 ? '#d87a94' : '#84a98c';
      floatingHeartsContainer.appendChild(span);
    }
  }
  createFloatingHearts();

  /* --------------------------------------------------------------------------
     3. BACKGROUND MUSIC & WELCOME SCREEN UNLOCK
     -------------------------------------------------------------------------- */
  function updateMusicUI(playing) {
    isBgMusicPlaying = playing;
    if (playing) {
      musicToggleBtn.classList.add('playing');
      musicStatusText.textContent = 'Playing Song';
    } else {
      musicToggleBtn.classList.remove('playing');
      musicStatusText.textContent = 'Music Paused';
    }
  }

  function startBackgroundMusic() {
    bgMusic.volume = normalBgVolume;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateMusicUI(true);
        })
        .catch(() => {
          updateMusicUI(false);
        });
    }
  }

  function unlockAndStartExperience() {
    if (isExperienceStarted) return;
    isExperienceStarted = true;
    body.classList.remove('locked');
    welcomeOverlay.classList.add('dismissed');
    startBackgroundMusic();
    triggerInitialReveals();
  }

  // Attempt autoplay on page load if browser permits
  const initialAutoplay = bgMusic.play();
  if (initialAutoplay !== undefined) {
    initialAutoplay
      .then(() => {
        updateMusicUI(true);
      })
      .catch(() => {
        // Autoplay blocked by browser until user clicks "Open Your Surprise 💌"
        updateMusicUI(false);
      });
  }

  openSurpriseBtn.addEventListener('click', unlockAndStartExperience);

  musicToggleBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => updateMusicUI(true)).catch(() => updateMusicUI(false));
    } else {
      bgMusic.pause();
      updateMusicUI(false);
    }
  });

  /* --------------------------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS & ACTIVE NAVIGATION
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-item, .reveal-collage, .reveal-letter');
  const navDots = document.querySelectorAll('.nav-dot');
  const pageSections = document.querySelectorAll('.page-section');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  function triggerInitialReveals() {
    document.querySelectorAll('#section-home .reveal-item, #section-home .reveal-collage').forEach((el) => {
      el.classList.add('in-view');
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          navDots.forEach((dot) => {
            dot.classList.toggle('active', dot.dataset.section === activeId);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  pageSections.forEach((sec) => sectionObserver.observe(sec));

  /* --------------------------------------------------------------------------
     5. VOICE NOTE CUSTOM AUDIO PLAYER (PAGE 4)
     -------------------------------------------------------------------------- */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function setVoicePlayState(playing) {
    if (playing) {
      voicePlayer.classList.add('playing');
      voicePlayIcon.classList.add('hidden');
      voicePauseIcon.classList.remove('hidden');
      voicePlayBtn.setAttribute('aria-label', 'Pause voice note');
    } else {
      voicePlayer.classList.remove('playing');
      voicePlayIcon.classList.remove('hidden');
      voicePauseIcon.classList.add('hidden');
      voicePlayBtn.setAttribute('aria-label', 'Play voice note');
    }
  }

  voiceNoteAudio.addEventListener('loadedmetadata', () => {
    voiceTotalDuration.textContent = formatTime(voiceNoteAudio.duration);
  });

  voiceNoteAudio.addEventListener('timeupdate', () => {
    const current = voiceNoteAudio.currentTime;
    const total = voiceNoteAudio.duration || 0;
    voiceCurrentTime.textContent = formatTime(current);
    if (total > 0) {
      const pct = Math.min(100, (current / total) * 100);
      voiceProgressFill.style.width = `${pct}%`;
      voiceProgressWrap.setAttribute('aria-valuenow', Math.round(pct));
    }
  });

  voiceNoteAudio.addEventListener('ended', () => {
    setVoicePlayState(false);
    voiceProgressFill.style.width = '0%';
    voiceCurrentTime.textContent = '0:00';
    if (wasBgMusicPlayingBeforeVoice) {
      bgMusic.volume = normalBgVolume;
      bgMusic.play().then(() => updateMusicUI(true)).catch(() => {});
    }
  });

  voicePlayBtn.addEventListener('click', () => {
    if (voiceNoteAudio.paused) {
      // Pause background song while listening to the personal voice note
      wasBgMusicPlayingBeforeVoice = !bgMusic.paused;
      if (wasBgMusicPlayingBeforeVoice) {
        bgMusic.pause();
        updateMusicUI(false);
      }
      voiceNoteAudio
        .play()
        .then(() => {
          setVoicePlayState(true);
        })
        .catch(() => {
          setVoicePlayState(false);
        });
    } else {
      voiceNoteAudio.pause();
      setVoicePlayState(false);
      if (wasBgMusicPlayingBeforeVoice) {
        bgMusic.volume = normalBgVolume;
        bgMusic.play().then(() => updateMusicUI(true)).catch(() => {});
      }
    }
  });

  voiceProgressWrap.addEventListener('click', (e) => {
    const rect = voiceProgressWrap.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    if (Number.isFinite(voiceNoteAudio.duration) && voiceNoteAudio.duration > 0) {
      voiceNoteAudio.currentTime = ratio * voiceNoteAudio.duration;
    }
  });

  /* --------------------------------------------------------------------------
     6. SPECIAL SURPRISE: RONALDO SUIIII SCROLL TRIGGER & AUDIO SYNC
     -------------------------------------------------------------------------- */
  // Controlled random scroll checkpoints so Ronaldo pops up unexpectedly
  // while scrolling through the page without triggering immediately on load
  // or repeating at the same scroll position.
  const triggerCheckpoints = [
    { minRatio: 0.24, maxRatio: 0.34, triggered: false },
    { minRatio: 0.54, maxRatio: 0.65, triggered: false },
    { minRatio: 0.80, maxRatio: 0.90, triggered: false }
  ].map((band) => ({
    targetRatio: band.minRatio + Math.random() * (band.maxRatio - band.minRatio),
    triggered: false
  }));

  let isRonaldoActive = false;
  let lastRonaldoTimestamp = 0;
  let lastTriggeredRatio = -1;
  let ronaldoHideTimer = null;

  function triggerRonaldoSurprise(currentScrollRatio) {
    if (!isExperienceStarted || isRonaldoActive) return;

    const now = Date.now();
    // Enforce cooldown so surprise feels spontaneous and never overlaps
    if (now - lastRonaldoTimestamp < 9000) return;

    isRonaldoActive = true;
    lastRonaldoTimestamp = now;
    lastTriggeredRatio = currentScrollRatio;

    if (ronaldoHideTimer) {
      clearTimeout(ronaldoHideTimer);
    }

    // Duck background music volume while Ronaldo SUIIII sound plays
    if (!bgMusic.paused) {
      bgMusic.volume = duckedBgVolume;
    }

    // Show Ronaldo visual popup immediately synchronized with sound effect
    ronaldoOverlay.classList.remove('exiting');
    ronaldoOverlay.classList.add('active');
    ronaldoOverlay.setAttribute('aria-hidden', 'false');

    // Play audio/audio3.mpeg synchronized with the popup entrance
    ronaldoAudio.currentTime = 0;
    const soundPromise = ronaldoAudio.play();
    if (soundPromise !== undefined) {
      soundPromise.catch(() => {
        // Fallback timer if local audio3.mpeg file is not yet placed
      });
    }

    const dismissRonaldo = () => {
      if (!isRonaldoActive) return;
      ronaldoOverlay.classList.add('exiting');
      setTimeout(() => {
        ronaldoOverlay.classList.remove('active', 'exiting');
        ronaldoOverlay.setAttribute('aria-hidden', 'true');
        isRonaldoActive = false;
        // Restore background music volume smoothly
        if (!bgMusic.paused) {
          bgMusic.volume = normalBgVolume;
        }
      }, 380);
    };

    ronaldoAudio.onended = dismissRonaldo;
    ronaldoHideTimer = setTimeout(dismissRonaldo, 2600);
  }

  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      // Update top scroll progress bar
      scrollProgressBar.style.width = `${scrollRatio * 100}%`;

      if (!isExperienceStarted || scrollRatio < 0.16) return;

      // Check if user crossed an untriggered scroll checkpoint
      for (const point of triggerCheckpoints) {
        if (!point.triggered && Math.abs(scrollRatio - point.targetRatio) <= 0.035) {
          point.triggered = true;
          triggerRonaldoSurprise(scrollRatio);
          break;
        }
      }

      // Re-arm a checkpoint only if the user scrolls far away (>38% page distance)
      if (lastTriggeredRatio >= 0 && Math.abs(scrollRatio - lastTriggeredRatio) > 0.38) {
        triggerCheckpoints.forEach((pt) => {
          if (Math.abs(scrollRatio - pt.targetRatio) > 0.35) {
            pt.triggered = false;
          }
        });
      }
    },
    { passive: true }
  );

  /* --------------------------------------------------------------------------
     7. CLOSING HEART BURST INTERACTION
     -------------------------------------------------------------------------- */
  if (sendLoveBtn) {
    sendLoveBtn.addEventListener('click', () => {
      for (let i = 0; i < 10; i++) {
        const burst = document.createElement('span');
        burst.className = 'floating-particle';
        burst.textContent = i % 2 === 0 ? '💗' : '💌';
        burst.style.left = `${42 + Math.random() * 16}%`;
        burst.style.animationDuration = `${3 + Math.random() * 3}s`;
        burst.style.animationDelay = '0s';
        burst.style.fontSize = `${1.1 + Math.random() * 0.8}rem`;
        floatingHeartsContainer.appendChild(burst);
        setTimeout(() => burst.remove(), 6000);
      }
    });
  }
});
