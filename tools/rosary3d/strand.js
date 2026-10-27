/* The Rosary in 3D for the desktop prayer screen (tesbih-duasi.html): the whole rosary lying in an
   oval along the foot of the painting, five decades round the loop and the pendant running off to
   the left from the medal to the crucifix. Beads of one prayer sit close together; a longer run of
   chain parts one prayer from the next (1, 3, 1, medal, then 10, 1, 10 ...). A warm light moves to
   the bead being prayed, and that bead lifts a little, as if held between the fingers.
   Built into assets/vendor/rosary3d.js with three.js (see README.md beside this file);
   assets/script.js loads it only on wide screens with WebGL.

   createRosary(canvas, opts) -> { goTo, setFinish, celebrate, dispose }
     goTo(id, jump)  light the bead with this id (the ids of the page's old SVG rosary:
                     crucifix, intro-bead-1..5, centerpiece, decade-N-bead-1..10,
                     decade-N-our-father for N = 2..5); jump: no glide
     setFinish(name) 'wood' | 'pearl' | 'lapis'
     celebrate()     a wave of light once round the loop (the Rosary is finished)
     opts.onPick(id) a bead was clicked
     opts.still      no glides or waves (prefers-reduced-motion) */
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace,
  SphereGeometry, TorusGeometry, ExtrudeGeometry, Shape, Mesh, InstancedMesh, Group,
  MeshPhysicalMaterial, MeshStandardMaterial, CanvasTexture, RepeatWrapping, Color,
  DirectionalLight, SpotLight, Object3D, Vector3, Vector2, Matrix4, Quaternion, Raycaster, MathUtils,
  Sprite, SpriteMaterial, AdditiveBlending
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const R = { small: 0.46, big: 0.62 };
const LEN = { small: R.small * 1.86, big: R.big * 1.86, medal: 1.3, cross: 1.7 }; // along the thread
const TIGHT = 0.1;        // chain between beads of one prayer
const APART = 1.05;       // chain between one prayer and the next
const LINK = 0.15;        // one chain link's pitch
const RATIO = 0.3;        // the oval's depth to its width

/* ---------- textures, drawn once on a canvas ---------- */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let f = 0, amp = .5; for (let o = 0; o < 4; o++) { f += amp * noise(x, y); x *= 2; y *= 2; amp *= .5; } return f; }
function paint(w, h, px) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4, col = px(x / w, y / h);
    img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.wrapS = t.wrapT = RepeatWrapping; t.anisotropy = 8;
  return t;
}
/* olive wood: honey ground, dark wavy streaks wrapping round the bead */
function oliveWood() {
  const light = [196, 148, 88], dark = [104, 64, 32];
  return paint(512, 256, (u, v) => {
    const warp = fbm(u * 5, v * 2.5) * 1.6;
    const ring = Math.abs(Math.sin((v * 5 + warp) * Math.PI));
    const streak = Math.pow(1 - ring, 3) * .55 + fbm(u * 60, v * 4) * .16;
    const k = Math.min(1, streak + (fbm(u * 2, v * 6) - .5) * .25);
    return light.map((l, i) => l + (dark[i] - l) * k);
  });
}
/* lapis lazuli: deep blue, paler veins of calcite, flecks of gold pyrite */
function lapis() {
  return paint(512, 256, (u, v) => {
    const m = fbm(u * 8, v * 8), vein = Math.pow(Math.max(0, fbm(u * 3 + 9, v * 5) - .55) * 2.4, 2);
    const fleck = hash(Math.floor(u * 400), Math.floor(v * 200)) > .993 ? 1 : 0;
    if (fleck) return [222, 186, 92];
    return [24 + 40 * m + 120 * vein, 46 + 50 * m + 110 * vein, 128 + 70 * m + 80 * vein];
  });
}

/* ---------- shapes ---------- */
function crossShape(w, h, t, arm) {
  const s = new Shape(), a = t / 2;
  s.moveTo(-a, 0); s.lineTo(-a, arm - a); s.lineTo(-w / 2, arm - a); s.lineTo(-w / 2, arm + a); s.lineTo(-a, arm + a);
  s.lineTo(-a, h); s.lineTo(a, h); s.lineTo(a, arm + a); s.lineTo(w / 2, arm + a); s.lineTo(w / 2, arm - a);
  s.lineTo(a, arm - a); s.lineTo(a, 0); s.lineTo(-a, 0);
  return s;
}
function ovalShape(rx, ry) { const s = new Shape(); s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0); return s; }

