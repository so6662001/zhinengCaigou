import * as THREE from 'three';
import { at, box, cyl, glow, groundGlow, makeScreen, mat, person, pipeBundle, sphere, truck } from './kit.js';
import {
  compareScreen,
  dashboardScreen,
  ledgerScreen,
  pickupScreen,
  quoteScreen,
  stockScreen,
  yuanTexture,
} from './screens.js';
import { NODES } from '../content.js';

// 场景布局(俯视):前排是订单流,后排是货物流,中间是资金流与老板驾驶舱。
// 所有建筑正面朝 +z(镜头方向)。
export const LAYOUT = {
  customer: { x: 19, z: 1, r: 4.2, h: 5.6 },
  sales: { x: 10.5, z: 13.5, r: 4.2, h: 4.4 },
  purchase: { x: -10.5, z: 13.5, r: 4.2, h: 4.9 },
  supplier: { x: -19, z: 1, r: 4.6, h: 5.6 },
  warehouse: { x: -9.5, z: -13, r: 5.6, h: 5.0 },
  pickup: { x: 9.5, z: -13, r: 4.6, h: 5.4 },
  cashier: { x: 0, z: 7.5, r: 3.8, h: 4.9 },
  boss: { x: 0, z: -2.5, r: 4.6, h: 11.2 },
};

const WALL = '#e7eef9';
const GLASS = { emissive: '#7cc4ff', emissiveIntensity: 0.55, roughness: 0.2 };
const STEEL = { metalness: 0.6, roughness: 0.4 };

function glass() {
  return mat('#bfe3ff', GLASS);
}

function standingScreen(texture, w, h, x, y, z, rotY = 0) {
  const g = new THREE.Group();
  const screen = makeScreen(texture, w, h);
  screen.position.y = y;
  const pole = cyl(0.07, 0.07, y, mat('#334155'), 8);
  pole.position.y = y / 2;
  g.add(pole, screen);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

function buildSales(color) {
  const g = new THREE.Group();
  g.add(at(box(4.0, 2.2, 2.6, mat(WALL)), -0.6, 1.1, -1.0));
  g.add(at(box(4.4, 0.22, 3.0, mat(color)), -0.6, 2.31, -1.0));
  g.add(at(box(2.4, 1.0, 0.06, glass()), -1.1, 1.25, 0.31));
  g.add(at(box(0.7, 1.4, 0.06, mat('#334155')), 0.8, 0.7, 0.31));
  g.add(at(box(2.4, 0.5, 0.12, glow(color, 1.1)), -0.6, 2.72, 0.42));
  g.add(at(box(1.3, 0.5, 0.5, mat('#64748b')), -0.9, 0.25, 1.2));
  g.add(standingScreen(quoteScreen(), 2.3, 1.44, 2.1, 2.1, 1.3, -0.35));
  g.add(at(person('#3b82f6'), -0.9, 0, 0.75));
  const buyer = at(person('#94a3b8'), -0.5, 0, 2.0);
  g.add(buyer);
  return { group: g };
}

function buildPurchase(color) {
  const g = new THREE.Group();
  g.add(at(box(3.2, 3.0, 2.6, mat(WALL)), -1.1, 1.5, -1.0));
  g.add(at(box(3.5, 0.2, 2.9, mat(color)), -1.1, 3.1, -1.0));
  g.add(at(box(2.6, 0.5, 0.06, glass()), -1.1, 0.95, 0.31));
  g.add(at(box(2.6, 0.5, 0.06, glass()), -1.1, 2.1, 0.31));
  // 三家供应商的到手成本柱:中间最低,亮绿色
  const bars = [
    { h: 1.7, m: mat('#64748b') },
    { h: 1.1, m: glow('#4ade80', 0.9) },
    { h: 2.0, m: mat('#64748b') },
  ];
  const winner = bars[1];
  bars.forEach((b, i) => {
    const bar = box(0.55, b.h, 0.55, b.m);
    bar.position.set(1.1 + i * 0.8, b.h / 2, 0.9);
    g.add(bar);
    if (b === winner) g.userData.winner = bar;
  });
  g.add(at(box(2.6, 0.06, 1.0, mat('#1f2f52')), 1.9, 0.03, 0.9));
  g.add(standingScreen(compareScreen(), 2.3, 1.44, 1.9, 3.2, -0.9, -0.25));
  g.add(at(person('#8b5cf6'), 0.2, 0, 1.7));
  return {
    group: g,
    anim(t) {
      const s = 1 + Math.sin(t * 2.4) * 0.06;
      g.userData.winner.scale.set(s, 1, s);
    },
  };
}

function buildSupplier() {
  const g = new THREE.Group();
  g.add(at(box(4.2, 2.0, 2.8, mat('#5b6b85')), -0.2, 1.0, -0.8));
  [-1.6, -0.2, 1.2].forEach((x) => {
    const tooth = box(1.4, 0.55, 2.8, mat('#7a8aa6'));
    tooth.position.set(x, 2.2, -0.8);
    tooth.rotation.z = 0.32;
    g.add(tooth);
  });
  const smoke = [];
  [
    [-1.5, 4.6],
    [-0.5, 3.9],
  ].forEach(([x, h], ci) => {
    g.add(at(cyl(0.26, 0.36, h, mat('#cbd5e1'), 14), x, h / 2, -1.9));
    g.add(at(cyl(0.29, 0.3, 0.4, mat('#ef4444'), 14), x, h - 0.5, -1.9));
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#c7d2e3', transparent: true, opacity: 0.4, depthWrite: false }),
      );
      puff.userData = { x, base: h, phase: i / 4 + ci * 0.13 };
      smoke.push(puff);
      g.add(puff);
    }
  });
  g.add(at(cyl(0.8, 1.0, 2.6, mat('#3f4c63'), 16), 2.1, 1.3, 0.4));
  g.add(at(cyl(0.3, 0.8, 0.7, mat('#3f4c63'), 16), 2.1, 2.95, 0.4));
  const fire = at(box(0.7, 0.45, 0.1, glow('#ff7a1a', 2.2)), 2.1, 0.5, 1.4);
  g.add(fire);
  const fireGlow = groundGlow(2.2, '#ff7a1a', 0.5);
  fireGlow.position.set(2.1, 0.03, 1.6);
  g.add(fireGlow);
  const coilMat = mat('#aab7c9', STEEL);
  [-1.7, -0.7, -1.2].forEach((x, i) => {
    const coil = cyl(0.45, 0.45, 0.5, coilMat, 18);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(x, i === 2 ? 1.22 : 0.45, 1.7);
    g.add(coil);
  });
  return {
    group: g,
    anim(t) {
      smoke.forEach((p) => {
        const k = (t * 0.22 + p.userData.phase) % 1;
        p.position.set(p.userData.x + k * 0.9, p.userData.base + 0.3 + k * 2.2, -1.9);
        p.scale.setScalar(0.6 + k * 1.3);
        p.material.opacity = 0.42 * (1 - k);
      });
      fire.material.emissiveIntensity = 1.8 + Math.sin(t * 6) * 0.5;
    },
  };
}

