/* ==========================================================================
   GOATEDDD PREMIUM CORE ANIMATION ORCHESTRATION - PHASE 2
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP ScrollTrigger Plugin
gsap.registerPlugin(ScrollTrigger);

// ==========================================================================
// 1. LENIS SMOOTH SCROLLING SETUP
// ==========================================================================
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.05,
  touchMultiplier: 1.4,
  infinite: false,
});

// Sync Lenis scroll events with GSAP ScrollTrigger updates
lenis.on('scroll', () => {
  ScrollTrigger.update();
  
  // Floating Dial Progress Update
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (totalScroll > 0) {
    const scrollPercent = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
    const circumference = 150.8;
    const offset = circumference - (scrollPercent * circumference);
    gsap.set('.dial-progress', { strokeDashoffset: offset });
    
    const dial = document.querySelector('.scroll-dial-container');
    if (dial) {
      if (window.scrollY > 200) {
        dial.classList.add('visible');
      } else {
        dial.classList.remove('visible');
      }
    }
  }
});

// Link GSAP ticker directly to Lenis RAF loop
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Turn off GSAP scroll lag smoothing to avoid visual desync
gsap.ticker.lagSmoothing(0);

// Helper to update Lenis when DOM changes height
const resizeObserver = new ResizeObserver(() => lenis.resize());
resizeObserver.observe(document.body);

// ==========================================================================
// 2. LOADER & INITIAL TRANSITIONS
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const loaderBar = document.querySelector('.loader-bar');
  const loaderContent = document.querySelector('.loader-content');

  // Listen for full page resources load
  window.addEventListener('load', () => {
    // Complete the loading bar quickly
    gsap.to(loaderBar, {
      width: '100%',
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        const tl = gsap.timeline({
          onComplete: () => {
            loader.style.display = 'none';
          }
        });

        // 1. Fade out and scale down loader content
        tl.to(loaderContent, {
          opacity: 0,
          scale: 0.9,
          y: -20,
          duration: 0.6,
          ease: 'power3.inOut'
        });

        // 2. Diagonal clip-path screen wipe sweeps across
        tl.to(loader, {
          clipPath: 'polygon(130% 0%, 130% 0%, 160% 100%, 130% 100%)',
          duration: 1.4,
          ease: 'power4.inOut'
        }, '-=0.3');

        // 3. Start entrance timelines during the wipe
        tl.add(() => {
          triggerHeroEntrance();
        }, '-=1.0');
      }
    });
  });
});

// ==========================================================================
// 3. INTRO ENTRANCE ANIMATION (Hero & Nav)
// ==========================================================================
function triggerHeroEntrance() {
  const tl = gsap.timeline();

  // Slide up brand typography line masked segments
  tl.to('.title-line', {
    y: '0%',
    duration: 1.3,
    stagger: 0.12,
    ease: 'power4.out'
  });

  // Fade up tag line
  tl.from('.tag-glow', {
    y: 15,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, '-=1.0');

  // Fade up narrative description paragraph
  tl.to('.hero-desc', {
    y: 0,
    opacity: 1,
    duration: 1,
    ease: 'power3.out'
  }, '-=0.8');

  // Float down nav glass pill container
  tl.from('.nav-container', {
    y: -30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, '-=1.0');

  // Scale up and ease in main abstract image asset
  tl.from('.hero-media-wrapper', {
    scale: 0.95,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out'
  }, '-=1.2');
}

// ==========================================================================
// 4. LERPING CUSTOM CURSOR
// ==========================================================================
const cursor = document.getElementById('custom-cursor');
const cursorTextEl = document.querySelector('.cursor-text');
let mouseX = 0, mouseY = 0;
let ballX = 0, ballY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Cursor glare dynamic tracking
let lastScrollY = window.scrollY;
let scrollVelocity = 0;
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  scrollVelocity = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;
}, { passive: true });

let currentGlareX = 30;
let currentGlareY = 30;

// Standard linear interpolation loop synced to GSAP rendering frames
gsap.ticker.add(() => {
  const lerpFactor = 0.12; // Lower value = higher smooth latency drag
  ballX += (mouseX - ballX) * lerpFactor;
  ballY += (mouseY - ballY) * lerpFactor;

  gsap.set(cursor, {
    x: ballX,
    y: ballY
  });

  // Calculate dynamic glare angles based on cursor coordinates and page scrolling speed
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const targetGlareX = 30 + ((mouseX / screenW) - 0.5) * 40;
  const targetGlareY = 30 + ((mouseY / screenH) - 0.5) * 40 + (scrollVelocity * 0.1);

  currentGlareX += (targetGlareX - currentGlareX) * 0.1;
  currentGlareY += (targetGlareY - currentGlareY) * 0.1;

  // Decelerate scroll velocity smoothly
  scrollVelocity *= 0.92;

  cursor.style.setProperty('--glare-x', `${currentGlareX}%`);
  cursor.style.setProperty('--glare-y', `${currentGlareY}%`);
});

// Viewport boundaries cursor fading (avoids stuck border circles)
document.addEventListener('mouseleave', () => {
  gsap.to(cursor, { opacity: 0, scale: 0.5, duration: 0.3, ease: 'power2.out' });
});

document.addEventListener('mouseenter', () => {
  gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
});

// Register hover triggers
const hoverLinks = document.querySelectorAll('a, button, .contact-btn, .menu-btn, .menu-overlay-link');
hoverLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    cursor.classList.add('link-hovered');
  });
  link.addEventListener('mouseleave', () => {
    cursor.classList.remove('link-hovered');
  });
});

const showreelArea = document.querySelector('.showreel-mask-container');
if (showreelArea) {
  showreelArea.addEventListener('mouseenter', () => {
    cursor.classList.add('hovered');
  });
  showreelArea.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovered');
  });
}

// ==========================================================================
// 5. WIDESCREEN FULLSCREEN OVERLAY NAV LOGIC
// ==========================================================================
const menuBtn = document.getElementById('menu-btn');
const menuOverlay = document.getElementById('menu-overlay');
const menuLinks = document.querySelectorAll('.menu-overlay-link, .nav-link-item');

let menuOpen = false;
const menuTimeline = gsap.timeline({ paused: true });

// Setup premium orchestrated menu entry & exit timeline
// 1. Morph hamburger button lines to form a premium snapping "X"
menuTimeline.to('.line-1', {
  y: 3.25, // Mathematically centered offset between lines
  rotation: 45,
  backgroundColor: '#ffd2a9', // Morph to premium champagne accent
  duration: 0.5,
  ease: 'power4.inOut'
}, 0);

menuTimeline.to('.line-2', {
  y: -3.25, // Mathematically centered offset
  rotation: -45,
  backgroundColor: '#ffd2a9', // Morph to champagne
  duration: 0.5,
  ease: 'power4.inOut'
}, 0);

// Scale down the glass button container slightly for tactile touch response
menuTimeline.to(menuBtn, {
  scale: 0.92,
  borderColor: 'rgba(159, 90, 253, 0.5)',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  duration: 0.5,
  ease: 'power4.inOut'
}, 0);

// 2. Animate the menu overlay container fade and block layout scroll bounds
menuTimeline.to(menuOverlay, {
  autoAlpha: 1,
  duration: 0.75,
  ease: 'power3.inOut'
}, 0);

// 3. Luxurious scale parallax and progressive frosted-glass blur solidifying in space
menuTimeline.fromTo('.menu-overlay-bg', {
  scale: 1.06,
  backdropFilter: 'blur(0px)',
  webkitBackdropFilter: 'blur(0px)',
}, {
  scale: 1,
  backdropFilter: 'blur(30px)',
  webkitBackdropFilter: 'blur(30px)',
  duration: 0.9,
  ease: 'power4.out'
}, 0);

// 4. Kinetic typography slide-up with subtle skewing/scaling for liquid motion
menuTimeline.fromTo('.link-txt', {
  y: '110%',
  skewY: 6,
  scaleY: 1.1
}, {
  y: '0%',
  skewY: 0,
  scaleY: 1,
  duration: 0.95,
  stagger: 0.07,
  ease: 'power4.out'
}, '-=0.55');

// 5. Staggered reveal of index numbers alongside the text reveals
menuTimeline.fromTo('.link-num', {
  opacity: 0,
  x: -15,
}, {
  opacity: 1,
  x: 0,
  duration: 0.75,
  stagger: 0.07,
  ease: 'power3.out'
}, '-=0.85');

// 6. Delayed upward fade of social and email footer links
menuTimeline.fromTo('.menu-overlay-footer', {
  opacity: 0,
  y: 30
}, {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: 'power3.out'
}, '-=0.6');

let lastFocusedElement = null;

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  menuBtn.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  
  if (menuOpen) {
    lastFocusedElement = document.activeElement;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuOverlay.setAttribute('aria-hidden', 'false');
    menuTimeline.play();
    lenis.stop(); // Stop scroll behavior behind menu overlay
    
    // Focus first link in menu overlay
    setTimeout(() => {
      const firstLink = menuOverlay.querySelector('.menu-overlay-link');
      if (firstLink) firstLink.focus();
    }, 100);
  } else {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuTimeline.reverse();
    lenis.start();
    
    // Return focus to menu button
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    } else {
      menuBtn.focus();
    }
  }
});

// Close menu immediately upon choosing a navigation destination
menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    
    // Close overlay triggers
    if (menuOpen) {
      menuOpen = false;
      menuBtn.classList.remove('active');
      menuOverlay.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuOverlay.setAttribute('aria-hidden', 'true');
      menuTimeline.reverse();
      lenis.start();
    }

    // Direct Lenis smooth scroll navigate
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, { offset: 0, duration: 1.5 });
        
        // After scrolling completes, set focus to target section for keyboard accessibility
        setTimeout(() => {
          if (targetElement) {
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
          }
        }, 1500);
      }
    }
  });
});

// ==========================================================================
// 6. HERO PARALLAX MEDIA SCROLL
// ==========================================================================
gsap.to('.hero-media-img', {
  yPercent: 12,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-media-wrapper',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
});

// ==========================================================================
// 7. CINEMATIC SHOWREEL EXPAND TIMELINE (ScrollTrigger Pinned)
// ==========================================================================
const showreelSection = document.querySelector('.showreel-section');
const video = document.querySelector('.showreel-video');

if (showreelSection) {
  const showreelTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.showreel-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    }
  });

  // Expand card mask bounding dimensions to screen full-bleed edges
  showreelTimeline.to('.showreel-mask-container', {
    width: '100vw',
    height: '100vh',
    borderRadius: '0px',
    ease: 'none'
  });

  // Counter-scale video inside showreel at the same time
  showreelTimeline.to('.showreel-video', {
    scale: 1.0,
    ease: 'none'
  }, 0);

  // Fade out titles slightly as we fully immerse
  showreelTimeline.to('.showreel-text-container', {
    opacity: 0,
    scale: 0.95,
    ease: 'none'
  }, 0);

  // High-performance IntersectionObserver to trigger video play/pause programmatically
  if (video) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.05 });
    videoObserver.observe(video);
  }
}

// ==========================================================================
// 7B. CINEMATIC SEAMLESS VIEWPORT-EXPANDING SHOWREEL ENGINE
// ==========================================================================
const showreelTrigger = document.querySelector('.showreel-mask-container');
const fullscreenContainer = document.getElementById('showreel-fullscreen-container');
const fullscreenVideo = document.getElementById('showreel-fullscreen-video');

let playerOpen = false;

if (showreelTrigger && fullscreenContainer && fullscreenVideo) {
  const hdSourceUrl = '/assets/showreel_hd.mp4?v=12s-redesign-v2';

  const openPlayer = () => {
    playerOpen = true;
    lenis.stop(); // Lock page scrolling natively

    // Set the source directly on the video element to bypass overriding issues with empty src attributes
    if (!fullscreenVideo.src || !fullscreenVideo.src.includes(hdSourceUrl)) {
      fullscreenVideo.src = hdSourceUrl;
      fullscreenVideo.load();
    }

    // Capture original card boundaries and layout size
    const rect = showreelTrigger.getBoundingClientRect();

    // Position fullscreen wrapper exactly matching the original loop card
    gsap.set(fullscreenContainer, {
      display: 'flex',
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      borderRadius: '20px',
      opacity: 1
    });

    // Make the original card invisible seamlessly
    gsap.set(showreelTrigger, { opacity: 0 });

    // Transition smoothly to full browser viewport bounds
    gsap.to(fullscreenContainer, {
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        // Start playback with warm stereo audio swell
        fullscreenVideo.volume = 0;
        fullscreenVideo.muted = false;
        fullscreenVideo.play().then(() => {
          gsap.to(fullscreenVideo, { volume: 0.8, duration: 1.2, ease: 'power1.inOut' });
        }).catch(err => {
          console.log("Video autoplay prevented:", err);
        });
      }
    });
  };

  const closePlayer = () => {
    playerOpen = false;

    // Smoothly fade audio volume to 0 before closing
    gsap.to(fullscreenVideo, {
      volume: 0,
      duration: 0.5,
      ease: 'power1.inOut',
      onComplete: () => {
        fullscreenVideo.pause();
        
        // Retrieve fresh coordinates in case page scrolled during expand
        const currentRect = showreelTrigger.getBoundingClientRect();

        // Animate seamlessly back to original layout bounds
        gsap.to(fullscreenContainer, {
          top: currentRect.top + 'px',
          left: currentRect.left + 'px',
          width: currentRect.width + 'px',
          height: currentRect.height + 'px',
          borderRadius: '20px',
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            // Restore visibility of original components and flush resources
            gsap.set(showreelTrigger, { opacity: 1 });
            fullscreenContainer.style.display = 'none';
            // Unload source properly by removing the attribute
            fullscreenVideo.removeAttribute('src');
            fullscreenVideo.load();
            lenis.start(); // Unlock page scrolling
          }
        });
      }
    });
  };

  // Wire click to transition video
  showreelTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    openPlayer();
  });

  // Tap or click anywhere on the viewport container to dismiss/skip
  fullscreenContainer.addEventListener('click', () => {
    if (playerOpen) closePlayer();
  });

  // End of video auto-retransition back to original layout
  fullscreenVideo.addEventListener('ended', () => {
    if (playerOpen) closePlayer();
  });

  // Escape key accessibility handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playerOpen) {
      closePlayer();
    }
  });

  // Cursor states
  showreelTrigger.addEventListener('mouseenter', () => {
    if (cursorTextEl) cursorTextEl.textContent = 'PLAY';
  });
  showreelTrigger.addEventListener('mouseleave', () => {
    if (cursorTextEl) cursorTextEl.textContent = 'EXPLORE';
  });
}




// ==========================================================================
// 9. UPGRADED CARDS FLARE, PERSPECTIVE TILT & SHADOW WARP
// ==========================================================================
const interactiveCards = document.querySelectorAll('.glass-card, .work-card, .msme-badge-shield');

interactiveCards.forEach(card => {
  let boundary = null;

  card.addEventListener('mouseenter', () => {
    boundary = card.getBoundingClientRect();
    cursor.classList.add('link-hovered');
  });

  card.addEventListener('mousemove', (e) => {
    if (!boundary) return;
    
    // Exact relative coordinates within the card
    const relativeX = e.clientX - boundary.left;
    const relativeY = e.clientY - boundary.top;

    // Custom CSS custom properties update for the radial glare reflection positioning
    card.style.setProperty('--mouse-x', `${relativeX}px`);
    card.style.setProperty('--mouse-y', `${relativeY}px`);

    // Center card vectors math
    const midX = boundary.width / 2;
    const midY = boundary.height / 2;
    
    // Normalized center vectors (-1 to 1)
    const vectorX = (relativeX - midX) / midX;
    const vectorY = (relativeY - midY) / midY;

    // Set center vectors to update glare shadows and warps via CSS variables
    card.style.setProperty('--vector-x', vectorX);
    card.style.setProperty('--vector-y', vectorY);

    // Warp tilt angles: X rotation is influenced by Y vector, Y rotation by X vector
    const xTilt = -vectorY * 10; // Max 10 degrees tilt on X
    const yTilt = vectorX * 10;  // Max 10 degrees tilt on Y

    // Buttery-smooth GSAP tilt warp
    gsap.to(card, {
      rotateX: xTilt,
      rotateY: yTilt,
      transformPerspective: 1000,
      duration: 0.35,
      ease: 'power2.out'
    });
  });

  // Reset all values smoothly when mouse exits the card boundaries
  card.addEventListener('mouseleave', () => {
    boundary = null;
    cursor.classList.remove('link-hovered');
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    // Animate vectors back to 0
    gsap.to(card, {
      '--vector-x': 0,
      '--vector-y': 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
});

// ==========================================================================
// 10. TEXT REVEAL ON SCROLL IN OFFERINGS INTRO
// ==========================================================================
gsap.from('.section-title', {
  scrollTrigger: {
    trigger: '.offerings-intro',
    start: 'top 85%',
    toggleActions: 'play none none none'
  },
  y: 40,
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
});

gsap.from('.section-desc', {
  scrollTrigger: {
    trigger: '.offerings-intro',
    start: 'top 85%',
    toggleActions: 'play none none none'
  },
  y: 30,
  opacity: 0,
  duration: 1.2,
  delay: 0.15,
  ease: 'power3.out'
});

// ==========================================================================
// 11. DYNAMIC ORGANIC FOOTER SCROLL PARALLAX OVERLAY
// ==========================================================================
gsap.from('.footer-sand-block', {
  scrollTrigger: {
    trigger: '.footer',
    start: 'top 95%',
    end: 'bottom bottom',
    scrub: true
  },
  yPercent: -15, // Creates standard, high-performance parallax scroll depth overlay shifts
  ease: 'none'
});

// ==========================================================================
// 12. FULLSCREEN CONTACT MODAL TIMELINE & LOGIC (PHASE 3)
// ==========================================================================
const contactModal = document.getElementById('contact-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const contactTriggers = document.querySelectorAll('.contact-trigger, a[href="#contact"]');

const contactTimeline = gsap.timeline({ paused: true });

// Setup premium orchestrated contact modal entry timeline
// 1. Fade/show modal container
contactTimeline.to(contactModal, {
  autoAlpha: 1,
  duration: 0.6,
  ease: 'power3.inOut'
}, 0);

// 2. Frosted glass solidifying with elegant parallax zoom-out scale
contactTimeline.fromTo('.contact-modal-bg', {
  scale: 1.08,
  backdropFilter: 'blur(0px)',
  webkitBackdropFilter: 'blur(0px)',
}, {
  scale: 1,
  backdropFilter: 'blur(40px)',
  webkitBackdropFilter: 'blur(40px)',
  duration: 0.8,
  ease: 'power3.out'
}, 0);

// 3. Stagger close button entrance
contactTimeline.fromTo(modalCloseBtn, {
  scale: 0,
  rotation: -90
}, {
  scale: 1,
  rotation: 0,
  duration: 0.6,
  ease: 'back.out(1.7)'
}, 0.2);

// 4. Slide up left info panel coordinates staggered
contactTimeline.fromTo([
  '.contact-info-panel .modal-label',
  '.contact-info-panel .modal-title',
  '.contact-info-panel .modal-desc',
  '.contact-info-panel .coord-item'
], {
  y: 40,
  opacity: 0
}, {
  y: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.08,
  ease: 'power3.out'
}, 0.2);

// 5. Slide up glass form container & its inputs
contactTimeline.fromTo('.contact-form-panel', {
  y: 55,
  scale: 0.96,
  opacity: 0
}, {
  y: 0,
  scale: 1,
  opacity: 1,
  duration: 0.9,
  ease: 'power3.out'
}, 0.15);

contactTimeline.fromTo('.contact-form-panel .form-group', {
  y: 20,
  opacity: 0
}, {
  y: 0,
  opacity: 1,
  duration: 0.7,
  stagger: 0.06,
  ease: 'power3.out'
}, 0.3);

contactTimeline.fromTo('.submit-glass-btn', {
  y: 20,
  opacity: 0
}, {
  y: 0,
  opacity: 1,
  duration: 0.7,
  ease: 'power3.out'
}, 0.55);

let contactOpen = false;

function openContactModal() {
  lastFocusedElement = document.activeElement;
  contactOpen = true;
  contactModal.classList.add('active');
  contactModal.setAttribute('aria-hidden', 'false');
  
  // Close hamburger menu overlay if currently active ("close hamburger snaps")
  if (menuOpen) {
    menuOpen = false;
    menuBtn.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuOverlay.setAttribute('aria-hidden', 'true');
    menuTimeline.reverse();
  }
  
  contactTimeline.play();
  lenis.stop(); // Lock Lenis scrolling
  
  // Focus the first interactive element inside contact modal after transitions start
  setTimeout(() => {
    const firstInput = contactModal.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    } else if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  }, 150);
}

function closeContactModal() {
  contactOpen = false;
  contactModal.classList.remove('active');
  contactModal.setAttribute('aria-hidden', 'true');
  contactTimeline.reverse();
  lenis.start(); // Release Lenis scroll lock
  
  // Restore focus
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Connect all contact links / anchors
contactTriggers.forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
});

// Close button click listener
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    closeContactModal();
  });
}

// Escape key listener for closing overlays and modal components
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (contactOpen) {
      closeContactModal();
    } else if (menuOpen) {
      menuOpen = false;
      menuBtn.classList.remove('active');
      menuOverlay.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuOverlay.setAttribute('aria-hidden', 'true');
      menuTimeline.reverse();
      lenis.start();
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      } else {
        menuBtn.focus();
      }
    }
  }
});

// Setup Focus Traps for overlays (Navigation Menu & Contact Modal)
const focusableElementsSelector = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';

function setupOverlayFocusTrap(overlayEl) {
  overlayEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusables = overlayEl.querySelectorAll(focusableElementsSelector);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  });
}

// Bind focus traps
if (menuOverlay) setupOverlayFocusTrap(menuOverlay);
if (contactModal) setupOverlayFocusTrap(contactModal);

// Wire up custom cursor hovers for the close button and form input groups
modalCloseBtn.addEventListener('mouseenter', () => {
  cursor.classList.add('link-hovered');
});
modalCloseBtn.addEventListener('mouseleave', () => {
  cursor.classList.remove('link-hovered');
});

const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .submit-glass-btn');
formInputs.forEach(input => {
  input.addEventListener('mouseenter', () => {
    cursor.classList.add('link-hovered');
  });
  input.addEventListener('mouseleave', () => {
    cursor.classList.remove('link-hovered');
  });
});


/* ==========================================================================
   COMPONENT B CORE FUNCTIONALITIES INITIALIZERS
   ========================================================================== */

