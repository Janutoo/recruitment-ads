// Timed visuals: the start screen intro, the crash and the endcards.
import { gsap } from 'gsap';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Values the canvas reads every frame. These are the resting positions from the design.
export const fx = { headline: 1, headlineY: 0, obstacles: 1, playerOffsetX: 0, playerOffsetY: 0, gesture: 1, gestureScale: 1 };
const REST = { ...fx };

let active = [];

function track(animation) {
  active.push(animation);
  return animation;
}

// The single cleanup point: nothing animated survives a replay or a tap.
export function stopAnimations() {
  active.forEach((animation) => animation.kill());
  active = [];
  Object.assign(fx, REST);
}

export function later(seconds, callback) {
  return track(gsap.delayedCall(seconds, callback));
}

function pulseGesture() {
  if (reducedMotion()) return;
  track(gsap.to(fx, { gestureScale: 1.07, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
}

export function playIntro() {
  if (reducedMotion()) return;
  Object.assign(fx, { headline: 0, headlineY: 14, obstacles: 0, playerOffsetY: -46, gesture: 0, gestureScale: 0.7 });
  track(
    gsap
      .timeline({ onComplete: pulseGesture })
      .to(fx, { headline: 1, headlineY: 0, duration: 0.55, ease: 'power3.out' }, 0.05)
      .to(fx, { playerOffsetY: 0, duration: 0.8, ease: 'bounce.out' }, 0.2)
      .to(fx, { obstacles: 1, duration: 0.5, ease: 'power2.out' }, 0.45)
      .to(fx, { gesture: 1, gestureScale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.8),
  );
}

export function playRestart() {
  pulseGesture();
}

export function playCrash() {
  if (reducedMotion()) return;
  track(
    gsap
      .timeline()
      .to(fx, { playerOffsetX: -5, duration: 0.05, ease: 'none' })
      .to(fx, { playerOffsetX: 5, duration: 0.09, ease: 'none', yoyo: true, repeat: 3 })
      .to(fx, { playerOffsetX: 0, duration: 0.1, ease: 'power2.out' }),
  );
}

function show(card) {
  gsap.set(card, { autoAlpha: 1 });
  card.setAttribute('aria-hidden', 'false');
}

export function showEndcard(kind) {
  const card = document.getElementById(`endcard-${kind}`);
  const q = gsap.utils.selector(card);
  show(card);
  if (reducedMotion()) return;

  const timeline = gsap
    .timeline()
    .from(card, { autoAlpha: 0, duration: 0.3, ease: 'power1.out' })
    .from(q('.bubble'), { scale: 0.7, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.5)' }, 0.1)
    .from(q('.headline'), { y: 22, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, 0.75)
    .from(q('.cta'), { x: -26, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.8)' }, 1.05);

  if (kind === 'fail') {
    timeline
      .from(q('.poo'), { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)' }, 0.25)
      .from(q('.bacterium'), { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.07 }, 0.4)
      .from(q('.replay'), { x: -26, autoAlpha: 0, duration: 0.5, ease: 'back.out(1.8)' }, 1.2);
    track(
      gsap.to(q('.bacterium'), {
        y: '+=4',
        duration: 1.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 11,
        stagger: { each: 0.18 },
        delay: 1.5,
      }),
    );
  } else {
    timeline
      .from(q('.confetti'), { scale: 0.25, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.2)
      .from(q('.poo'), { y: 70, autoAlpha: 0, duration: 0.9, ease: 'bounce.out' }, 0.3);
    track(gsap.to(q('.poo'), { y: -9, duration: 0.32, ease: 'sine.out', yoyo: true, repeat: 7, delay: 1.5 }));
    track(gsap.to(q('.cta'), { scale: 1.04, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 7, delay: 1.9 }));
  }
  track(timeline);
}

export function hideEndcards() {
  for (const card of document.querySelectorAll('.endcard')) {
    gsap.set(card, { autoAlpha: 0 });
    gsap.set(card.querySelectorAll('*'), { clearProps: 'all' });
    card.setAttribute('aria-hidden', 'true');
  }
}