function hBeam(length, material) {
  const g = new THREE.Group();
  g.add(at(box(0.5, 0.07, length, material), 0, 0.035, 0));
  g.add(at(box(0.07, 0.36, length, material), 0, 0.25, 0));
  g.add(at(box(0.5, 0.07, length, material), 0, 0.465, 0));
  return g;
}

function buildWarehouse(color) {
  const g = new THREE.Group();
  const frame = mat('#3b4a66', STEEL);
  [-3.7, 3.7].forEach((x) => {
    [-3.0, -0.7, 1.6].forEach((z) => g.add(at(box(0.22, 3.2, 0.22, frame), x, 1.6, z)));
  });
  g.add(at(box(7.5, 3.0, 0.15, mat(WALL)), 0, 1.5, -3.1));
  const roofMat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.28,
    roughness: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  [-1, 1].forEach((s) => {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.95, 0.12, 5.0), roofMat);
    roof.position.set(s * 1.88, 3.62, -0.7);
    roof.rotation.z = -s * 0.2;
    g.add(roof);
  });
  g.add(at(box(0.2, 0.2, 5.0, frame), 0, 4.0, -0.7));

  const pipeMat = mat('#b9c4d4', { metalness: 0.65, roughness: 0.35 });
  [4, 3, 2].forEach((n, row) => {
    for (let i = 0; i < n; i++) {
      const p = cyl(0.2, 0.2, 2.6, pipeMat, 12);
      p.rotation.x = Math.PI / 2;
      p.position.set(-2.3 + (i - (n - 1) / 2) * 0.41, 0.2 + row * 0.355, -1.4);
      g.add(p);
    }
  });
  const plateMat = mat('#7b8aa0', STEEL);
  for (let i = 0; i < 7; i++) g.add(at(box(1.9, 0.07, 1.3, plateMat), 0.15, 0.05 + i * 0.085, -1.9));
  const beamMat = mat('#9aa8bd', STEEL);
  for (let i = 0; i < 3; i++) {
    const b = hBeam(2.6, beamMat);
    b.position.set(2.0 + i * 0.6, 0, -1.4);
    g.add(b);
  }
  // 积压垛:颜色发暗,顶上有红色警示灯
  const staleMat = mat('#8a6f5a', { roughness: 0.9 });
  for (let i = 0; i < 6; i++) g.add(at(box(1.7, 0.07, 1.1, staleMat), -2.3, 0.05 + i * 0.085, 0.75));
  const beacon = at(sphere(0.2, glow('#ef4444', 2.4)), -2.3, 1.05, 0.75);
  g.add(beacon);
  const beaconGlow = groundGlow(1.8, '#ef4444', 0.5);
  beaconGlow.position.set(-2.3, 0.02, 0.75);
  g.add(beaconGlow);

  const crane = new THREE.Group();
  const yellow = mat('#fbbf24');
  crane.add(at(box(7.2, 0.26, 0.32, yellow), 0, 2.95, 0));
  const trolley = new THREE.Group();
  trolley.add(at(box(0.6, 0.3, 0.5, mat('#f59e0b')), 0, 2.7, 0));
  const cable = cyl(0.03, 0.03, 1.0, mat('#1f2937'), 6);
  cable.position.y = 2.05;
  const hookLoad = pipeBundle(1.6);
  hookLoad.position.y = 1.2;
  hookLoad.rotation.y = Math.PI / 2;
  trolley.add(cable, hookLoad);
  crane.add(trolley);
  g.add(crane);

  g.add(standingScreen(stockScreen(), 2.1, 1.3, 3.2, 1.9, 2.9, -0.4));
  g.add(at(person('#14b8a6'), 0.9, 0, 2.3));
  return {
    group: g,
    anim(t) {
      crane.position.z = -0.9 + Math.sin(t * 0.45) * 1.5;
      trolley.position.x = Math.sin(t * 0.3 + 1) * 2.4;
      const blink = 0.5 + 0.5 * Math.sin(t * 5);
      beacon.material.emissiveIntensity = 0.6 + blink * 2.6;
      beaconGlow.material.opacity = 0.15 + blink * 0.45;
    },
  };
}