// 1. Ambient Particle System Canvas Logic
function initAmbientParticles() {
  const canvas = document.getElementById('ambient-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -Math.random() * 0.4 - 0.1;
      this.size = Math.random() * 8 + 3;
      this.alpha = Math.random() * 0.15 + 0.05;
      this.maxAlpha = this.alpha;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Subtle interactive drift based on mouse proximity
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220) {
        const force = (220 - dist) / 220;
        this.x -= (dx / dist) * force * 0.4;
        this.y -= (dy / dist) * force * 0.4;
      }

      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      const color = this.size > 7 ? '159, 90, 253' : '255, 141, 242';
      grad.addColorStop(0, `rgba(${color}, ${this.alpha})`);
      grad.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = grad;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  }
  render();
}

// 2. Interactive Frosted FAQ Accordion with GSAP Heights
function initFAQAccordion() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const iconV = item.querySelector('.line-v');
      const isOpen = item.classList.contains('active');
      
      // Close other active panels smoothly
      document.querySelectorAll('.faq-item.active').forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
          gsap.to(activeItem.querySelector('.faq-content'), { height: 0, duration: 0.4, ease: 'power2.out' });
          gsap.to(activeItem.querySelector('.line-v'), { rotation: 0, duration: 0.4, ease: 'power2.out' });
        }
      });

      if (isOpen) {
        item.classList.remove('active');
        gsap.to(content, { height: 0, duration: 0.4, ease: 'power2.out' });
        gsap.to(iconV, { rotation: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        item.classList.add('active');
        gsap.to(content, { height: content.scrollHeight, duration: 0.5, ease: 'power3.out' });
        gsap.to(iconV, { rotation: 90, duration: 0.4, ease: 'power2.out' });
      }
    });

    // Custom cursor hovers
    trigger.addEventListener('mouseenter', () => {
      cursor.classList.add('link-hovered');
    });
    trigger.addEventListener('mouseleave', () => {
      cursor.classList.remove('link-hovered');
    });
  });
}

