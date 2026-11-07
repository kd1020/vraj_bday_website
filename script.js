/* ==========================================================================
   ROMANTIC BIRTHDAY WEBSITE — INTERACTIVITY, AUDIO & RONALDO SURPRISE
   (DIRECT ROOT FILES + ANDROID MOBILE FRIENDLY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const openSurpriseBtn = document.getElementById('openSurpriseBtn');
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const floatingHeartsContainer = document.getElementById('floatingHearts');

  // Audio Elements (Directly in the same folder: audio1, audio2, audio3)
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
  let wasBgMusicPlayingBeforeVoice = false;
  const normalBgVolume = 0.65;
  const duckedBgVolume = 0.12;
  bgMusic.volume = normalBgVolume;

  /* --------------------------------------------------------------------------
     1. SMART DIRECT ROOT FILE RESOLVER (image1..image11 & audio1..audio3)
        Automatically checks imageN.jpeg, imageN.jpg, imageN.png, or imageN
        directly in the same folder without needing any subfolders!
     -------------------------------------------------------------------------- */
  const imgExtensions = ['.jpeg', '.jpg', '.png', '.webp', ''];
  const allImages = document.querySelectorAll('img');

  allImages.forEach((img) => {
    let extIndex = 0;
    const baseName =
      img.getAttribute('data-base') ||
      (img.getAttribute('src') || '').replace(/\.[^/.]+$/, '').replace(/^photo\//, '');

    img.addEventListener('error', function handleImgError() {
      extIndex += 1;
      if (extIndex < imgExtensions.length) {
        this.src = baseName + imgExtensions[extIndex];
        return;
      }
      if (this.dataset.fallbackApplied === 'true') return;
      this.dataset.fallbackApplied = 'true';
      const isRonaldo = baseName === 'image1';
      const bgGrad = isRonaldo ? '%23dfeee3' : '%23eff7f1';
      const accentColor = isRonaldo ? '%23244031' : '%23d87a94';
      const emoji = isRonaldo ? '⚡ SUIIII! ⚡' : '💌';
      this.src =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
            `<rect width="400" height="400" fill="${decodeURIComponent(bgGrad)}"/>` +
            `<circle cx="200" cy="175" r="56" fill="#ffffff" opacity="0.85"/>` +
            `<text x="200" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${decodeURIComponent(accentColor)}">${emoji}</text>` +
            `<text x="200" y="275" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="#244031">${baseName}</text>` +
          `</svg>`
        );
    });
  });

  // Smart audio extension fallback for audio1, audio2, audio3 in the same folder
  const audioCandidates = {
    audio1: ['audio1.mpeg', 'audio1.mp3', 'audio1.ogg', 'audio1.wav', 'audio1'],
    audio2: ['audio2.ogg', 'audio2.mpeg', 'audio2.mp3', 'audio2.m4a', 'audio2.wav', 'audio2'],
    audio3: ['audio3.mpeg', 'audio3.mp3', 'audio3.ogg', 'audio3.wav', 'audio3']
  };

  [bgMusic, voiceNoteAudio, ronaldoAudio].forEach((audioEl) => {
    if (!audioEl) return;
    const baseKey = audioEl.getAttribute('data-base');
    const candidates = audioCandidates[baseKey] || [];
    let candidateIdx = 0;
    audioEl.addEventListener('error', () => {
      candidateIdx += 1;
      if (candidateIdx < candidates.length) {
        audioEl.src = candidates[candidateIdx];
        audioEl.load();
      }
    });
  });

  /* --------------------------------------------------------------------------
     2. AMBIENT FLOATING HEARTS GENERATOR
     -------------------------------------------------------------------------- */
  function createFloatingHearts() {
    const symbols = ['♡', '♥', '💌', '✨', '🌸'];
    const isMobile = window.innerWidth <= 600;
    const count = isMobile ? 12 : 18;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'floating-particle';
      span.textContent = symbols[i % symbols.length];
      const leftPos = Math.random() * 94 + 3;
      const duration = 12 + Math.random() * 14;
      const delay = Math.random() * 12;
      const size = 0.85 + Math.random() * 0.65;
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
     3. BACKGROUND MUSIC & ANDROID TOUCH AUDIO UNLOCK
     -------------------------------------------------------------------------- */
  function updateMusicUI(playing) {
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

  // Unlock Ronaldo audio element during initial user tap so Android Chrome
  // allows playing audio3 when triggered by scroll events later
  function unlockSecondaryAudioForAndroid() {
    ronaldoAudio.muted = true;
    const p = ronaldoAudio.play();
    if (p !== undefined) {
      p.then(() => {
        ronaldoAudio.pause();
        ronaldoAudio.currentTime = 0;
        ronaldoAudio.muted = false;
      }).catch(() => {
        ronaldoAudio.muted = false;
      });
    } else {
      ronaldoAudio.muted = false;
    }
  }

  function unlockAndStartExperience() {
    if (isExperienceStarted) return;
    isExperienceStarted = true;
    body.classList.remove('locked');
    welcomeOverlay.classList.add('dismissed');
    startBackgroundMusic();
    unlockSecondaryAudioForAndroid();
    triggerInitialReveals();
  }

  // Attempt autoplay on page load if permitted
  const initialAutoplay = bgMusic.play();
  if (initialAutoplay !== undefined) {
    initialAutoplay
      .then(() => {
        updateMusicUI(true);
      })
      .catch(() => {
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
    { threshold: 0.14, rootMargin: '0px 0px -30px 0px' }
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
    { threshold: 0.3 }
  );

  pageSections.forEach((sec) => sectionObserver.observe(sec));

  /* --------------------------------------------------------------------------
     5. VOICE NOTE CUSTOM AUDIO PLAYER (PAGE 4) — WITH ANDROID TOUCH SEEK
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

  function seekVoiceNote(clientX) {
    const rect = voiceProgressWrap.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    if (Number.isFinite(voiceNoteAudio.duration) && voiceNoteAudio.duration > 0) {
      voiceNoteAudio.currentTime = ratio * voiceNoteAudio.duration;
    }
  }

  voiceProgressWrap.addEventListener('click', (e) => {
    seekVoiceNote(e.clientX);
  });

  voiceProgressWrap.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches && e.touches[0]) {
        seekVoiceNote(e.touches[0].clientX);
      }
    },
    { passive: true }
  );

  /* --------------------------------------------------------------------------
     6. SPECIAL SURPRISE: RONALDO SUIIII SCROLL TRIGGER & AUDIO SYNC
     -------------------------------------------------------------------------- */
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
    if (now - lastRonaldoTimestamp < 9000) return;

    isRonaldoActive = true;
    lastRonaldoTimestamp = now;
    lastTriggeredRatio = currentScrollRatio;

    if (ronaldoHideTimer) {
      clearTimeout(ronaldoHideTimer);
    }

    if (!bgMusic.paused) {
      bgMusic.volume = duckedBgVolume;
    }

    ronaldoOverlay.classList.remove('exiting');
    ronaldoOverlay.classList.add('active');
    ronaldoOverlay.setAttribute('aria-hidden', 'false');

    ronaldoAudio.muted = false;
    ronaldoAudio.currentTime = 0;
    const soundPromise = ronaldoAudio.play();
    if (soundPromise !== undefined) {
      soundPromise.catch(() => {});
    }

    const dismissRonaldo = () => {
      if (!isRonaldoActive) return;
      ronaldoOverlay.classList.add('exiting');
      setTimeout(() => {
        ronaldoOverlay.classList.remove('active', 'exiting');
        ronaldoOverlay.setAttribute('aria-hidden', 'true');
        isRonaldoActive = false;
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

      scrollProgressBar.style.width = `${scrollRatio * 100}%`;

      if (!isExperienceStarted || scrollRatio < 0.16) return;

      for (const point of triggerCheckpoints) {
        if (!point.triggered && Math.abs(scrollRatio - point.targetRatio) <= 0.035) {
          point.triggered = true;
          triggerRonaldoSurprise(scrollRatio);
          break;
        }
      }

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
