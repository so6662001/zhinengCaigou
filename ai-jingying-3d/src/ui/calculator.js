import { CALCULATOR, NODES } from '../content.js';

function field(f, group) {
  return `
    <label class="calc-field">
      <span class="calc-label">${f.label}${f.hint ? `<em>${f.hint}</em>` : ''}</span>
      <span class="calc-inputs">
        <input type="range" data-id="${f.id}" data-group="${group}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.value}" />
        <input type="number" data-id="${f.id}" data-group="${group}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.value}" inputmode="decimal" />
        <i>${f.unit}</i>
      </span>
    </label>`;
}

export function calculatorHtml() {
  return `
    <div class="calc">
      <h2>${CALCULATOR.title}</h2>
      <p class="modal-note">${CALCULATOR.note}</p>
      <div class="calc-grid">
        <div class="calc-form">
          <h3>贵司的基本情况</h3>
          ${CALCULATOR.inputs.map((f) => field(f, 'input')).join('')}
          <h3>测算假设 <small>可调</small></h3>
          ${CALCULATOR.assumptions.map((f) => field(f, 'assume')).join('')}
        </div>
        <div class="calc-result" id="calc-result"></div>
      </div>
    </div>`;
}

function wan(v) {
  if (v >= 100) return Math.round(v).toLocaleString('zh-CN');
  return (Math.round(v * 10) / 10).toLocaleString('zh-CN');
}

// 金额单位:万元/年
export function compute(v) {
  const yearTons = v.tons * 12;
  const released = (v.stock * v.stockCut) / 100;
  const rows = [
    { node: 'purchase', title: '采购买得省', value: (yearTons * v.buySave) / 10000, formula: `${v.tons}吨×12月×${v.buySave}元` },
    {
      node: 'sales',
      title: '报价快多成交',
      value: (yearTons * (v.moreDeal / 100) * v.margin) / 10000,
      formula: `年销量×${v.moreDeal}%×吨毛利${v.margin}元`,
    },
    {
      node: 'warehouse',
      title: '库存少压省利息',
      value: (released * v.rate) / 100,
      formula: `释放${wan(released)}万×年化${v.rate}%`,
    },
    { node: 'cashier', title: '录单对账省人工', value: v.laborSave, formula: '按假设直接计入' },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0);
  return { rows, total, released };
}

function resultHtml(result) {
  const max = Math.max(...result.rows.map((r) => r.value), 0.0001);
  return `
    <div class="calc-total">
      <span>按以上假设,一年大约多赚 / 少亏</span>
      <strong>${wan(result.total)}<small>万元</small></strong>
    </div>
    <div class="calc-cash">
      <span>另外,库存下降可释放现金</span>
      <strong>${wan(result.released)}<small>万元</small></strong>
    </div>
    <div class="calc-rows">
      ${result.rows
        .map(
          (r) => `
        <div class="calc-row" style="--c:${NODES[r.node].color}">
          <div class="calc-row-head"><b>${r.title}</b><span>${wan(r.value)} 万元/年</span></div>
          <div class="calc-bar"><div style="width:${Math.max(2, (r.value / max) * 100)}%"></div></div>
          <small>${NODES[r.node].name} · ${r.formula}</small>
        </div>`,
        )
        .join('')}
    </div>
    <p class="calc-foot">数字由你填写的情况和假设算出,仅供估算。</p>`;
}

export function mountCalculator(root) {
  const values = {};
  [...CALCULATOR.inputs, ...CALCULATOR.assumptions].forEach((f) => {
    values[f.id] = f.value;
  });
  const out = root.querySelector('#calc-result');
  const refresh = () => {
    out.innerHTML = resultHtml(compute(values));
  };
  root.querySelectorAll('input[data-id]').forEach((input) => {
    input.addEventListener('input', () => {
      const min = Number(input.min);
      const max = Number(input.max);
      const raw = Number(input.value);
      if (!Number.isFinite(raw) || input.value === '') return;
      const v = Math.min(max, Math.max(min, raw));
      values[input.dataset.id] = v;
      root.querySelectorAll(`input[data-id="${input.dataset.id}"]`).forEach((other) => {
        if (other !== input) other.value = v;
      });
      refresh();
    });
    input.addEventListener('change', () => {
      input.value = values[input.dataset.id];
    });
  });
  refresh();
}