// 3. Full-bleed Case Study Project Sheets Overlays
function initCaseStudyOverlays() {
  const caseStudyCards = document.querySelectorAll('.work-card');
  const csOverlay = document.getElementById('case-study-overlay');
  const csCloseBtn = document.getElementById('cs-close-btn');

  if (!csOverlay || !csCloseBtn) return;

  const csTimeline = gsap.timeline({ paused: true });

  // Staggered sheet entrance
  csTimeline.to(csOverlay, {
    autoAlpha: 1,
    duration: 0.6,
    ease: 'power3.inOut'
  }, 0);

  csTimeline.fromTo('.cs-overlay-bg', {
    scale: 1.08,
    backdropFilter: 'blur(0px)',
    webkitBackdropFilter: 'blur(0px)',
  }, {
    scale: 1,
    backdropFilter: 'blur(45px)',
    webkitBackdropFilter: 'blur(45px)',
    duration: 0.8,
    ease: 'power3.out'
  }, 0);

  csTimeline.fromTo(csCloseBtn, {
    scale: 0,
    rotation: -90
  }, {
    scale: 1,
    rotation: 0,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, 0.2);

  caseStudyCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('id');
      
      // Hide all other project detail sheets
      document.querySelectorAll('.cs-content-wrapper').forEach(wrapper => {
        wrapper.style.display = 'none';
      });

      const activeWrapper = document.querySelector(`#cs-content-${projectId}`);
      if (!activeWrapper) return;

      activeWrapper.style.display = 'block';
      csOverlay.classList.add('active');
      lenis.stop(); // Lock standard wrapper scroll
      document.documentElement.classList.add('cs-overlay-locked');
      document.body.classList.add('cs-overlay-locked');

      const scrollContainer = document.querySelector('.cs-scroll-container');
      if (scrollContainer) scrollContainer.scrollTop = 0;

      csTimeline.play(0);

      // Staggered entrance copy reveals
      const staggerElements = activeWrapper.querySelectorAll('.cs-category, .cs-title, .cs-intro-text, .cs-main-body > *, .cs-meta-item, .cs-media-showcase');
      
      gsap.fromTo(staggerElements, {
        y: 45,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 0.25
      });
    });

    // Cursor hovers triggers
    card.addEventListener('mouseenter', () => {
      if (cursorTextEl) cursorTextEl.textContent = 'OPEN';
    });
    card.addEventListener('mouseleave', () => {
      if (cursorTextEl) cursorTextEl.textContent = 'EXPLORE';
    });
  });

  function closeOverlay(callback) {
    csOverlay.classList.remove('active');
    document.documentElement.classList.remove('cs-overlay-locked');
    document.body.classList.remove('cs-overlay-locked');
    
    if (callback && typeof callback === 'function') {
      csTimeline.eventCallback("onReverseComplete", () => {
        csTimeline.eventCallback("onReverseComplete", null);
        callback();
      });
    } else {
      csTimeline.eventCallback("onReverseComplete", null);
    }
    
    csTimeline.reverse();
    lenis.start(); // Release lock
  }

  csCloseBtn.addEventListener('click', () => closeOverlay());
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && csOverlay.classList.contains('active')) {
      closeOverlay();
    }
  });

  csCloseBtn.addEventListener('mouseenter', () => {
    cursor.classList.add('link-hovered');
  });
  csCloseBtn.addEventListener('mouseleave', () => {
    cursor.classList.remove('link-hovered');
  });

  // Handle case study premium CTA button clicks
  const ctaButtons = csOverlay.querySelectorAll('.cs-cta-btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scope = btn.getAttribute('data-scope');
      
      // Close overlay first, then open contact modal with pre-populated scope
      closeOverlay(() => {
        if (typeof setProjectScope === 'function') {
          setProjectScope(scope);
        }
        if (typeof openContactModal === 'function') {
          openContactModal();
        }
      });
    });

    btn.addEventListener('mouseenter', () => {
      cursor.classList.add('link-hovered');
    });
    btn.addEventListener('mouseleave', () => {
      cursor.classList.remove('link-hovered');
    });
  });
}

