import * as THREE from 'three';
import { FLOW_TYPES } from '../content.js';
import { box, cyl, mat, radialGlowTexture, truck } from './kit.js';
import { chevronTexture } from './screens.js';
import { LAYOUT } from './nodes.js';

// ctrl 是贝塞尔控制点 [x, z],决定这条路往哪边弯
const SEGMENTS = [
  { id: 'customer-sales', type: 'info', from: 'customer', to: 'sales', ctrl: [17.5, 10] },
  { id: 'sales-purchase', type: 'info', from: 'sales', to: 'purchase', ctrl: [0, 17.5] },
  { id: 'purchase-supplier', type: 'info', from: 'purchase', to: 'supplier', ctrl: [-17.5, 10] },
  { id: 'supplier-warehouse', type: 'goods', from: 'supplier', to: 'warehouse', ctrl: [-17.5, -9] },
  { id: 'warehouse-pickup', type: 'goods', from: 'warehouse', to: 'pickup', ctrl: [0, -17] },
  { id: 'pickup-customer', type: 'goods', from: 'pickup', to: 'customer', ctrl: [17.5, -9] },
  { id: 'customer-cashier', type: 'money', from: 'customer', to: 'cashier', ctrl: [9.5, 2.6] },
  { id: 'cashier-supplier', type: 'money', from: 'cashier', to: 'supplier', ctrl: [-9.5, 2.6] },
];

const DATA_SOURCES = ['sales', 'purchase', 'warehouse', 'pickup', 'cashier'];

const STYLE = {
  info: { width: 0.8, period: 1.7, speed: 4.2, tokens: 2 },
  goods: { width: 1.25, period: 2.2, speed: 2.6, tokens: 2 },
  money: { width: 0.8, period: 1.7, speed: 3.4, tokens: 3 },
  data: { speed: 7, tokens: 3 },
};

const OLD_COLOR = new THREE.Color('#8793a8');
const OLD_SPEED = 0.28;

function groundCurve(seg) {
  const a = LAYOUT[seg.from];
  const b = LAYOUT[seg.to];
  const bezier = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(a.x, 0, a.z),
    new THREE.Vector3(seg.ctrl[0], 0, seg.ctrl[1]),
    new THREE.Vector3(b.x, 0, b.z),
  );
  const pts = bezier.getPoints(90).filter((p) => {
    const da = Math.hypot(p.x - a.x, p.z - a.z);
    const db = Math.hypot(p.x - b.x, p.z - b.z);
    return da > a.r + 0.55 && db > b.r + 0.55;
  });
  return new THREE.CatmullRomCurve3(pts);
}

