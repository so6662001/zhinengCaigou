import { FLOW_TYPES, NODES, OLD_MODE, OVERVIEW, SUMMARY } from '../content.js';

const PRODUCT_ORDER = ['sales', 'purchase', 'warehouse', 'pickup', 'cashier', 'boss'];

function list(items) {
  return `<ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
}

function head(def, eyebrow, title = def.name, tagline = def.tagline) {
  return `
    <div class="p-head" style="--c:${def.color}">
      <span class="p-eyebrow">${eyebrow}</span>
      <h2>${title}</h2>
      <p class="p-tagline">${tagline}</p>
    </div>`;
}

function productPanel(def, mode) {
  const before = `
    <section class="card card-before">
      <h3>以前这样干</h3>
      ${list(def.before)}
    </section>`;
  const after = `
    <section class="card card-after">
      <h3>现在 AI 这样干</h3>
      ${list(def.after)}
    </section>`;
  const values = `
    <section class="card card-value">
      <h3>带来的价值</h3>
      <div class="values">
        ${def.values
          .map((v) => `<div class="value"><span class="tag">${v.tag}</span><span>${v.text}</span></div>`)
          .join('')}
      </div>
    </section>`;
  const caps = `
    <section class="p-caps">
      <h3>核心能力</h3>
      <div class="chips">${def.caps.map((c) => `<span class="chip">${c}</span>`).join('')}</div>
    </section>`;
  const golive = `
    <section class="p-golive">
      <h3>上线提醒</h3>
      <p>${def.golive}</p>
      <button type="button" class="link" data-action="golive">查看完整上线须知 ›</button>
    </section>`;
  // 传统模式先讲痛点;AI 模式先讲价值
  if (mode === 'old') {
    const switcher = `<button type="button" class="btn btn-accent btn-block" data-action="mode-ai">看看 ${def.name} 怎么解决</button>`;
    return head(def, '传统做法', `${def.oldName} · 没有系统时`, def.bubble.old) + before + switcher + after + values;
  }
  return head(def, 'AI 岗位') + values + after + before + caps + golive;
}

function externalPanel(def) {
  return `
    ${head(def, '外部角色')}
    <p class="p-lead">${def.intro}</p>
    <section class="card">
      <h3>和系统怎么打交道</h3>
      <div class="jump-list">
        ${def.touch
          .map(
            (t) => `
          <button type="button" class="jump" data-node="${t.to}" style="--c:${NODES[t.to].color}">
            <span class="dot"></span><span>${t.text}</span><i>›</i>
          </button>`,
          )
          .join('')}
      </div>
    </section>`;
}

function nodeJumpList(mode) {
  return `
    <div class="jump-list">
      ${PRODUCT_ORDER.map((id) => {
        const d = NODES[id];
        return `
        <button type="button" class="jump" data-node="${id}" style="--c:${d.color}">
          <span class="dot"></span>
          <span><b>${d.name}</b><em>${d.bubble[mode]}</em></span><i>›</i>
        </button>`;
      }).join('')}
    </div>`;
}

function overviewPanel(mode) {
  const legend = Object.values(FLOW_TYPES)
    .map((f) => `<div class="flow-row"><span class="swatch" style="--c:${f.color}"></span><b>${f.name}</b><span>${f.desc}</span></div>`)
    .join('');
  if (mode === 'old') {
    return `
      <div class="p-head" style="--c:#f87171">
        <span class="p-eyebrow">传统做法</span>
        <h2>每个环节都在漏钱</h2>
        <p class="p-tagline">${OLD_MODE.overviewLead}</p>
      </div>
      <section class="card card-before">
        <h3>六个岗位,六个痛点</h3>
        ${nodeJumpList('old')}
      </section>
      <button type="button" class="btn btn-accent btn-block" data-action="mode-ai">切换到 AI经营,看看变化</button>`;
  }
  return `
    <div class="p-head" style="--c:#22d3ee">
      <span class="p-eyebrow">全景</span>
      <h2>${OVERVIEW.title}</h2>
      <p class="p-tagline">${OVERVIEW.lead}</p>
    </div>
    <section class="card">
      <h3>图上在流动的是什么</h3>
      <div class="flow-legend">${legend}</div>
    </section>
    <section class="card">
      <h3>六个 AI 岗位</h3>
      ${nodeJumpList('ai')}
    </section>
    <section class="p-howto">
      <h3>怎么看</h3>
      ${list(OVERVIEW.howto)}
    </section>
    <button type="button" class="btn btn-accent btn-block" data-action="start">开始导览</button>`;
}

function summaryPanel() {
  return `
    <div class="p-head" style="--c:#4ade80">
      <span class="p-eyebrow">价值总结</span>
      <h2>${SUMMARY.title}</h2>
      <p class="p-tagline">${SUMMARY.lead}</p>
    </div>
    <div class="jump-list summary-list">
      ${SUMMARY.items
        .map(
          (it) => `
        <button type="button" class="jump" data-node="${it.node}" style="--c:${NODES[it.node].color}">
          <span class="dot"></span>
          <span><b>${it.title}</b><em>${it.text}</em></span>
          <small>${NODES[it.node].name}</small>
        </button>`,
        )
        .join('')}
    </div>
    <button type="button" class="btn btn-accent btn-block" data-action="calc">算算你家的账</button>
    <button type="button" class="btn btn-block" data-action="golive">上线要注意什么</button>`;
}

// view: { kind: 'overview' | 'summary' | 'node', nodeId? }
export function renderPanel(view, mode) {
  if (view.kind === 'summary') return summaryPanel();
  if (view.kind === 'node') {
    const def = NODES[view.nodeId];
    return def.kind === 'product' ? productPanel(def, mode) : externalPanel(def);
  }
  return overviewPanel(mode);
}

export function panelTitle(view) {
  if (view.kind === 'summary') return SUMMARY.title;
  if (view.kind === 'node') return NODES[view.nodeId].name;
  return OVERVIEW.title;
}