// Run Component B initializations after content fully mounts
window.addEventListener('load', () => {
  initAmbientParticles();
  initFAQAccordion();
  initCaseStudyOverlays();
});

/* ==========================================================================
   COMPONENT C: CUSTOM DROPDOWNS, LIVE VALIDATIONS & SUCCESS MODAL LOGIC
   ========================================================================== */

// DOM Selectors
const contactForm = document.getElementById('contact-form');
const nameInput = document.getElementById('form-name');
const emailInput = document.getElementById('form-email');
const projectInput = document.getElementById('form-project'); // hidden input holding selected scope
const messageInput = document.getElementById('form-message');

const customSelect = document.getElementById('form-project-select');
const selectTrigger = customSelect.querySelector('.custom-select-trigger');
const selectedValueSpan = selectTrigger.querySelector('.selected-value');
const customOptions = customSelect.querySelectorAll('.custom-option');

const successModal = document.getElementById('success-modal');
const successCloseBtn = document.getElementById('success-close-btn');

// Regex Patterns
const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const messageRegex = /^(?!\s*$).{10,}$/;

// Programmatic helper to pre-populate custom select dropdown
function setProjectScope(value) {
  if (!customSelect || !selectedValueSpan || !projectInput || !customOptions) return;
  const option = Array.from(customOptions).find(opt => opt.getAttribute('data-value') === value);
  if (option) {
    customOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedValueSpan.textContent = option.textContent.toUpperCase();
    projectInput.value = value;
    customSelect.classList.add('has-value');
    validateField(projectInput, true);
    saveDraft();
  }
}