/* The rosary's pieces in order. The loop starts at the medal and runs round the five decades
   back to it; the pendant runs from the medal out to the crucifix. "gap" is the chain before
   a piece: TIGHT inside one prayer's beads, APART between prayers. */
function pieces() {
  const loop = [{ id: 'centerpiece', kind: 'medal', gap: 0 }], pend = [];
  for (let d = 1; d <= 5; d++) {
    if (d > 1) loop.push({ id: 'decade-' + d + '-our-father', kind: 'big', gap: APART });
    for (let k = 1; k <= 10; k++) loop.push({ id: 'decade-' + d + '-bead-' + k, kind: 'small', gap: k === 1 ? APART : TIGHT });
  }
  pend.push({ id: 'intro-bead-5', kind: 'big', gap: APART });
  for (let k = 4; k >= 2; k--) pend.push({ id: 'intro-bead-' + k, kind: 'small', gap: k === 4 ? APART : TIGHT });
  pend.push({ id: 'intro-bead-1', kind: 'big', gap: APART });
  pend.push({ id: 'crucifix', kind: 'cross', gap: APART });
  return { loop, pend, closing: APART }; // the chain from decade 5's tenth bead back to the medal
}

export function createRosary(canvas, opts) {
  opts = opts || {};
  const still = !!opts.still;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .92;
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .65;
  const camera = new PerspectiveCamera(16, 1, 1, 500);

  const key = new DirectionalLight(0xfff1dc, 1.2); key.position.set(-8, 14, 10); scene.add(key);
  const rim = new DirectionalLight(0xc8d6ff, .6); rim.position.set(10, 6, -14); scene.add(rim);
  /* the warm light on the bead being prayed: it glides from bead to bead */
  const glow = new SpotLight(0xffc56b, 0, 40, MathUtils.degToRad(4.5), .6, 1.1);
  scene.add(glow, glow.target);
  const GLOW = 520;
  /* and a soft halo round it, so the bead being prayed is plain to see at a glance */
  const haloTex = (function () {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,220,150,1)'); r.addColorStop(.25, 'rgba(255,196,110,.6)'); r.addColorStop(.6, 'rgba(255,180,90,.15)'); r.addColorStop(1, 'rgba(255,170,80,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  })();
  const halo = new Sprite(new SpriteMaterial({ map: haloTex, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }));
  halo.renderOrder = -1; scene.add(halo);

  /* ---------- materials ---------- */
  const tex = {};
  const FINISH = {
    wood: () => ({
      bead: new MeshPhysicalMaterial({ map: tex.wood || (tex.wood = oliveWood()), roughness: .42, clearcoat: .7, clearcoatRoughness: .25, sheen: .2 }),
      metal: new MeshStandardMaterial({ color: 0xb48a52, metalness: 1, roughness: .34 }),
      cross: new MeshStandardMaterial({ color: 0x3a2212, roughness: .55, envMapIntensity: .35 })
    }),
    pearl: () => ({
      bead: new MeshPhysicalMaterial({ color: 0xf1e9dc, roughness: .2, clearcoat: .6, clearcoatRoughness: .2, sheen: 1, sheenColor: new Color(0xffe6ef), sheenRoughness: .4, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 480] }),
      metal: new MeshStandardMaterial({ color: 0xd9d6d0, metalness: 1, roughness: .22 }),
      cross: new MeshStandardMaterial({ color: 0xd9d6d0, metalness: 1, roughness: .2 })
    }),
    lapis: () => ({
      bead: new MeshPhysicalMaterial({ map: tex.lapis || (tex.lapis = lapis()), roughness: .16, clearcoat: 1, clearcoatRoughness: .06 }),
      metal: new MeshStandardMaterial({ color: 0xd8b25a, metalness: 1, roughness: .26 }),
      cross: new MeshStandardMaterial({ color: 0xd8b25a, metalness: 1, roughness: .22 })
    })
  };
  let mat = FINISH.wood();

  /* ---------- geometry ---------- */
  const geo = {
    small: new SphereGeometry(R.small, 48, 32),
    big: new SphereGeometry(R.big, 56, 36),
    link: new TorusGeometry(.085, .022, 10, 24),
    cross: new ExtrudeGeometry(crossShape(1.0, 1.7, .26, 1.18), { depth: .14, bevelEnabled: true, bevelThickness: .045, bevelSize: .04, bevelSegments: 4, curveSegments: 4 }),
    medal: new ExtrudeGeometry(ovalShape(.5, .64), { depth: .1, bevelEnabled: true, bevelThickness: .04, bevelSize: .05, bevelSegments: 5, curveSegments: 48 }),
    relief: new ExtrudeGeometry(crossShape(.34, .54, .08, .38), { depth: .05, bevelEnabled: true, bevelThickness: .015, bevelSize: .012, bevelSegments: 2 }),
    star: new SphereGeometry(.034, 10, 8)
  };
  geo.cross.translate(0, -.85, -.07);  // centred on its own middle
  geo.medal.translate(0, 0, -.05);
  geo.relief.translate(0, -.27, .07);

  /* ---------- where everything lies ---------- */
  const P = pieces();
  let loopLen = 0;
  P.loop.forEach((p, i) => { loopLen += (i ? p.gap : 0) + LEN[p.kind]; });
  loopLen += P.closing;
  /* an oval of exactly that length: its arc length tabled against the angle */
  const TABLE = [];
  let A = 1, B = RATIO;
  (function () {
    const n = 2048; let s = 0, px = 1, pz = 0; const raw = [[0, 0]];
    for (let i = 1; i <= n; i++) {
      const t = i / n * Math.PI * 2, x = Math.cos(t), z = Math.sin(t) * RATIO;
      s += Math.hypot(x - px, z - pz); raw.push([t, s]); px = x; pz = z;
    }
    A = loopLen / s; B = A * RATIO;
    raw.forEach(r => TABLE.push([r[0], r[1] * A]));
  })();
  function angleAt(s) {
    s = ((s % loopLen) + loopLen) % loopLen;
    let lo = 0, hi = TABLE.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TABLE[m][1] < s) lo = m; else hi = m; }
    const f = (s - TABLE[lo][1]) / (TABLE[hi][1] - TABLE[lo][1] || 1);
    return TABLE[lo][0] + f * (TABLE[hi][0] - TABLE[lo][0]);
  }
  /* the medal sits at the oval's left end; the decades run along the front first (toward the
     viewer), round the right end and back along the far side */
  function onLoop(s, pos, tan) {
    const t = angleAt(s);
    pos.set(-A * Math.cos(t), 0, B * Math.sin(t));
    tan.set(A * Math.sin(t), 0, B * Math.cos(t)).normalize();
    return pos;
  }
  /* the pendant: out to the left from the medal, curving a little toward the viewer */
  function onPend(d, pos, tan) {
    pos.set(-A - d, 0, .035 * d * d);
    tan.set(-1, 0, .07 * d).normalize();
    return pos;
  }

  const root = new Group(); scene.add(root);
  const byId = {}, all = [], linkSpots = [];
  const tmpP = new Vector3(), tmpT = new Vector3(), Y = new Vector3(0, 1, 0);
  const FLAT = new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, 1, 0)); // long axis along +x, face up
  function make(p) {
    let obj;
    if (p.kind === 'cross') {
      obj = new Group(); obj.add(new Mesh(geo.cross, mat.cross));
    } else if (p.kind === 'medal') {
      obj = new Group();
      obj.add(new Mesh(geo.medal, mat.metal), new Mesh(geo.relief, mat.metal));
      for (let n = 0; n < 12; n++) {
        const a = n / 12 * Math.PI * 2, st = new Mesh(geo.star, mat.metal);
        st.position.set(Math.cos(a) * .4, Math.sin(a) * .52, .06); obj.add(st);
      }
    } else obj = new Mesh(geo[p.kind], mat.bead);
    obj.userData = { id: p.id, kind: p.kind, spin: hash(all.length, 7) * Math.PI * 2, lift: 0, glow: 0 };
    obj.traverse(m => { if (m.isMesh) m.userData.id = p.id; });
    root.add(obj); all.push(obj); byId[p.id] = obj;
    return obj;
  }
  const qa = new Quaternion(), qb = new Quaternion(), qFlat = new Quaternion().setFromRotationMatrix(FLAT);
  function place(obj, pos, tan) {
    obj.userData.base = pos.clone();
    const k = obj.userData.kind;
    if (k === 'cross' || k === 'medal') {
      /* lying on its back, its long axis along the chain; the crucifix's head toward the beads */
      const ang = Math.atan2(-tan.z, tan.x);
      qa.setFromAxisAngle(Y, ang); obj.quaternion.copy(qa).multiply(qFlat);
      if (k === 'cross') obj.rotateZ(Math.PI); // its head points back along the pendant
      obj.rotateY(.4); // tipped a little toward the viewer
    } else {
      qa.setFromUnitVectors(Y, tan); qb.setFromAxisAngle(Y, obj.userData.spin);
      obj.quaternion.copy(qa).multiply(qb);
      obj.scale.set(1, .93, 1);
    }
    obj.userData.q = obj.quaternion.clone();
    obj.position.copy(pos);
  }
  /* chain links every LINK along a stretch of chain, each with its place and direction */
  function chain(from, to, at) { for (let s = from + LINK / 2; s < to; s += LINK) linkSpots.push(at(s)); }
  const loopAt = v => { const t = new Vector3(); return [onLoop(v, new Vector3(), t), t]; };
  const pendAt = v => { const t = new Vector3(); return [onPend(v, new Vector3(), t), t]; };
  (function build() {
    let s = -LEN.medal / 2; // the medal's middle at the oval's left end
    P.loop.forEach((p, i) => {
      if (i) { const a = s; s += p.gap; chain(a, s, loopAt); }
      const c = s + LEN[p.kind] / 2; s += LEN[p.kind];
      const o = make(p); onLoop(c, tmpP, tmpT); place(o, tmpP, tmpT);
    });
    chain(s, loopLen - LEN.medal / 2, loopAt);
    let d = LEN.medal / 2;
    P.pend.forEach(p => {
      const a2 = d; d += p.gap; chain(a2, d, pendAt);
      const c = d + LEN[p.kind] / 2; d += LEN[p.kind];
      const o = make(p); onPend(c, tmpP, tmpT); place(o, tmpP, tmpT);
    });
  })();
  const links = new InstancedMesh(geo.link, mat.metal, linkSpots.length);
  (function () {
    const dummy = new Object3D();
    linkSpots.forEach((sp, n) => {
      dummy.position.copy(sp[0]);
      dummy.quaternion.setFromUnitVectors(Y, sp[1]);
      if (n % 2) dummy.rotateY(Math.PI / 2);
      dummy.scale.set(1, 1.45, 1);
      dummy.updateMatrix(); links.setMatrixAt(n, dummy.matrix);
    });
    links.instanceMatrix.needsUpdate = true;
  })();
  root.add(links);

  function setFinish(name) {
    if (!FINISH[name]) return;
    mat = FINISH[name]();
    all.forEach(o => o.traverse(m => {
      if (!m.isMesh) return;
      const k = o.userData.kind;
      m.material = k === 'cross' ? mat.cross : k === 'medal' ? mat.metal : mat.bead;
    }));
    links.material = mat.metal;
    wake();
  }

  /* ---------- the light and the lift: eased toward the bead asked for ---------- */
  let cur = null, raf = 0, last = 0, visible = true, alive = true, wave = -1;
  const lightAt = new Vector3(), lightTo = new Vector3();
  function step(dt, time) {
    let busy = false;
    const ease = still ? 1 : Math.min(1, dt * 7);
    if (cur) lightTo.copy(cur.userData.base);
    const before = lightAt.distanceToSquared(lightTo);
    lightAt.lerp(lightTo, still ? 1 : Math.min(1, dt * 5));
    if (before > 1e-5) busy = true;
    glow.target.position.copy(lightAt);
    glow.position.set(lightAt.x, lightAt.y + 9, lightAt.z + 7);
    const big = cur && (cur.userData.kind === 'big' || cur.userData.kind === 'medal') ? 1.25 : cur && cur.userData.kind === 'cross' ? 1.6 : 1;
    halo.position.set(lightAt.x, lightAt.y + .3, lightAt.z);
    halo.scale.setScalar(4.2 * big * (1 + (still ? 0 : Math.sin(time * .002) * .06)));
    halo.material.opacity += ((cur ? 1 : 0) - halo.material.opacity) * ease;
    const want = cur ? GLOW : 0;
    glow.intensity += (want - glow.intensity) * ease;
    if (Math.abs(glow.intensity - want) > 1) busy = true;
    all.forEach((o, i) => {
      const u = o.userData, on = o === cur ? 1 : 0;
      const w = wave >= 0 ? Math.max(0, 1 - Math.abs(wave - i) / 4) : 0;
      u.lift += (on - u.lift) * ease;
      if (Math.abs(u.lift - on) > .002) busy = true;
      o.position.copy(u.base); o.position.y += u.lift * .32 + w * .25;
      const flat = u.kind === 'cross' || u.kind === 'medal';
      const sc = 1 + u.lift * .1 + w * .08;
      o.scale.set(sc, flat ? sc : sc * .93, sc);
      /* the held bead turns a little in the fingers */
      if (!flat) { o.quaternion.copy(u.q); if (u.lift > .01) o.rotateY(u.lift * .6 + (still ? 0 : Math.sin(time * .0015) * .08 * u.lift)); }
    });
    if (wave >= 0) { wave += dt * 26; busy = true; if (wave > all.length + 5) wave = -1; }
    return busy;
  }
  function frame(time) {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(.05, last ? (time - last) / 1000 : .016); last = time;
    const busy = step(dt, time);
    renderer.render(scene, camera);
    /* the held bead's slow turn keeps going, at 30 frames a second; nothing else needs drawing */
    if (visible && (busy || (!still && cur))) {
      if (busy) raf = requestAnimationFrame(frame);
      else setTimeout(() => { if (!raf && alive) raf = requestAnimationFrame(frame); }, 33);
    }
  }
  function wake() { if (!raf && alive) { last = 0; raf = requestAnimationFrame(frame); } }

  /* ---------- the camera: looking down at the rosary on a table, all of it in view ---------- */
  const box = (function () {
    const mn = new Vector3(Infinity, Infinity, Infinity), mx = new Vector3(-Infinity, -Infinity, -Infinity);
    all.forEach(o => { mn.min(o.userData.base); mx.max(o.userData.base); });
    mn.addScalar(-1); mx.addScalar(1); mx.y += .6;
    return { mn, mx };
  })();
  const corners = [];
  for (let i = 0; i < 8; i++) corners.push(new Vector3(i & 1 ? box.mx.x : box.mn.x, i & 2 ? box.mx.y : box.mn.y, i & 4 ? box.mx.z : box.mn.z));
  const PITCH = MathUtils.degToRad(34);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    /* no more than about 2560 pixels across: sharp enough, and kind to small graphics chips on 4K screens */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, 2560 / w));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const c = new Vector3().addVectors(box.mn, box.mx).multiplyScalar(.5);
    const dir = new Vector3(0, Math.sin(PITCH), Math.cos(PITCH));
    const fits = dist => {
      camera.position.copy(c).addScaledVector(dir, dist); camera.lookAt(c); camera.updateMatrixWorld();
      return corners.every(p => { const q = p.clone().project(camera); return Math.abs(q.x) <= .97 && Math.abs(q.y) <= .94; });
    };
    let lo = 5, hi = 800;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; }
    fits(hi);
    wake();
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); });
  io.observe(canvas);
  const onVis = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVis);

  /* ---------- picking ---------- */
  const ray = new Raycaster(), ndc = new Vector2();
  function beadAt(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(all, true)[0];
    return hit ? hit.object.userData.id : null;
  }
  canvas.addEventListener('pointermove', e => { canvas.style.cursor = beadAt(e) ? 'pointer' : ''; });
  canvas.addEventListener('click', e => { const id = beadAt(e); if (id && opts.onPick) opts.onPick(id); });

  return {
    goTo(id, jump) {
      cur = byId[id] || null;
      if (cur && (jump || !lightAt.lengthSq())) lightAt.copy(cur.userData.base);
      wake();
    },
    setFinish,
    celebrate() { if (!still) { wave = 0; wake(); } },
    dispose() {
      alive = false; ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      if (raf) cancelAnimationFrame(raf);
      renderer.dispose(); pmrem.dispose();
    }
  };
}
