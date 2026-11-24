import * as THREE from 'three';

const FONT = '"PingFang SC","Microsoft YaHei","Noto Sans SC","WenQuanYi Micro Hei",sans-serif';

function canvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function frame(ctx, w, h, title, accent) {
  ctx.fillStyle = '#0b1730';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#e8f1ff';
  ctx.font = `700 40px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 28, 56);
}

function chip(ctx, x, y, text, color) {
  ctx.font = `700 28px ${FONT}`;
  const tw = ctx.measureText(text).width + 32;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, tw, 46, 23);
  ctx.fill();
  ctx.fillStyle = '#06101f';
  ctx.fillText(text, x + 16, y + 24);
  return tw;
}

export function quoteScreen() {
  return canvas(512, 320, (ctx, w, h) => {
    frame(ctx, w, h, '销售报价单', '#3b82f6');
    const rows = ['焊管 DN100', 'H型钢 200×200', '中板 10mm', '方管 50×50'];
    rows.forEach((r, i) => {
      const y = 112 + i * 44;
      ctx.fillStyle = '#9fb3d1';
      ctx.font = `500 26px ${FONT}`;
      ctx.fillText(r, 28, y);
      ctx.fillStyle = '#1e3a6b';
      ctx.fillRect(250, y - 12, 230, 24);
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(250, y - 12, 120 + ((i * 37) % 90), 24);
    });
    chip(ctx, 28, 266, '秒报价', '#7dd3fc');
    chip(ctx, 170, 266, '秒挂价', '#fde047');
  });
}

export function compareScreen() {
  return canvas(512, 320, (ctx, w, h) => {
    frame(ctx, w, h, '10维成本比价', '#8b5cf6');
    const cols = [
      { name: '供应商A', parts: [120, 30, 24] },
      { name: '供应商B', parts: [104, 22, 12] },
      { name: '供应商C', parts: [112, 44, 30] },
    ];
    const colors = ['#8b5cf6', '#38bdf8', '#f59e0b'];
    cols.forEach((c, i) => {
      const x = 56 + i * 150;
      let y = 262;
      c.parts.forEach((p, k) => {
        y -= p;
        ctx.fillStyle = colors[k];
        ctx.fillRect(x, y, 84, p - 3);
      });
      ctx.fillStyle = '#9fb3d1';
      ctx.font = `500 24px ${FONT}`;
      ctx.fillText(c.name, x - 6, 288);
      if (i === 1) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 5;
        ctx.strokeRect(x - 10, y - 12, 104, 286 - y);
        chip(ctx, x - 6, y - 64, '最优', '#4ade80');
      }
    });
  });
}

export function stockScreen() {
  return canvas(512, 320, (ctx, w, h) => {
    frame(ctx, w, h, '库存与库龄', '#14b8a6');
    const bars = [150, 110, 170, 90, 130];
    bars.forEach((b, i) => {
      const x = 40 + i * 92;
      const overdue = i === 2;
      ctx.fillStyle = overdue ? '#f87171' : '#2dd4bf';
      ctx.fillRect(x, 282 - b, 60, b);
    });
    chip(ctx, 300, 30, '积压预警', '#f87171');
  });
}

export function pickupScreen() {
  return canvas(256, 448, (ctx, w, h) => {
    ctx.fillStyle = '#0b1730';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, 0, w, 64);
    ctx.fillStyle = '#fff';
    ctx.font = `700 32px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('提货宝', 22, 34);
    ctx.fillStyle = '#fff';
    ctx.fillRect(38, 96, 180, 180);
    ctx.fillStyle = '#0b1730';
    // 示意二维码:固定图案,非真实码
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if ((i * 7 + j * 5 + i * j) % 3 === 0) ctx.fillRect(46 + i * 19, 104 + j * 19, 15, 15);
      }
    }
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.roundRect(28, 306, 200, 56, 28);
    ctx.fill();
    ctx.fillStyle = '#06101f';
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText('✓ 核验通过', 46, 336);
    ctx.fillStyle = '#9fb3d1';
    ctx.font = `500 24px ${FONT}`;
    ctx.fillText('到库即提', 76, 404);
  });
}

export function ledgerScreen() {
  return canvas(512, 320, (ctx, w, h) => {
    frame(ctx, w, h, '应收 · 应付', '#eab308');
    ['客户甲', '客户乙', '供应商A', '供应商B'].forEach((n, i) => {
      const y = 116 + i * 46;
      ctx.fillStyle = '#9fb3d1';
      ctx.font = `500 26px ${FONT}`;
      ctx.fillText(n, 28, y);
      ctx.fillStyle = '#3a2f08';
      ctx.fillRect(180, y - 12, 200, 24);
      ctx.fillStyle = i < 2 ? '#fde047' : '#fb923c';
      ctx.fillRect(180, y - 12, 90 + ((i * 53) % 100), 24);
      ctx.fillStyle = '#4ade80';
      ctx.font = `700 26px ${FONT}`;
      ctx.fillText('✓ 已对', 400, y);
    });
  });
}

export function dashboardScreen(variant = 0) {
  return canvas(512, 320, (ctx, w, h) => {
    const titles = ['经营日报', '库存资金', '应收账款'];
    frame(ctx, w, h, titles[variant % 3], '#22d3ee');
    if (variant % 3 === 0) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 6;
      ctx.beginPath();
      const pts = [210, 190, 200, 160, 170, 130, 140, 100];
      pts.forEach((y, i) => (i ? ctx.lineTo(40 + i * 60, y + 60) : ctx.moveTo(40, y + 60)));
      ctx.stroke();
      chip(ctx, 300, 30, '利润 ↑', '#4ade80');
    } else if (variant % 3 === 1) {
      [150, 130, 115, 96, 80].forEach((b, i) => {
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(48 + i * 90, 286 - b, 56, b);
      });
      chip(ctx, 300, 30, '库存 ↓', '#4ade80');
    } else {
      ctx.lineWidth = 34;
      ctx.strokeStyle = '#1e3a6b';
      ctx.beginPath();
      ctx.arc(256, 196, 84, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(256, 196, 84, -Math.PI / 2, Math.PI * 0.9);
      ctx.stroke();
      chip(ctx, 300, 30, '回款 ↑', '#4ade80');
    }
  });
}

export function yuanTexture() {
  return canvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7a4d00';
    ctx.font = `800 96px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¥', 64, 70);
  });
}

// 沿流向重复的箭头纹理
export function chevronTexture() {
  const tex = canvas(128, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, 6, w, h - 12);
    ctx.strokeStyle = 'rgba(255,255,255,1)';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(46, 14);
    ctx.lineTo(78, 32);
    ctx.lineTo(46, 50);
    ctx.stroke();
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