// --------------------------------------------------------------------------
// 1. CUSTOM SELECT DROPDOWN LOGIC
// --------------------------------------------------------------------------

function openSelect() {
  customSelect.classList.add('open');
  selectTrigger.setAttribute('aria-expanded', 'true');
  customSelect.closest('.form-group').classList.add('focus-active');
}

function closeSelect(restoreFocus = true) {
  customSelect.classList.remove('open');
  selectTrigger.setAttribute('aria-expanded', 'false');
  customSelect.closest('.form-group').classList.remove('focus-active');
  if (restoreFocus) {
    selectTrigger.focus();
  }
}

function toggleSelect() {
  if (customSelect.classList.contains('open')) {
    closeSelect();
  } else {
    openSelect();
  }
}

function selectOption(option) {
  const val = option.getAttribute('data-value');
  const txt = option.textContent;

  // Update active visual option styles
  customOptions.forEach(opt => {
    opt.classList.remove('selected');
    opt.setAttribute('aria-selected', 'false');
  });
  option.classList.add('selected');
  option.setAttribute('aria-selected', 'true');

  // Update values
  projectInput.value = val;
  selectedValueSpan.textContent = txt.toUpperCase();
  
  // Manage floating labels
  if (val) {
    customSelect.classList.add('has-value');
  } else {
    customSelect.classList.remove('has-value');
  }

  // Close options list and restore focus to trigger
  closeSelect(true);

  // Validate select dropdown immediately on selection
  validateField(projectInput, val !== "");

  // Caching draft save auto trigger
  saveDraft();
}

