/* 钢采智配 · 公共交互脚本(高保真原型) */
(function () {
  const NAV = [
    { group: '工作台' },
    { href: 'index.html', ico: '◈', text: '采购驾驭舱' },
    { href: 'allocation.html', ico: '⇶', text: '智能配货', cnt: '12' },
    { href: 'compare.html', ico: '⚖', text: '智能比价', cnt: '5' },
    { href: 'orders.html', ico: '▤', text: '采购执行跟踪' },
    { group: '数据资产' },
    { href: 'market.html', ico: '⟁', text: '行情与钢厂调价' },
    { href: 'suppliers.html', ico: '◎', text: '供应商画像' },
    { href: '#', ico: '▦', text: '资源库存(自有+在途)' },
    { href: '#', ico: '⌁', text: '销售需求池' },
    { group: '系统' },
    { href: '#', ico: '⚙', text: '配货规则 / 权重' },
    { href: '#', ico: '⛨', text: '风控与审批流' },
    { href: '#', ico: '⇄', text: '接口(ERP / 钢厂 / 物流)' },
  ];

  function renderSidebar() {
    const el = document.querySelector('.sidebar');
    if (!el) return;
    const cur = location.pathname.split('/').pop() || 'index.html';
    let h = `<div class="brand"><div class="logo">钢</div><div><div class="name">钢采智配</div><div class="sub">SteelBuy · 自动配货 & 比价</div></div></div><nav class="nav">`;
    NAV.forEach(n => {
      if (n.group) { h += `<div class="group">${n.group}</div>`; return; }
      const act = n.href === cur ? 'active' : '';
      h += `<a class="${act}" href="${n.href}"><span class="ico">${n.ico}</span>${n.text}${n.cnt ? `<span class="cnt">${n.cnt}</span>` : ''}</a>`;
    });
    h += `</nav><div class="side-foot"><div class="u"><div class="av">陈</div><div><div>陈建国</div><div class="role">采购总监 · 华东大区</div></div></div></div>`;
    el.innerHTML = h;
  }

  function renderTopbar() {
    const el = document.querySelector('.topbar');
    if (!el) return;
    const crumb = el.getAttribute('data-crumb') || '';
    el.innerHTML = `
      <div class="crumb">钢采智配 / <b>${crumb}</b></div>
      <div class="search">⌕ 搜索品名、规格、钢厂、供应商、合同号… <kbd>⌘K</kbd></div>
      <div class="right">
        <div class="ticker">
          <span>rb2601 <b class="num up">3,412</b> <span class="up">▲18</span></span>
          <span>hc2601 <b class="num up">3,563</b> <span class="up">▲22</span></span>
          <span>上海螺纹 <b class="num">3,450</b> <span class="muted">—</span></span>
          <span>沙钢下旬 <b class="up">+30</b></span>
        </div>
        <span class="tag green"><i class="dot g pulse"></i> 行情实时 09:42</span>
        <button class="btn sm ghost">🔔 <span class="tag red" style="margin-left:2px">7</span></button>
      </div>`;
  }

  // 迷你折线图
  window.spark = function (points, opt) {
    opt = Object.assign({ w: 90, h: 30, color: '#1f5eff', fill: true }, opt || {});
    const max = Math.max(...points), min = Math.min(...points), rng = (max - min) || 1;
    const step = opt.w / (points.length - 1);
    const pts = points.map((p, i) => [i * step, opt.h - ((p - min) / rng) * (opt.h - 4) - 2]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = opt.fill ? `<path d="${d} L${opt.w} ${opt.h} L0 ${opt.h} Z" fill="${opt.color}" opacity=".12"/>` : '';
    return `<svg width="${opt.w}" height="${opt.h}" viewBox="0 0 ${opt.w} ${opt.h}">${area}<path d="${d}" fill="none" stroke="${opt.color}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  };

  // 大折线图(简单)
  window.lineChart = function (series, opt) {
    opt = Object.assign({ w: 760, h: 220, pad: 32, labels: [] }, opt || {});
    const all = series.flatMap(s => s.data);
    const max = Math.max(...all), min = Math.min(...all), rng = (max - min) || 1;
    const innerW = opt.w - opt.pad * 2, innerH = opt.h - opt.pad * 1.5;
    const n = series[0].data.length; const step = innerW / (n - 1);
    const y = v => opt.pad / 2 + innerH - ((v - min) / rng) * innerH;
    let h = `<svg width="100%" viewBox="0 0 ${opt.w} ${opt.h}" style="font-family:var(--mono);font-size:10px">`;
    for (let i = 0; i <= 4; i++) {
      const v = min + (rng * i) / 4, yy = y(v);
      h += `<line x1="${opt.pad}" x2="${opt.w - opt.pad / 2}" y1="${yy}" y2="${yy}" stroke="#eef1f5"/><text x="${opt.pad - 6}" y="${yy + 3}" text-anchor="end" fill="#8a97a8">${Math.round(v)}</text>`;
    }
    series.forEach(s => {
      const pts = s.data.map((v, i) => [opt.pad + i * step, y(v)]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      if (s.dash) h += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
      else h += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2"/>`;
      if (s.marker) { const p = pts[pts.length - 1]; h += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${s.color}"/>`; }
    });
    opt.labels.forEach((l, i) => { if (i % Math.ceil(n / 8) === 0 || i === n - 1) h += `<text x="${opt.pad + i * step}" y="${opt.h - 4}" text-anchor="middle" fill="#8a97a8">${l}</text>`; });
    h += '</svg>';
    return h;
  };

  // 环形图
  window.donut = function (parts, opt) {
    opt = Object.assign({ size: 120, stroke: 16 }, opt || {});
    const r = (opt.size - opt.stroke) / 2, c = 2 * Math.PI * r; let off = 0;
    const total = parts.reduce((a, p) => a + p.v, 0);
    let h = `<svg width="${opt.size}" height="${opt.size}" viewBox="0 0 ${opt.size} ${opt.size}">`;
    parts.forEach(p => {
      const len = (p.v / total) * c;
      h += `<circle r="${r}" cx="${opt.size / 2}" cy="${opt.size / 2}" fill="none" stroke="${p.color}" stroke-width="${opt.stroke}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${opt.size / 2} ${opt.size / 2})"/>`;
      off += len;
    });
    if (opt.center) h += `<text x="50%" y="50%" text-anchor="middle" dy="2" font-size="15" font-weight="700" fill="#1a2433">${opt.center}</text>`;
    if (opt.sub) h += `<text x="50%" y="50%" text-anchor="middle" dy="17" font-size="10" fill="#8a97a8">${opt.sub}</text>`;
    return h + '</svg>';
  };

  // 雷达图
  window.radar = function (axes, series, opt) {
    opt = Object.assign({ size: 200 }, opt || {});
    const cx = opt.size / 2, cy = opt.size / 2, R = opt.size / 2 - 26, n = axes.length;
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    let h = `<svg width="${opt.size}" height="${opt.size}" viewBox="0 0 ${opt.size} ${opt.size}" style="font-size:10px">`;
    [0.25, 0.5, 0.75, 1].forEach(l => { h += `<polygon points="${axes.map((_, i) => pt(i, l).join(',')).join(' ')}" fill="none" stroke="#e4e8ee"/>`; });
    axes.forEach((a, i) => { const p = pt(i, 1); const t = pt(i, 1.18); h += `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#e4e8ee"/><text x="${t[0]}" y="${t[1] + 3}" text-anchor="middle" fill="#55657a">${a}</text>`; });
    series.forEach(s => { h += `<polygon points="${s.data.map((v, i) => pt(i, v).join(',')).join(' ')}" fill="${s.color}" fill-opacity=".18" stroke="${s.color}" stroke-width="1.8"/>`; });
    return h + '</svg>';
  };

  window.toast = function (msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
  };

  function bindInteractions() {
    document.addEventListener('click', e => {
      const sw = e.target.closest('.switch'); if (sw) sw.classList.toggle('on');
      const chip = e.target.closest('.chip'); if (chip && !chip.hasAttribute('data-static')) chip.classList.toggle('on');
      const tab = e.target.closest('.tabs a, .seg a');
      if (tab) { e.preventDefault(); tab.parentElement.querySelectorAll('a').forEach(a => a.classList.remove('on')); tab.classList.add('on'); }
      const plan = e.target.closest('.plan[data-plan]');
      if (plan) { document.querySelectorAll('.plan[data-plan]').forEach(p => p.classList.remove('rec')); plan.classList.add('rec'); if (window.onPlanSelect) window.onPlanSelect(plan.dataset.plan); }
      const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); toast(t.dataset.toast); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => { renderSidebar(); renderTopbar(); bindInteractions(); });
})();
