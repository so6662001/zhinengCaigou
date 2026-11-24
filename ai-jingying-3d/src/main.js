import { BRAND, FLOW_TYPES, NODES, OLD_MODE, STEPS } from './content.js';
import { createWorld } from './scene/world.js';
import { calculatorHtml, mountCalculator } from './ui/calculator.js';
import { goliveHtml } from './ui/golive.js';
import { panelTitle, renderPanel } from './ui/panel.js';

const STEP_SECONDS = 9;
const $ = (sel) => document.querySelector(sel);
const params = new URLSearchParams(location.search);
const narrow = window.matchMedia('(max-width: 860px)');

const app = $('#app');
const panel = $('#panel');
const panelBody = $('#panel-body');
const panelToggle = $('#panel-toggle');
const caption = $('#caption');
const stepsEl = $('#steps');
const progressBar = $('#tour-progress-bar');
const playBtn = $('#tour-play');
const modal = $('#modal');
const modalBody = $('#modal-body');

$('#brand-title').textContent = BRAND.title;
$('#brand-sub').textContent = BRAND.subtitle;

let world;
try {
  world = createWorld($('#stage'));
} catch (err) {
  console.error(err);
  $('#fallback').hidden = false;
}

const state = {
  mode: params.get('mode') === 'old' ? 'old' : 'ai',
  stepIndex: 0,
  view: { kind: 'overview' },
  playing: false,
  playElapsed: 0,
  panelOpen: !narrow.matches,
};

// ---------- 步骤条 ----------
stepsEl.innerHTML = STEPS.map(
  (s, i) => `
  <button type="button" class="step" role="tab" data-step="${i}" style="--c:${s.focus ? NODES[s.focus].color : '#22d3ee'}">
    <span class="step-no">${i === 0 ? '◎' : i === STEPS.length - 1 ? '★' : i}</span>
    <span class="step-label">${s.label}</span>
  </button>`,
).join('');

// ---------- 图例(流动开关) ----------
$('#legend').innerHTML = Object.entries(FLOW_TYPES)
  .map(
    ([id, f]) => `
  <button type="button" class="legend-item on" data-flow="${id}" aria-pressed="true" style="--c:${f.color}" title="${f.desc}">
    <span class="swatch"></span>${f.name}
  </button>`,
  )
  .join('');
$('#legend').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-flow]');
  if (!btn || !world) return;
  const on = !btn.classList.contains('on');
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', String(on));
  world.flows.setTypeVisible(btn.dataset.flow, on);
});

function flowsForNode(id) {
  const ids = ['customer-sales', 'sales-purchase', 'purchase-supplier', 'supplier-warehouse', 'warehouse-pickup', 'pickup-customer', 'customer-cashier', 'cashier-supplier'];
  return ids.filter((s) => s.split('-').includes(id));
}

function captionText() {
  const { view, mode } = state;
  if (view.kind === 'node') {
    const def = NODES[view.nodeId];
    if (def.kind === 'external') return `${def.name}:${def.tagline}。`;
    if (mode === 'old') return `传统做法 · ${def.oldName}这一环:${def.bubble.old}。`;
  } else if (mode === 'old') {
    return OLD_MODE.caption;
  }
  return STEPS[state.stepIndex].caption;
}

function updateInsets() {
  if (!world) return;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const tour = $('.tourbar').offsetHeight + rem;
  const top = $('.topbar').offsetHeight - rem;
  if (narrow.matches) {
    const sheet = state.panelOpen ? window.innerHeight * 0.52 : 2.7 * rem + $('#legend').offsetHeight + 0.6 * rem;
    world.setInsets({ left: 0, right: 0, top, bottom: tour + sheet + 0.4 * rem });
  } else {
    const legendBottom = $('#legend').getBoundingClientRect().bottom;
    world.setInsets({
      left: 0,
      right: state.panelOpen ? panel.offsetWidth + rem : 0,
      top: Math.max(top, legendBottom),
      bottom: tour,
    });
  }
}

function renderUi() {
  app.dataset.mode = state.mode;
  document.querySelectorAll('.mode-switch button').forEach((b) => b.classList.toggle('on', b.dataset.mode === state.mode));
  panelBody.innerHTML = renderPanel(state.view, state.mode);
  panelBody.scrollTop = 0;
  panel.classList.toggle('open', state.panelOpen);
  app.classList.toggle('panel-open', state.panelOpen);
  panelToggle.textContent = narrow.matches
    ? `${panelTitle(state.view)} · ${state.panelOpen ? '收起' : '点开看详情'}`
    : state.panelOpen
      ? '›'
      : '‹';
  caption.textContent = captionText();
  const activeStep = state.view.kind === 'node' && NODES[state.view.nodeId].kind === 'external' ? -1 : state.stepIndex;
  stepsEl.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('on', i === activeStep);
    el.classList.toggle('done', activeStep >= 0 && i < activeStep);
    el.setAttribute('aria-selected', String(i === activeStep));
    if (i === activeStep) el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  playBtn.classList.toggle('playing', state.playing);
  playBtn.querySelector('.play-text').textContent = state.playing ? '暂停' : '自动导览';
  updateInsets();
}