function buildPickup(color) {
  const g = new THREE.Group();
  g.add(at(box(1.9, 0.1, 4.4, mat('#334155')), -0.9, 0.05, -0.2));
  [-1.87, 0.07].forEach((x) => g.add(at(box(0.08, 0.12, 4.4, mat('#facc15')), x, 0.06, -0.2)));
  const parked = truck(color);
  parked.position.set(-0.9, 0.1, -0.5);
  g.add(parked);
  g.add(at(box(1.3, 1.7, 1.3, mat(WALL)), 1.9, 0.85, 0.6));
  g.add(at(box(1.6, 0.16, 1.6, mat(color)), 1.9, 1.78, 0.6));
  g.add(at(box(0.9, 0.6, 0.06, glass()), 1.9, 1.1, 1.26));
  g.add(at(box(0.2, 1.0, 0.2, mat('#475569')), 0.6, 0.5, 2.5));
  const arm = new THREE.Group();
  arm.position.set(0.6, 1.0, 2.5);
  const bar = box(2.9, 0.1, 0.1, mat('#ef4444'));
  bar.position.x = -1.45;
  arm.add(bar);
  [-0.6, -1.4, -2.2].forEach((x) => arm.add(at(box(0.35, 0.11, 0.11, mat('#ffffff')), x, 0, 0)));
  g.add(arm);

  const phone = new THREE.Group();
  phone.add(box(1.15, 2.0, 0.12, mat('#0f172a')));
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 1.75),
    new THREE.MeshBasicMaterial({ map: pickupScreen(), toneMapped: false }),
  );
  face.position.z = 0.065;
  phone.add(face);
  phone.position.set(2.3, 3.4, -0.9);
  g.add(phone);
  const phoneGlow = groundGlow(1.6, color, 0.4);
  phoneGlow.position.set(2.3, 0.02, -0.9);
  g.add(phoneGlow);
  g.add(at(person('#f97316'), 1.3, 0, 2.0));
  return {
    group: g,
    anim(t) {
      phone.position.y = 3.4 + Math.sin(t * 1.6) * 0.18;
      phone.rotation.y = Math.sin(t * 0.8) * 0.35 - 0.1;
      const k = (Math.sin(t * 0.9) + 1) / 2;
      arm.rotation.z = -1.25 * THREE.MathUtils.smoothstep(k, 0.35, 0.65);
    },
  };
}