// Toggle select dropdown active open/close on click
selectTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSelect();
});

// Select Option click handler
customOptions.forEach(option => {
  option.addEventListener('click', (e) => {
    e.stopPropagation();
    selectOption(option);
  });
});

// Close custom select dropdown if clicking anywhere else in viewport
document.addEventListener('click', (e) => {
  if (customSelect.classList.contains('open') && !customSelect.contains(e.target)) {
    closeSelect(false);
  }
});

// Robust keyboard navigation triggers for select dropdown
customSelect.addEventListener('keydown', (e) => {
  const isOpen = customSelect.classList.contains('open');
  
  if (e.key === 'Escape') {
    if (isOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeSelect(true);
    }
    return;
  }

  const optionsArr = Array.from(customOptions);
  const activeEl = document.activeElement;
  
  if (e.key === 'Enter' || e.key === ' ') {
    if (activeEl === selectTrigger) {
      e.preventDefault();
      toggleSelect();
    } else if (optionsArr.includes(activeEl)) {
      e.preventDefault();
      selectOption(activeEl);
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!isOpen) {
      openSelect();
      optionsArr[0].focus();
    } else {
      if (activeEl === selectTrigger) {
        optionsArr[0].focus();
      } else {
        const index = optionsArr.indexOf(activeEl);
        const nextIndex = (index + 1) % optionsArr.length;
        optionsArr[nextIndex].focus();
      }
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (!isOpen) {
      openSelect();
      optionsArr[optionsArr.length - 1].focus();
    } else {
      if (activeEl === selectTrigger) {
        optionsArr[optionsArr.length - 1].focus();
      } else {
        const index = optionsArr.indexOf(activeEl);
        const prevIndex = (index - 1 + optionsArr.length) % optionsArr.length;
        optionsArr[prevIndex].focus();
      }
    }
  } else if (e.key === 'Tab') {
    if (isOpen) {
      closeSelect(false);
    }
  }
});

// Manage focus-active indicator class on custom-select parent form-group
const selectFormGroup = customSelect.closest('.form-group');
if (selectFormGroup) {
  selectFormGroup.addEventListener('focusin', () => {
    selectFormGroup.classList.add('focus-active');
  });

  selectFormGroup.addEventListener('focusout', (e) => {
    // If focus moves to something outside of this form group, close the drawer and validate
    if (!selectFormGroup.contains(e.relatedTarget)) {
      selectFormGroup.classList.remove('focus-active');
      if (customSelect.classList.contains('open')) {
        closeSelect(false);
      }
      runInputValidation(projectInput);
    }
  });
}

// --------------------------------------------------------------------------
// 2. LIVE INPUT VALIDATION PROCESSORS
// --------------------------------------------------------------------------

// Validates a singular element and updates DOM classes
function validateField(inputElement, isValid) {
  const formGroup = inputElement.closest('.form-group');
  if (isValid) {
    formGroup.classList.remove('invalid');
  } else {
    formGroup.classList.add('invalid');
  }
  return isValid;
}

// Check specific validation criteria depending on input ID
function runInputValidation(inputElement) {
  const val = inputElement.value.trim();
  let isValid = false;

  if (inputElement.id === 'form-name') {
    isValid = nameRegex.test(val);
  } else if (inputElement.id === 'form-email') {
    isValid = emailRegex.test(val);
  } else if (inputElement.id === 'form-message') {
    isValid = messageRegex.test(val);
  } else if (inputElement.id === 'form-project') {
    isValid = val !== "";
  }

  return validateField(inputElement, isValid);
}

// Setup input listeners for dynamic updates and focus halos
const textElements = [nameInput, emailInput, messageInput];

textElements.forEach(input => {
  // Focus Event
  input.addEventListener('focus', () => {
    input.closest('.form-group').classList.add('focus-active');
  });

  // Blur Event (triggers error state displays)
  input.addEventListener('blur', () => {
    input.closest('.form-group').classList.remove('focus-active');
    runInputValidation(input);
  });

  // Live Input Event (performs clean real-time feedback updates)
  input.addEventListener('input', () => {
    runInputValidation(input);
    saveDraft();
  });
});

// --------------------------------------------------------------------------
// 3. DRAFT AUTO-SAVE & RESTORE SYSTEM (LOCAL STORAGE)
// --------------------------------------------------------------------------

// Saves the entire form draft state JSON unified into LocalStorage
function saveDraft() {
  const draft = {
    name: nameInput.value,
    email: emailInput.value,
    project: projectInput.value,
    message: messageInput.value
  };
  localStorage.setItem('goateddd_contact_draft', JSON.stringify(draft));
}

// Restores form coordinates if existing draft found in LocalStorage
function restoreDraft() {
  const rawDraft = localStorage.getItem('goateddd_contact_draft');
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);
    
    if (draft.name) {
      nameInput.value = draft.name;
    }
    if (draft.email) {
      emailInput.value = draft.email;
    }
    if (draft.message) {
      messageInput.value = draft.message;
    }
    if (draft.project) {
      projectInput.value = draft.project;
      
      // Update custom select UI options mapping
      const option = Array.from(customOptions).find(opt => opt.getAttribute('data-value') === draft.project);
      if (option) {
        customOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedValueSpan.textContent = option.textContent.toUpperCase();
        customSelect.classList.add('has-value');
      }
    }
  } catch (err) {
    console.error("Failed to parse local draft content:", err);
  }
}