function goStep(index, { instant = false } = {}) {
  const n = STEPS.length;
  state.stepIndex = ((index % n) + n) % n;
  state.playElapsed = 0;
  const step = STEPS[state.stepIndex];
  state.view = step.focus ? { kind: 'node', nodeId: step.focus } : { kind: step.id === 'summary' ? 'summary' : 'overview' };
  if (world) {
    world.flows.setHighlight(step.flows);
    if (step.focus) world.focusNode(step.focus);
    else world.showOverview(instant);
  }
  renderUi();
}

function showNode(id) {
  const stepIndex = STEPS.findIndex((s) => s.focus === id);
  if (stepIndex >= 0) {
    goStep(stepIndex);
    return;
  }
  state.view = { kind: 'node', nodeId: id };
  state.playElapsed = 0;
  if (world) {
    world.flows.setHighlight(flowsForNode(id));
    world.focusNode(id);
  }
  renderUi();
}

function setPlaying(playing) {
  state.playing = playing;
  state.playElapsed = 0;
  renderUi();
}

function setMode(mode) {
  state.mode = mode;
  if (world) world.setMode(mode);
  renderUi();
}

function setPanelOpen(open) {
  state.panelOpen = open;
  renderUi();
}

function openModal(kind) {
  setPlaying(false);
  modalBody.innerHTML = kind === 'calc' ? calculatorHtml() : goliveHtml();
  if (kind === 'calc') mountCalculator(modalBody);
  modal.dataset.kind = kind;
  modal.hidden = false;
  modalBody.scrollTop = 0;
}

function closeModal() {
  modal.hidden = true;
  modalBody.innerHTML = '';
}

// ---------- 事件 ----------
stepsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-step]');
  if (btn) goStep(Number(btn.dataset.step));
});
$('#tour-prev').addEventListener('click', () => goStep(state.stepIndex - 1));
$('#tour-next').addEventListener('click', () => goStep(state.stepIndex + 1));
playBtn.addEventListener('click', () => {
  if (!state.playing && state.stepIndex === STEPS.length - 1) goStep(0);
  setPlaying(!state.playing);
});
document.querySelector('.mode-switch').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode]');
  if (btn) setMode(btn.dataset.mode);
});
$('#btn-calc').addEventListener('click', () => openModal('calc'));
$('#btn-golive').addEventListener('click', () => openModal('golive'));
panelToggle.addEventListener('click', () => setPanelOpen(!state.panelOpen));
modal.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeModal();
});

panelBody.addEventListener('click', (e) => {
  const jump = e.target.closest('[data-node]');
  if (jump) {
    showNode(jump.dataset.node);
    return;
  }
  const action = e.target.closest('[data-action]');
  if (!action) return;
  const name = action.dataset.action;
  if (name === 'start') {
    goStep(1);
    setPlaying(true);
  } else if (name === 'calc' || name === 'golive') {
    openModal(name);
  } else if (name === 'mode-ai') {
    setMode('ai');
  }
});

window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if (!modal.hidden) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'PageDown') goStep(state.stepIndex + 1);
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goStep(state.stepIndex - 1);
  else if (e.key === ' ') {
    e.preventDefault();
    setPlaying(!state.playing);
  } else if (e.key === 'Escape') goStep(0);
});

narrow.addEventListener('change', () => setPanelOpen(!narrow.matches));
new ResizeObserver(([entry]) => {
  app.style.setProperty('--tour-h', `${entry.target.offsetHeight}px`);
  updateInsets();
}).observe(document.querySelector('.tourbar'));
window.addEventListener('resize', () => {
  updateInsets();
  if (world) world.refit();
});

const hint = $('#hint');
const hideHint = () => hint.classList.add('gone');
window.addEventListener('pointerdown', hideHint, { once: true });
setTimeout(hideHint, 9000);

if (world) {
  world.onPick((id) => {
    if (state.playing) setPlaying(false);
    if (narrow.matches) state.panelOpen = true;
    showNode(id);
  });
  world.setMode(state.mode);
}

// ---------- 自动导览计时 ----------
let last = performance.now();
function tick(now) {
  const dt = Math.min(0.5, (now - last) / 1000);
  last = now;
  if (state.playing && modal.hidden) {
    state.playElapsed += dt;
    if (state.playElapsed >= STEP_SECONDS) {
      const atEnd = state.stepIndex === STEPS.length - 1;
      if (atEnd && !params.has('loop')) setPlaying(false);
      else goStep(state.stepIndex + 1);
    }
  }
  progressBar.style.transform = `scaleX(${state.playing ? Math.min(1, state.playElapsed / STEP_SECONDS) : 0})`;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const startStep = STEPS.findIndex((s) => s.id === params.get('step'));
goStep(startStep >= 0 ? startStep : 0, { instant: true });
if (params.has('autoplay')) setPlaying(true);
