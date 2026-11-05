// One script for all three creatives. The timing is shared, so they move as one fireplace.
import { gsap } from 'gsap';

const clickTag = window.clickTag || 'https://example.com/landing';
const START_FALLBACK = 1500; // ms. Without a preview page to start it, a part starts by itself.
const IDLE_END = 30; // Seconds after the start when all looping stops.

const part = document.querySelector('.part');
const q = gsap.utils.selector(part);
const isSide = part.dataset.part !== 'top';
const debug = new URLSearchParams(location.search).get('debug') === '1';

document.querySelector('.clickout').href = clickTag;

function buildIntro() {
  const timeline = gsap.timeline({ paused: true });

  // Same in every part, so the surface lights up as one.
  timeline
    .fromTo(q('.bg-group'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power1.in' }, 0)
    .fromTo(q('.shade'), { opacity: 0.55 }, { opacity: 0, duration: 1.3, ease: 'sine.inOut' }, 1.5);

  if (!isSide) {
    timeline.from(q('.line'), { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.4 }, 1);
    return timeline;
  }

  // Ends at scale 1, where the layout matches the design and the seams line up exactly.
  timeline
    .fromTo(q('.bg-group'), { scale: 1.03 }, { scale: 1, duration: 4.6, ease: 'power2.out' }, 0)
    .from(q('.logo'), { scale: 0.82, autoAlpha: 0, transformOrigin: '160px 125px', duration: 0.8, ease: 'back.out(1.7)' }, 0.5)
    // Fast, because the copy and the baked-in pack would read as a double image during a slow fade.
    .fromTo(q('.pack'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: 'none' }, 1.35)
    .from(q('.pack'), { scale: 1.12, y: 16, duration: 1.3, ease: 'power3.out' }, 1.35)
    .set(q('.sheen-clip'), { autoAlpha: 1 }, 2.6)
    .fromTo(q('.sheen'), { x: -170 }, { x: 330, duration: 0.9, ease: 'sine.inOut' }, 2.6)
    .set(q('.sheen-clip'), { autoAlpha: 0 }, 3.5)
    .from(q('.panel'), { y: 22, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 2.4)
    .from(q('.copy'), { y: 12, opacity: 0, duration: 0.6, ease: 'power2.out' }, 2.9)
    .from(q('.cta'), { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.2)' }, 3.6)
    .set(q('.pack'), { display: 'none' }); // Identical to the background from here on.

  timeline.eventCallback('onComplete', () => startIdle(timeline.duration()));
  return timeline;
}

// Calm and short-lived: slow breathing and a CTA pulse, both ending on the resting state.
function startIdle(elapsed) {
  const remaining = IDLE_END - elapsed;
  const zoomLegs = 4;
  gsap.to(q('.bg-group'), {
    scale: 1.015,
    duration: remaining / zoomLegs,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: zoomLegs - 1,
    onComplete: () => gsap.set(q('.bg-group'), { willChange: 'auto' }),
  });
  const pulseEvery = 3.5;
  gsap
    .timeline({ repeat: Math.floor(remaining / pulseEvery) - 1, repeatDelay: pulseEvery - 0.8 })
    .to(q('.cta'), { scale: 1.05, duration: 0.4, ease: 'sine.inOut' })
    .to(q('.cta'), { scale: 1, duration: 0.4, ease: 'sine.inOut' });
}

let started = false;
let intro = null;

function start() {
  if (started) return;
  started = true;
  if (debug) window.__part = { intro, startedAt: performance.timeOrigin + performance.now() };
  intro?.play();
}

await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));

// Reduced motion: the final state straight away, with no timeline at all.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  intro = buildIntro();
} else {
  gsap.set(q('.pack, .sheen-clip'), { display: 'none' });
}
part.classList.add('is-ready');

if (window.parent === window) {
  start();
} else {
  window.addEventListener('message', (event) => {
    if (event.source === window.parent && event.data?.type === 'fireplace:start') start();
  });
  window.parent.postMessage({ type: 'fireplace:ready', part: part.dataset.part }, '*');
  setTimeout(start, START_FALLBACK);
}