// Initialise restoration routine on load
restoreDraft();

// --------------------------------------------------------------------------
// 4. SUBMISSION HANDLER & GSAP SUCCESS OVERLAY ANIMATION
// --------------------------------------------------------------------------

// Setup Success entry animation timeline in GSAP
const successTimeline = gsap.timeline({ paused: true });

successTimeline.to(successModal, {
  autoAlpha: 1,
  duration: 0.5,
  ease: 'power3.inOut'
});

successTimeline.fromTo('.success-modal-bg', {
  scale: 1.05,
  backdropFilter: 'blur(0px)',
  webkitBackdropFilter: 'blur(0px)',
}, {
  scale: 1,
  backdropFilter: 'blur(40px)',
  webkitBackdropFilter: 'blur(40px)',
  duration: 0.6,
  ease: 'power3.out'
}, 0);

successTimeline.fromTo('.success-circle-glow', {
  scale: 0.7,
  opacity: 0
}, {
  scale: 1,
  opacity: 1,
  duration: 0.9,
  ease: 'back.out(1.4)'
}, 0.2);

successTimeline.fromTo('.success-circle', {
  strokeDashoffset: 251.2
}, {
  strokeDashoffset: 0,
  duration: 1.4,
  ease: 'power2.inOut'
}, 0.1);

successTimeline.fromTo('.success-check', {
  strokeDashoffset: 60
}, {
  strokeDashoffset: 0,
  duration: 0.85,
  ease: 'back.out(1.8)'
}, 0.7);

successTimeline.fromTo([
  '.success-title',
  '.success-desc',
  '.success-btn'
], {
  y: 25,
  opacity: 0
}, {
  y: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.1,
  ease: 'power3.out'
}, 0.6);

