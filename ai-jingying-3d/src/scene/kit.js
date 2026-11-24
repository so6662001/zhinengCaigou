import * as THREE from 'three';

const materialCache = new Map();

export function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  let m = materialCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.08, ...opts });
    materialCache.set(key, m);
  }
  return m;
}

export function glow(color, intensity = 1.4) {
  return mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}

function shadowed(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function box(w, h, d, material) {
  return shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
}

export function cyl(rTop, rBottom, h, material, segments = 24) {
  return shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material));
}

export function sphere(r, material, segments = 16) {
  return shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, segments, segments), material));
}

export function at(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

export function person(color) {
  const g = new THREE.Group();
  const body = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), mat(color)));
  body.position.y = 0.4;
  const head = sphere(0.15, mat('#f1c9a5'));
  head.position.y = 0.88;
  g.add(body, head);
  return g;
}

// 一捆钢管,沿 z 方向摆放
export function pipeBundle(length = 2.2, color = '#b9c4d4') {
  const g = new THREE.Group();
  const m = mat(color, { metalness: 0.65, roughness: 0.35 });
  const r = 0.16;
  const rows = [3, 2];
  rows.forEach((n, row) => {
    for (let i = 0; i < n; i++) {
      const p = cyl(r, r, length, m, 12);
      p.rotation.x = Math.PI / 2;
      p.position.set((i - (n - 1) / 2) * r * 2.05, r + row * r * 1.78, 0);
      g.add(p);
    }
  });
  return g;
}

// 车头朝 +z
export function truck(cabColor = '#f97316') {
  const g = new THREE.Group();
  const dark = mat('#1f2937');
  const bed = box(1.15, 0.16, 2.7, mat('#475569'));
  bed.position.set(0, 0.52, -0.35);
  const cab = box(1.1, 0.95, 0.85, mat(cabColor));
  cab.position.set(0, 0.92, 1.45);
  const glass = box(0.96, 0.36, 0.05, mat('#bfe3ff', { emissive: '#7cc4ff', emissiveIntensity: 0.5 }));
  glass.position.set(0, 1.1, 1.89);
  g.add(bed, cab, glass);
  [
    [-0.55, 1.35],
    [0.55, 1.35],
    [-0.55, -0.35],
    [0.55, -0.35],
    [-0.55, -1.2],
    [0.55, -1.2],
  ].forEach(([x, z]) => {
    const w = cyl(0.3, 0.3, 0.22, dark, 14);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.3, z);
    g.add(w);
  });
  const load = pipeBundle(2.4);
  load.position.set(0, 0.6, -0.4);
  g.add(load);
  g.userData.load = load;
  return g;
}

export function makeScreen(texture, w, h) {
  const g = new THREE.Group();
  const frame = box(w + 0.16, h + 0.16, 0.1, mat('#0f172a'));
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  face.position.z = 0.056;
  g.add(frame, face);
  return g;
}

let glowTexture;
export function radialGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

export function groundGlow(radius, color, opacity = 0.5) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({
      map: radialGlowTexture(),
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}