function buildCashier(color) {
  const g = new THREE.Group();
  const stone = mat('#dbe4f2');
  g.add(at(box(3.5, 0.2, 2.7, mat('#b9c6da')), 0, 0.1, -0.5));
  g.add(at(box(2.9, 1.7, 1.8, stone), 0, 1.05, -0.8));
  [-1.2, -0.4, 0.4, 1.2].forEach((x) => g.add(at(cyl(0.14, 0.16, 1.7, stone, 12), x, 1.05, 0.45)));
  g.add(at(box(3.3, 0.24, 2.5, stone), 0, 2.02, -0.5));
  const tri = new THREE.Shape();
  tri.moveTo(-1.7, 0);
  tri.lineTo(1.7, 0);
  tri.lineTo(0, 0.85);
  tri.closePath();
  const pediment = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: 2.5, bevelEnabled: false }),
    mat(color, { metalness: 0.5, roughness: 0.35 }),
  );
  pediment.position.set(0, 2.14, -1.75);
  pediment.castShadow = true;
  g.add(pediment);
  const gold = mat('#facc15', { metalness: 0.75, roughness: 0.28 });
  [
    [-1.5, 2.0, 0.5],
    [-0.9, 2.3, 0.85],
    [-0.3, 2.1, 0.35],
  ].forEach(([x, z, h]) => g.add(at(cyl(0.28, 0.28, h, gold, 18), x, h / 2, z)));
  const yuan = yuanTexture();
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 28), [
    gold,
    new THREE.MeshStandardMaterial({ map: yuan, metalness: 0.5, roughness: 0.35, emissive: '#5a3d00' }),
    new THREE.MeshStandardMaterial({ map: yuan, metalness: 0.5, roughness: 0.35, emissive: '#5a3d00' }),
  ]);
  coin.rotation.x = Math.PI / 2;
  const coinPivot = new THREE.Group();
  coinPivot.add(coin);
  coinPivot.position.set(0, 3.9, -0.3);
  g.add(coinPivot);
  g.add(standingScreen(ledgerScreen(), 1.9, 1.19, 1.75, 1.75, 1.9, -0.4));
  g.add(at(person('#ca8a04'), 0.6, 0, 1.9));
  return {
    group: g,
    anim(t) {
      coinPivot.rotation.y = t * 1.2;
      coinPivot.position.y = 3.9 + Math.sin(t * 1.4) * 0.12;
    },
  };
}

function buildCustomer() {
  const g = new THREE.Group();
  const steel = mat('#8fa0b8', STEEL);
  [-2.0, -0.8, 0.4].forEach((x) => {
    [-1.9, -0.6].forEach((z) => g.add(at(box(0.16, 3.2, 0.16, steel), x, 1.6, z)));
  });
  [1.05, 2.1].forEach((y) => g.add(at(box(2.8, 0.1, 1.6, mat('#9aa8bd')), -0.8, y, -1.25)));
  [-1.9, -0.6].forEach((z) => g.add(at(box(2.56, 0.12, 0.12, steel), -0.8, 3.14, z)));
  [-2.0, -0.8, 0.4].forEach((x) => g.add(at(box(0.12, 0.12, 1.3, steel), x, 3.14, -1.25)));

  const yellow = mat('#fbbf24');
  g.add(at(box(0.26, 5.0, 0.26, yellow), 2.1, 2.5, -1.6));
  const jib = new THREE.Group();
  jib.position.set(2.1, 4.9, -1.6);
  jib.add(at(box(3.8, 0.14, 0.14, yellow), -1.5, 0, 0));
  jib.add(at(box(0.5, 0.4, 0.4, mat('#64748b')), 0.6, -0.05, 0));
  const hook = cyl(0.025, 0.025, 1.3, mat('#1f2937'), 6);
  hook.position.set(-2.6, -0.65, 0);
  jib.add(hook);
  jib.add(at(box(0.5, 0.08, 0.3, steel), -2.6, -1.3, 0));
  g.add(jib);

  g.add(at(box(1.7, 1.1, 1.2, mat(WALL)), 1.6, 0.55, 1.3));
  g.add(at(box(1.9, 0.12, 1.4, mat('#64748b')), 1.6, 1.16, 1.3));
  g.add(at(box(0.9, 0.45, 0.05, glass()), 1.6, 0.65, 1.91));
  const pile = pipeBundle(2.0);
  pile.position.set(-1.1, 0, 1.4);
  pile.rotation.y = Math.PI / 2;
  g.add(pile);
  g.add(at(person('#64748b'), 0.2, 0, 1.9));
  g.add(at(person('#eab308'), -0.3, 0, 2.5));
  return {
    group: g,
    anim(t) {
      jib.rotation.y = Math.sin(t * 0.25) * 0.5;
    },
  };
}

