// Review page only, never delivered. Starts the three parts together.
const frames = [...document.querySelectorAll('iframe')];
const ready = new Set();

window.addEventListener('message', (event) => {
  if (event.data?.type !== 'fireplace:ready') return;
  if (!frames.some((frame) => frame.contentWindow === event.source)) return;
  ready.add(event.data.part);
  if (ready.size === frames.length) {
    for (const frame of frames) frame.contentWindow.postMessage({ type: 'fireplace:start' }, '*');
  }
});

// Set after the listener exists, so no "ready" can be missed.
for (const frame of frames) frame.src = frame.dataset.src + location.search;

const stage = document.querySelector('.stage');
function fit() {
  stage.style.transform = `scale(${Math.min(1, document.documentElement.clientWidth / 1680)})`;
}
fit();
window.addEventListener('resize', fit);

// ?overlay=1 lays the design over the build at 50%, to check alignment.
if (new URLSearchParams(location.search).get('overlay') === '1') {
  const overlay = new Image();
  overlay.className = 'overlay';
  overlay.src = new URL('../design/layout.png', import.meta.url).href;
  stage.append(overlay);
}
