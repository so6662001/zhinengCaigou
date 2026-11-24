import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { groundGlow } from './kit.js';
import { createNodes } from './nodes.js';
import { createFlows } from './flows.js';

const BG = '#060b18';
const OLD_RING = new THREE.Color('#7b8496');
const SUN_AI = new THREE.Color('#ffffff');
const SUN_OLD = new THREE.Color('#ffd2a6');
// 全景时镜头左右轻摆的幅度(弧度)
const SWAY = 0.16;

// 各节点的镜头方向 [x, y, z](从节点中心指向镜头),未列出的用默认值;距离自动计算
const CAMERA_OFFSET = {
  boss: [-8, 17, 25],
  cashier: [5, 11, 15.5],
  warehouse: [-3, 11.5, 17],
  pickup: [3, 11.5, 16.5],
};

function easeInOut(k) {
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

function makeLabel(node) {
  const el = document.createElement('div');
  el.className = `nl nl-${node.def.kind}`;
  el.dataset.node = node.id;
  el.style.setProperty('--c', node.def.color);
  el.innerHTML = `
    <div class="nl-bubble"></div>
    <button class="nl-pill" type="button">
      <b class="nl-name">${node.def.name}</b><i>${node.def.short}</i>
    </button>`;
  const obj = new CSS2DObject(el);
  obj.center.set(0.5, 1);
  obj.position.set(0, node.layout.h + 0.5, 0);
  node.root.add(obj);
  node.labelEl = el;
  return el;
}

export function createWorld(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  // 手机上关掉阴影、降低像素比,保证流畅
  const lite = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.shadowMap.enabled = !lite;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'label-layer';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 120, 420);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minDistance = 10;
  controls.maxDistance = 280;
  controls.screenSpacePanning = false;

  const hemi = new THREE.HemisphereLight('#bcd7ff', '#0b1326', 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 2.3);
  sun.position.set(18, 36, 24);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 34;
  sun.shadow.camera.bottom = -34;
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 110;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#7aa2ff', 0.55);
  fill.position.set(-22, 16, -20);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(240, 72),
    new THREE.MeshStandardMaterial({ color: '#0a1428', roughness: 0.95, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(240, 96, '#22407a', '#152748');
  grid.position.y = 0.012;
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  grid.material.depthWrite = false;
  scene.add(grid);
  const centerGlow = groundGlow(46, '#2563eb', 0.22);
  centerGlow.position.y = 0.02;
  scene.add(centerGlow);

  const nodes = createNodes(scene);
  const flows = createFlows(scene);
  const labelEls = Object.values(nodes).map(makeLabel);

  // ---------- 镜头 ----------
  let aspect = 1;
  let tween = null;
  let sway = false;
  let overviewActive = true;
  let insetsReady = false;
  const viewShift = { x: 0, y: 0, tx: 0, ty: 0 };
  // 被界面遮住的边距(像素):场景要在剩下的区域里完整显示
  const insets = { left: 0, right: 0, top: 0, bottom: 0 };
  const fitCam = new THREE.PerspectiveCamera(camera.fov, 1, 0.5, 500);
  const projected = new THREE.Vector3();

  function freeRect() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    return {
      w,
      h,
      left: insets.left,
      top: insets.top,
      width: Math.max(160, w - insets.left - insets.right),
      height: Math.max(160, h - insets.top - insets.bottom),
    };
  }

  // 沿 dir 方向找一个距离,让 points 刚好落进没被界面遮住的区域,
  // 再算出把它们摆到该区域正中所需的画面平移。labelPx 是给标签留的像素高度。
  function solvePose(points, target, dir, fill, labelPx) {
    const rect = freeRect();
    fitCam.aspect = rect.w / rect.h;
    fitCam.updateProjectionMatrix();
    const availW = rect.width * fill;
    const availH = Math.max(100, rect.height * fill - labelPx);
    const box = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    const measure = (d) => {
      fitCam.position.copy(target).addScaledVector(dir, d);
      fitCam.lookAt(target);
      fitCam.updateMatrixWorld();
      box.minX = box.minY = Infinity;
      box.maxX = box.maxY = -Infinity;
      points.forEach((p) => {
        projected.copy(p).project(fitCam);
        const x = (projected.x * 0.5 + 0.5) * rect.w;
        const y = (-projected.y * 0.5 + 0.5) * rect.h;
        box.minX = Math.min(box.minX, x);
        box.maxX = Math.max(box.maxX, x);
        box.minY = Math.min(box.minY, y);
        box.maxY = Math.max(box.maxY, y);
      });
    };
    let d = 40;
    for (let i = 0; i < 7; i++) {
      measure(d);
      const scale = Math.max((box.maxX - box.minX) / availW, (box.maxY - box.minY) / availH);
      d = THREE.MathUtils.clamp(d * scale, 9, 270);
    }
    measure(d);
    return {
      pos: target.clone().addScaledVector(dir, d),
      target,
      shift: {
        x: (box.minX + box.maxX) / 2 - (rect.left + rect.width / 2),
        y: (box.minY + box.maxY - labelPx) / 2 - (rect.top + rect.height / 2),
      },
    };
  }

  function nodePoints(lay, pad, out) {
    const r = lay.r + pad;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      out.push(new THREE.Vector3(lay.x + Math.cos(a) * r, 0, lay.z + Math.sin(a) * r));
    }
    out.push(new THREE.Vector3(lay.x, lay.h + 0.5, lay.z));
    return out;
  }

  function overviewPose() {
    const rect = freeRect();
    const portrait = rect.width < rect.height * 0.9;
    const points = [];
    Object.values(nodes).forEach((n) => nodePoints(n.layout, 0.4, points));
    // 竖屏时镜头更俯视,让前后排在屏幕上拉开
    const dir = (portrait ? new THREE.Vector3(0, 0.86, 0.5) : new THREE.Vector3(0, 0.64, 0.77)).normalize();
    return solvePose(points, new THREE.Vector3(0, 1.5, 0), dir, 0.93, portrait ? 48 : 78);
  }

  function nodePose(id) {
    const lay = nodes[id].layout;
    const off = CAMERA_OFFSET[id] || [Math.sign(lay.x) * 2.5, 11, 16];
    const dir = new THREE.Vector3(off[0], off[1], off[2]).normalize();
    const target = new THREE.Vector3(lay.x, lay.h * 0.45, lay.z);
    return solvePose(nodePoints(lay, 0.6, []), target, dir, id === 'boss' ? 0.56 : 0.74, 70);
  }

  function flyTo(pose, duration = 1.5) {
    viewShift.tx = pose.shift.x;
    viewShift.ty = pose.shift.y;
    tween = {
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: pose.pos,
      toTarget: pose.target,
      t: 0,
      duration,
    };
  }

  function jumpTo(pose) {
    viewShift.x = viewShift.tx = pose.shift.x;
    viewShift.y = viewShift.ty = pose.shift.y;
    camera.position.copy(pose.pos);
    controls.target.copy(pose.target);
    controls.update();
  }

  function refit() {
    if (focused) flyTo(nodePose(focused), 0.9);
    else if (overviewActive) flyTo(overviewPose(), 0.9);
  }

  controls.addEventListener('start', () => {
    tween = null;
    sway = false;
    overviewActive = false;
    controls.autoRotate = false;
  });

  // ---------- 拾取 ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hits = Object.values(nodes).map((n) => n.hit);
  let hovered = null;
  let focused = null;
  let down = null;
  const listeners = { pick: () => {} };

  function nodeAt(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(hits, false)[0];
    return hit ? hit.object.userData.nodeId : null;
  }

  renderer.domElement.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const id = nodeAt(e);
    if (id) listeners.pick(id);
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    hovered = nodeAt(e);
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
  });
  labelEls.forEach((el) => {
    el.querySelector('.nl-pill').addEventListener('click', () => listeners.pick(el.dataset.node));
  });

  // ---------- 模式 ----------
  let modeTarget = 0;
  let modeBlend = 0;
  const ringColor = new THREE.Color();

  function setMode(mode) {
    modeTarget = mode === 'old' ? 1 : 0;
    flows.setMode(mode);
    Object.values(nodes).forEach((n) => {
      const bubble = n.labelEl.querySelector('.nl-bubble');
      const text = n.def.bubble ? n.def.bubble[mode] : '';
      bubble.textContent = text;
      bubble.hidden = !text;
      n.labelEl.querySelector('.nl-name').textContent = (mode === 'old' && n.def.oldName) || n.def.name;
      n.labelEl.classList.toggle('is-old', mode === 'old');
    });
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    aspect = w / h;
    camera.aspect = aspect;
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();
  jumpTo(overviewPose());

  const clock = new THREE.Clock();
  let elapsed = 0;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (tween) {
      tween.t = Math.min(1, tween.t + dt / tween.duration);
      const k = easeInOut(tween.t);
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
      if (tween.t >= 1) {
        tween = null;
        controls.autoRotate = sway;
      }
    }
    if (controls.autoRotate) {
      const az = controls.getAzimuthalAngle();
      if (az > SWAY) controls.autoRotateSpeed = 0.3;
      if (az < -SWAY) controls.autoRotateSpeed = -0.3;
    }
    controls.update();

    viewShift.x += (viewShift.tx - viewShift.x) * Math.min(1, dt * 4);
    viewShift.y += (viewShift.ty - viewShift.y) * Math.min(1, dt * 4);
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (Math.abs(viewShift.x) > 0.5 || Math.abs(viewShift.y) > 0.5) {
      camera.setViewOffset(w, h, viewShift.x, viewShift.y, w, h);
    } else if (camera.view) {
      camera.clearViewOffset();
    }

    modeBlend += (modeTarget - modeBlend) * Math.min(1, dt * 3);
    hemi.intensity = THREE.MathUtils.lerp(1.15, 0.8, modeBlend);
    sun.color.copy(SUN_AI).lerp(SUN_OLD, modeBlend);
    sun.intensity = THREE.MathUtils.lerp(2.3, 1.7, modeBlend);
    centerGlow.material.opacity = THREE.MathUtils.lerp(0.22, 0.05, modeBlend);

    Object.values(nodes).forEach((n) => {
      if (n.anim) n.anim(elapsed, dt);
      if (n.setAlive) n.setAlive(1 - modeBlend);
      const wanted = n.id === focused ? 1 : n.id === hovered ? 0.6 : 0;
      n.emphasis += (wanted - n.emphasis) * Math.min(1, dt * 8);
      const pulse = n.id === focused ? 0.5 + 0.5 * Math.sin(elapsed * 3.2) : 0;
      ringColor.set(n.def.color).lerp(OLD_RING, modeBlend * 0.8);
      n.ringMat.color.copy(ringColor);
      n.ringMat.emissive.copy(ringColor);
      n.ringMat.emissiveIntensity = (1.3 + n.emphasis * 1.6 + pulse * 1.2) * (1 - modeBlend * 0.6);
      n.halo.material.opacity = (0.26 + n.emphasis * 0.3 + pulse * 0.12) * (1 - modeBlend * 0.7);
    });
    flows.update(dt, elapsed);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);

  return {
    nodes,
    flows,
    setMode,
    onPick(cb) {
      listeners.pick = cb;
    },
    showOverview(instant = false) {
      focused = null;
      overviewActive = true;
      sway = true;
      controls.autoRotateSpeed = 0.3;
      if (instant) {
        jumpTo(overviewPose());
        controls.autoRotate = true;
      } else {
        controls.autoRotate = false;
        flyTo(overviewPose(), 1.7);
      }
      labelEls.forEach((el) => el.classList.remove('is-focus', 'is-dim'));
    },
    focusNode(id) {
      focused = id;
      overviewActive = false;
      sway = false;
      controls.autoRotate = false;
      flyTo(nodePose(id), 1.5);
      labelEls.forEach((el) => {
        el.classList.toggle('is-focus', el.dataset.node === id);
        el.classList.toggle('is-dim', el.dataset.node !== id);
      });
    },
    setInsets(next) {
      const changed = Object.keys(insets).some((k) => Math.abs(insets[k] - next[k]) > 1);
      if (!changed) return;
      Object.assign(insets, next);
      if (!insetsReady) {
        insetsReady = true;
        tween = null;
        jumpTo(focused ? nodePose(focused) : overviewPose());
        return;
      }
      refit();
    },
    refit,
  };
}