function buildBoss(color) {
  const g = new THREE.Group();
  g.add(at(cyl(2.3, 2.7, 0.6, mat('#1e2f52'), 6), 0, 0.3, 0));
  const glassMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.32,
    roughness: 0.15,
    depthWrite: false,
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: '#e6fbff', emissive: color, emissiveIntensity: 2.0 });
  const lineMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.8 });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.6, 7.0, 6), glassMat);
  shell.position.y = 4.1;
  g.add(shell);
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 7.0, 12), coreMat), 0, 4.1, 0));
  const rings = [2.4, 4.4, 6.4].map((y, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0 - i * 0.15, 0.05, 8, 48), lineMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
    return ring;
  });
  const brain = new THREE.Group();
  brain.position.y = 9.0;
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, 1),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.9 }),
  );
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 2), coreMat);
  brain.add(wire, heart);
  g.add(brain);
  const halo = groundGlow(6.5, color, 0.45);
  halo.position.y = 0.03;
  g.add(halo);

  const orbit = new THREE.Group();
  orbit.position.y = 4.9;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const panel = makeScreen(dashboardScreen(i), 2.3, 1.44);
    panel.position.set(Math.sin(a) * 3.1, i === 0 ? 0.2 : -0.2, Math.cos(a) * 3.1);
    panel.rotation.y = a;
    orbit.add(panel);
  }
  g.add(orbit);

  let alive = 1;
  return {
    group: g,
    anim(t, dt) {
      orbit.rotation.y += dt * 0.25 * alive;
      brain.rotation.y += dt * 0.7 * alive;
      brain.rotation.x += dt * 0.25 * alive;
      rings.forEach((r, i) => {
        r.position.y = 2.4 + i * 2 + Math.sin(t * 1.2 + i * 1.7) * 0.25 * alive;
      });
      const pulse = 0.85 + Math.sin(t * 2.2) * 0.15;
      coreMat.emissiveIntensity = (0.15 + 1.85 * alive) * pulse;
      lineMat.emissiveIntensity = 0.1 + 1.7 * alive;
      glassMat.emissiveIntensity = 0.05 + 0.3 * alive;
      wire.material.opacity = 0.25 + 0.65 * alive;
      halo.material.opacity = 0.08 + 0.37 * alive;
    },
    setAlive(v) {
      alive = v;
    },
  };
}

const BUILDERS = {
  customer: buildCustomer,
  sales: buildSales,
  purchase: buildPurchase,
  supplier: buildSupplier,
  warehouse: buildWarehouse,
  pickup: buildPickup,
  cashier: buildCashier,
  boss: buildBoss,
};

const PLATFORM_TOP = 0.4;

export function createNodes(scene) {
  const nodes = {};
  Object.entries(LAYOUT).forEach(([id, lay]) => {
    const def = NODES[id];
    const root = new THREE.Group();
    root.position.set(lay.x, 0, lay.z);

    const base = cyl(lay.r, lay.r + 0.35, PLATFORM_TOP, mat('#14213d'), 56);
    base.position.y = PLATFORM_TOP / 2;
    base.castShadow = false;
    const deck = cyl(lay.r - 0.18, lay.r - 0.18, 0.02, mat('#1c2c4f'), 56);
    deck.position.y = PLATFORM_TOP + 0.01;
    deck.castShadow = false;
    const ringMat = new THREE.MeshStandardMaterial({
      color: def.color,
      emissive: def.color,
      emissiveIntensity: 1.5,
      roughness: 0.4,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(lay.r - 0.06, 0.07, 8, 72), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = PLATFORM_TOP + 0.04;
    const halo = groundGlow(lay.r * 1.9, def.color, 0.3);
    halo.position.y = 0.025;
    root.add(base, deck, ring, halo);

    const built = BUILDERS[id](def.color);
    built.group.position.y = PLATFORM_TOP + 0.02;
    root.add(built.group);

    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(lay.r, lay.r, lay.h, 16),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.position.y = lay.h / 2;
    hit.userData.nodeId = id;
    root.add(hit);

    scene.add(root);
    nodes[id] = {
      id,
      def,
      layout: lay,
      root,
      hit,
      ringMat,
      halo,
      position: new THREE.Vector3(lay.x, 0, lay.z),
      anim: built.anim,
      setAlive: built.setAlive,
      emphasis: 0,
    };
  });
  return nodes;
}
