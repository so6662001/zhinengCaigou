import { GOLIVE, NODES } from '../content.js';

const PRODUCT_ORDER = ['sales', 'purchase', 'warehouse', 'pickup', 'cashier', 'boss'];

export function goliveHtml() {
  const phases = GOLIVE.phases
    .map(
      (ph, i) => `
      <section class="phase">
        <div class="phase-head"><span class="phase-no">${i + 1}</span><h3>${ph.name}</h3></div>
        <div class="phase-items">
          ${ph.items.map((it) => `<div class="phase-item"><b>${it.title}</b><p>${it.text}</p></div>`).join('')}
        </div>
      </section>`,
    )
    .join('');
  const perNode = PRODUCT_ORDER.map((id) => {
    const d = NODES[id];
    return `<div class="node-note" style="--c:${d.color}"><b>${d.name}</b><p>${d.golive}</p></div>`;
  }).join('');
  return `
    <div class="golive">
      <h2>${GOLIVE.title}</h2>
      <p class="modal-note">${GOLIVE.lead}</p>
      <div class="phases">${phases}</div>
      <h3 class="golive-sub">各岗位上线提醒</h3>
      <div class="node-notes">${perNode}</div>
    </div>`;
}