function ribbonGeometry(curve, width, period) {
  const pts = curve.getSpacedPoints(80);
  const pos = [];
  const uv = [];
  const idx = [];
  let len = 0;
  const tangent = new THREE.Vector3();
  pts.forEach((p, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    tangent.subVectors(next, prev).normalize();
    const nx = -tangent.z;
    const nz = tangent.x;
    if (i > 0) len += p.distanceTo(pts[i - 1]);
    const u = len / period;
    pos.push(p.x + (nx * width) / 2, 0, p.z + (nz * width) / 2);
    pos.push(p.x - (nx * width) / 2, 0, p.z - (nz * width) / 2);
    uv.push(u, 0, u, 1);
    if (i > 0) {
      const k = i * 2;
      idx.push(k - 2, k - 1, k, k - 1, k + 1, k);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  return geo;
}

function docToken(color) {
  const g = new THREE.Group();
  const sheet = box(0.6, 0.78, 0.04, mat('#ffffff', { emissive: '#dbeafe', emissiveIntensity: 0.6 }));
  const head = box(0.6, 0.16, 0.05, mat(color, { emissive: color, emissiveIntensity: 1.2 }));
  head.position.y = 0.31;
  g.add(sheet, head);
  [0.08, -0.08, -0.24].forEach((y) => {
    const line = box(0.4, 0.045, 0.05, mat('#64748b'));
    line.position.y = y;
    g.add(line);
  });
  g.rotation.x = -0.35;
  const wrap = new THREE.Group();
  wrap.add(g);
  wrap.userData.lift = 1.15;
  wrap.userData.spin = g;
  return wrap;
}

function coinToken() {
  const wrap = new THREE.Group();
  const coin = cyl(0.4, 0.4, 0.1, mat('#facc15', { metalness: 0.7, roughness: 0.25, emissive: '#b45309', emissiveIntensity: 0.9 }), 20);
  coin.rotation.z = Math.PI / 2;
  const roller = new THREE.Group();
  roller.add(coin);
  wrap.add(roller);
  wrap.userData.lift = 0.48;
  wrap.userData.roll = roller;
  return wrap;
}

function truckToken() {
  const t = truck('#fb923c');
  t.scale.setScalar(0.82);
  const wrap = new THREE.Group();
  wrap.add(t);
  wrap.userData.lift = 0.06;
  return wrap;
}

function pulseToken(color) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialGlowTexture(),
      color,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  s.scale.setScalar(1.1);
  return s;
}

const TOKEN_FACTORY = {
  info: () => docToken(FLOW_TYPES.info.color),
  goods: truckToken,
  money: coinToken,
};

export function createFlows(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const textures = {};
  ['info', 'goods', 'money'].forEach((type) => {
    textures[type] = chevronTexture();
  });

  const segments = [];
  const typeVisible = { info: true, goods: true, money: true, data: true };
  let highlight = null;
  let speedMul = 1;
  let modeBlend = 0; // 0 = AI, 1 = 传统
  let modeTarget = 0;

  SEGMENTS.forEach((def) => {
    const style = STYLE[def.type];
    const curve = groundCurve(def);
    const length = curve.getLength();
    const baseColor = new THREE.Color(FLOW_TYPES[def.type].color);
    const material = new THREE.MeshBasicMaterial({
      map: textures[def.type],
      color: baseColor.clone(),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(ribbonGeometry(curve, style.width, style.period), material);
    mesh.position.y = 0.07;
    mesh.renderOrder = 2;
    group.add(mesh);

    const tokens = [];
    for (let i = 0; i < style.tokens; i++) {
      const obj = TOKEN_FACTORY[def.type]();
      group.add(obj);
      tokens.push({ obj, k: i / style.tokens });
    }
    segments.push({ ...def, style, curve, length, baseColor, material, mesh, tokens, level: 1 });
  });

  const dataColor = new THREE.Color(FLOW_TYPES.data.color);
  const bossTop = new THREE.Vector3(LAYOUT.boss.x, 9.4, LAYOUT.boss.z);
  DATA_SOURCES.forEach((src) => {
    const lay = LAYOUT[src];
    const start = new THREE.Vector3(lay.x, lay.h * 0.62, lay.z);
    const mid = start.clone().lerp(bossTop, 0.5);
    mid.y = 13.5;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, bossTop);
    const material = new THREE.MeshBasicMaterial({
      color: dataColor.clone(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.045, 6), material);
    group.add(mesh);
    const tokens = [];
    for (let i = 0; i < STYLE.data.tokens; i++) {
      const obj = pulseToken(dataColor);
      group.add(obj);
      tokens.push({ obj, k: i / STYLE.data.tokens });
    }
    segments.push({
      id: `data-${src}`,
      type: 'data',
      style: STYLE.data,
      curve,
      length: curve.getLength(),
      baseColor: dataColor,
      material,
      mesh,
      tokens,
      level: 1,
    });
  });

  const p = new THREE.Vector3();
  const ahead = new THREE.Vector3();

  function isHighlighted(seg) {
    if (!highlight) return true;
    return highlight.includes(seg.id) || (seg.type === 'data' && highlight.includes('data'));
  }

  return {
    setHighlight(ids) {
      highlight = ids && ids.length ? ids : null;
    },
    setTypeVisible(type, visible) {
      typeVisible[type] = visible;
    },
    setMode(mode) {
      modeTarget = mode === 'old' ? 1 : 0;
    },
    update(dt, t) {
      modeBlend += (modeTarget - modeBlend) * Math.min(1, dt * 3);
      speedMul = THREE.MathUtils.lerp(1, OLD_SPEED, modeBlend);
      Object.entries(textures).forEach(([type, tex]) => {
        tex.offset.x -= (dt * STYLE[type].speed * speedMul) / STYLE[type].period;
      });

      segments.forEach((seg) => {
        const shown = typeVisible[seg.type];
        const lit = isHighlighted(seg);
        // 传统模式下数据不回流到老板:数据线熄灭
        const dataOff = seg.type === 'data' ? 1 - modeBlend : 1;
        const target = (shown ? (lit ? 1 : highlight ? 0.12 : 1) : 0) * dataOff;
        seg.level += (target - seg.level) * Math.min(1, dt * 5);

        const baseOpacity = seg.type === 'data' ? 0.55 : 0.95;
        seg.material.opacity = Math.min(1, baseOpacity * seg.level);
        seg.mesh.visible = seg.level > 0.01;
        if (seg.type !== 'data') seg.material.color.copy(seg.baseColor).lerp(OLD_COLOR, modeBlend * 0.85);

        const tokenScale = THREE.MathUtils.smoothstep(seg.level, 0.3, 0.9);
        seg.tokens.forEach((tok) => {
          tok.k = (tok.k + (dt * seg.style.speed * speedMul) / seg.length) % 1;
          const edge =
            THREE.MathUtils.smoothstep(tok.k, 0, 0.07) * (1 - THREE.MathUtils.smoothstep(tok.k, 0.93, 1));
          const s = tokenScale * edge;
          tok.obj.visible = s > 0.02;
          if (!tok.obj.visible) return;
          seg.curve.getPointAt(tok.k, p);
          if (seg.type === 'data') {
            tok.obj.position.copy(p);
            tok.obj.scale.setScalar(1.15 * s);
            return;
          }
          seg.curve.getPointAt(Math.min(1, tok.k + 0.01), ahead);
          const lift = tok.obj.userData.lift;
          tok.obj.position.set(p.x, lift, p.z);
          tok.obj.scale.setScalar(s);
          if (seg.type === 'info') {
            tok.obj.position.y = lift + Math.sin(t * 3 + tok.k * 20) * 0.12;
            tok.obj.userData.spin.rotation.y = t * 1.5 + tok.k * 6;
          } else {
            ahead.y = lift;
            tok.obj.lookAt(ahead);
            if (tok.obj.userData.roll) tok.obj.userData.roll.rotation.x += dt * 6 * speedMul;
          }
        });
      });
    },
  };
}