// Complete Form submit interception
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Trigger absolute check validation run on submit event
  const isNameValid = runInputValidation(nameInput);
  const isEmailValid = runInputValidation(emailInput);
  const isProjectValid = runInputValidation(projectInput);
  const isMessageValid = runInputValidation(messageInput);

  const formValid = isNameValid && isEmailValid && isProjectValid && isMessageValid;

  if (formValid) {
    // Clear auto-saved cache
    localStorage.removeItem('goateddd_contact_draft');

    // Close contact modal seamlessly
    closeContactModal();

    // Open Success Modal with premium orchestrated check animations
    successModal.classList.add('active');
    successTimeline.play(0); // Play from frame zero
    
    // Lock scrolling on viewport
    lenis.stop();
  } else {
    // Scroll or focus the first invalid element group
    const firstInvalid = contactForm.querySelector('.form-group.invalid');
    if (firstInvalid) {
      const input = firstInvalid.querySelector('input, textarea');
      if (input) input.focus();
    }
  }
});

// Close Success Modal button trigger handler
successCloseBtn.addEventListener('click', () => {
  // Clear and reset form fields
  contactForm.reset();
  
  // Clear custom dropdown select fields
  projectInput.value = "";
  selectedValueSpan.textContent = "SELECT PROJECT SCOPE";
  customSelect.classList.remove('has-value');
  customOptions.forEach(opt => opt.classList.remove('selected'));

  // Clear validation styling classes from groups
  document.querySelectorAll('.form-group').forEach(group => {
    group.classList.remove('invalid');
    group.classList.remove('focus-active');
  });

  // Hide success overlay modal
  successTimeline.reverse();
  successModal.classList.remove('active');

  // Reactivate scroll engine
  lenis.start();
});

// Wire up dynamic cursor hover alerts inside standard hover loops
const hoverSelectElements = document.querySelectorAll('.custom-select-trigger, .custom-option, #success-close-btn');
hoverSelectElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('link-hovered');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('link-hovered');
  });
});

// ==========================================================================
// 13. COMPONENT A ADDITIONAL PREMIUM INTERACTIVE MICRO-INTERACTIONS
// ==========================================================================

// 1. Magnetic Hover Pull on Menu and Footer Social Links
const magneticElements = document.querySelectorAll('.menu-btn, .footer-social');

magneticElements.forEach(elem => {
  elem.addEventListener('mousemove', (e) => {
    const rect = elem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Magnetic pull parameters
    const pullMaxX = elem.classList.contains('menu-btn') ? 14 : 8;
    const pullMaxY = elem.classList.contains('menu-btn') ? 14 : 8;
    
    const moveX = deltaX * 0.35;
    const moveY = deltaY * 0.35;
    
    const boundedX = Math.min(Math.max(moveX, -pullMaxX), pullMaxX);
    const boundedY = Math.min(Math.max(moveY, -pullMaxY), pullMaxY);
    
    gsap.to(elem, {
      x: boundedX,
      y: boundedY,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    // Snappy inner displacement for 3D parallax feel
    if (elem.classList.contains('menu-btn')) {
      const lines = elem.querySelectorAll('.btn-line');
      gsap.to(lines, {
        x: boundedX * 0.4,
        y: boundedY * 0.4,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(elem, {
        skewX: boundedX * 0.4,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
  
  elem.addEventListener('mouseleave', () => {
    gsap.to(elem, {
      x: 0,
      y: 0,
      skewX: 0,
      duration: 0.6,
      ease: 'elastic.out(1.1, 0.4)'
    });
    
    if (elem.classList.contains('menu-btn')) {
      const lines = elem.querySelectorAll('.btn-line');
      gsap.to(lines, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1.1, 0.4)'
      });
    }
  });
});

// 2. Click to Scroll to Top on floating SVG Scroll Progress Dial
const scrollDial = document.querySelector('.scroll-dial-container');
if (scrollDial) {
  scrollDial.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.5 });
  });
  
  scrollDial.addEventListener('mouseenter', () => {
    cursor.classList.add('link-hovered');
  });
  
  scrollDial.addEventListener('mouseleave', () => {
    cursor.classList.remove('link-hovered');
  });
}

// 3. Active Section Link Indicators using IntersectionObserver
const spySections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-link-item');

if (spySections.length > 0 && navLinkItems.length > 0) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkItems.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-nav');
          } else {
            link.classList.remove('active-nav');
          }
        });
      }
    });
  }, {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0
  });
  
  spySections.forEach(section => {
    sectionObserver.observe(section);
  });
}

// 4. Kinetic Horizontal Text Marquee Scroll Sync
const marqueeInner = document.querySelector('.marquee-inner');
if (marqueeInner) {
  // Infinite running tween
  const marqueeTween = gsap.to('.marquee-content', {
    xPercent: -100,
    repeat: -1,
    duration: 25,
    ease: 'none'
  });
  
  // ScrollTrigger to observe scrolling speed and skew text dynamically
  ScrollTrigger.create({
    trigger: '.marquee-track',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const velocity = self.getVelocity();
      const skew = velocity * 0.005;
      const scale = 1 + Math.abs(velocity * 0.0003);
      
      gsap.to('.marquee-content', {
        skewX: skew,
        scaleY: scale,
        overwrite: 'auto',
        duration: 0.4,
        ease: 'power2.out'
      });
      
      const speedMultiplier = 1 + Math.min(Math.abs(velocity * 0.002), 5); // limit max speed boost to 5x
      gsap.to(marqueeTween, {
        timeScale: speedMultiplier,
        overwrite: 'auto',
        duration: 0.4
      });
    }
  });
  
  // Smoothly reset timeScale and skew to normal when scrolling stops
  ScrollTrigger.addEventListener('scrollEnd', () => {
    gsap.to(marqueeTween, {
      timeScale: 1,
      duration: 0.8,
      ease: 'power2.out'
    });
    gsap.to('.marquee-content', {
      skewX: 0,
      scaleY: 1,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
}
