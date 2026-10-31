/* Side-view animations, one function per movement: each returns a spec —
   props (floor, wall, bar…), keyframes and the muscles to highlight. Poses are
   authored in a 360 × 220 world with the floor at y = 200 and the figure
   facing right. Hand-tuned data, ported verbatim (only re-formatted). */
/* eslint-disable no-nested-ternary -- hand-tuned code kept as it was written; see docs/ROADMAP.md */

import { AN } from './engine.js';

/* ===== Animation specs (poses authored in a 360x220 world, floor y=200, figure faces right) ===== */
const R = AN.rigid;
const FL = 200;
const T = AN.T;
const AR = 68;
const HV = [-30, -30, 500, 305];
const JV = [-20, -40, 400, 244];
const deg = Math.PI / 180;
const dirv = (t) => [Math.sin((t * Math.PI) / 180), -Math.cos((t * Math.PI) / 180)];
const hipFrom = (S, t, sb = 0) => {
  const o = AN.spineOf([0, 0], t, sb).pts[3];
  return [S[0] - o[0], S[1] - o[1]];
};
const len2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const solveTorso = (hip, sb, target) => {
  let best = 0;
  let bd = 1e9;
  for (let t = -200; t <= 200; t += 0.5) {
    const p = AN.shoulderOf(hip, t, sb);
    const d = len2(p, target);
    if (d < bd) {
      bd = d;
      best = t;
    }
  }
  return best;
};
/* leg whose knee lands on K: thigh angle phi (deg, 0=right, 90=down) from the knee up to the hip, shin direction shin (deg) */
const legOnKnee = (K, phi, shin) => {
  const hip = [K[0] + 46 * Math.cos(phi * deg), K[1] + 46 * Math.sin(phi * deg)];
  const ankle = [K[0] + 44 * Math.cos(shin * deg), K[1] + 44 * Math.sin(shin * deg)];
  const k1 = AN.ik(hip, ankle, 46, 44, -1).mid;
  const k2 = AN.ik(hip, ankle, 46, 44, 1).mid;
  return { hip, foot: ankle, foot2: ankle, kb: len2(k1, K) <= len2(k2, K) ? -1 : 1 };
};
const BOX = (x, y, w, h) => ['box', x, y, w, h];
const WALL = (x) => ['wall', x];

/* plank-like: feet anchored, shoulders above hands */
function plank(o) {
  const {
    fx = 45,
    fy = 186,
    thUp = 22,
    thDown = 4,
    hy = 195,
    lean = 0,
    sb = 0,
    props = [],
    dur = 2.8,
    mus,
    a = 90,
    L = a + T,
    kneel,
  } = o;
  const up = R([fx, fy], thUp, a, L);
  const dn = R([fx, fy], thDown, a, L);
  const hx = up.S[0] - lean;
  const mk = (r, extra = {}) => {
    const k = { hip: r.hip, t: r.t, sb, hand: [hx, hy], eb: 1, kb: -1, ...extra };
    if (kneel) {
      k.foot = [fx - 41, fy - 15];
    } else {
      k.foot = [fx, fy];
    }
    return k;
  };
  return { props, keys: [mk(up), mk(dn)], dur, mus };
}
const pushupMus = { p: ['chest', 'triceps'], s: ['shoulders', 'abs', 'glutes'] };

const ANIMS = {};
ANIMS.pushup = (o = {}) => plank({ mus: pushupMus, ...o });
ANIMS.pushupLow = () => plank({ thDown: 7, mus: pushupMus });
ANIMS.pseudo = () =>
  plank({
    sb: 12,
    lean: 30,
    thUp: 19,
    thDown: 6,
    mus: { p: ['shoulders', 'chest'], s: ['triceps', 'abs', 'forearms'] },
  });
ANIMS.incline = () =>
  plank({
    fx: 62,
    fy: 186,
    hy: 135,
    thUp: 50,
    thDown: 34,
    props: [BOX(148, 140, 120, 60)],
    mus: pushupMus,
  });
ANIMS.decline = () =>
  plank({
    fy: 138,
    fx: 40,
    hy: 195,
    thUp: 3,
    thDown: -12,
    props: [BOX(10, 152, 60, 48)],
    mus: { p: ['shoulders', 'chest', 'triceps'], s: ['abs', 'glutes'] },
  });
ANIMS.ringpush = () =>
  plank({
    hy: 188,
    props: [['rings', 197, 191]],
    mus: { p: ['chest', 'triceps'], s: ['shoulders', 'abs', 'forearms'] },
  });
ANIMS.kneepush = () =>
  plank({ fx: 90, fy: 191, thUp: 33, thDown: 9, a: 46, kneel: true, mus: pushupMus });
ANIMS.wallpush = () => {
  const F = [195, 194];
  const up = R(F, 77);
  const dn = R(F, 61);
  const H = [F[0] + 104, 56];
  const mk = (r) => ({ hip: r.hip, t: r.t, hand: H, foot: F, ft: 0 });
  return { props: [WALL(H[0] + 4)], keys: [mk(up), mk(dn)], dur: 2.8, mus: pushupMus };
};
ANIMS.pike = (o = {}) => {
  const elev = o.elev;
  const F = elev ? [110, 136] : [110, 186];
  const h1 = elev ? [160, 76] : [156, 114];
  const h2 = elev ? [172, 102] : [164, 116];
  const hand = [elev ? 214 : 232, 195];
  const k1 = { hip: h1, t: elev ? 150 : 110, hand, foot: F, hd: 10, eb: 1 };
  const k2 = { hip: h2, t: elev ? 160 : 140, hand, foot: F, hd: 10, eb: 1 };
  return {
    props: elev ? [BOX(80, 150, 60, 50)] : [],
    keys: [k1, k2],
    dur: 3,
    mus: { p: ['shoulders', 'triceps'], s: ['chest', 'traps'] },
  };
};
ANIMS.hspu = () => {
  const hand = [200, 195];
  const k = (shy, dx) => ({
    hip: [200 + dx, shy - T],
    t: 180,
    hand,
    foot: [200 + dx + 6, shy - T - 88],
    foot2: [200 + dx + 6, shy - T - 88],
    hd: 8,
    eb: -1,
  });
  return {
    vb: [60, -40, 330, 252],
    props: [['wall', 238, 'R']],
    keys: [k(195 - AR, 0), k(195 - AR + 38, 6)],
    dur: 3.2,
    mus: { p: ['shoulders', 'triceps'], s: ['traps', 'abs'] },
  };
};
ANIMS.benchdip = () => {
  const hx = 126;
  const top = 150;
  const hand = [hx, top - 5];
  const foot = [204, 194];
  const up = { hip: [140, 148], t: -2, hand, foot, eb: 1, kb: -1 };
  const dn = { hip: [143, 169], t: -2, hand, foot, eb: 1, kb: -1 };
  return {
    props: [BOX(hx - 86, top, 90, 50)],
    keys: [up, dn],
    dur: 2.8,
    mus: { p: ['triceps'], s: ['chest', 'shoulders'] },
  };
};
ANIMS.dip = (o = {}) => {
  const y0 = 120;
  const hx = 180;
  const hand = [hx, y0 - 2];
  /* arms straight at the top; at the bottom the shoulders have travelled forward and down, the elbows back, upper arms level */
  const mk = (S, t, sb) => {
    const hip = hipFrom(S, t, sb);
    return {
      shAt: S,
      t,
      sb,
      hand,
      foot: [hip[0] - 22, hip[1] + 62],
      foot2: [hip[0] - 30, hip[1] + 58],
      eb: 1,
      kb: -1,
      hd: 0,
    };
  };
  const top = mk([hx + 2, y0 - AR], 6, 0);
  const dn = mk([hx + 24, y0 - 40], 16, 4);
  return {
    vb: [30, -20, 360, 220],
    noFloor: true,
    props: o.rings
      ? [
          ['rings', 172, y0],
          ['rings', 188, y0],
        ]
      : [['rail', 150, y0, 60]],
    keys: [top, dn],
    dur: 3,
    mus: { p: ['triceps', 'chest'], s: ['shoulders'] },
  };
};
ANIMS.row = (o = {}) => {
  const hx = 120;
  const hy = 112;
  const feetUp = o.feetUp;
  const F = feetUp ? [292, 146] : [296, 192];
  const mk = (sy) => {
    const r = R(F, 180 - Math.asin(Math.max(-1, Math.min(1, (F[1] - sy) / 160))) / deg);
    return { hip: r.hip, t: r.t, hand: [hx, hy], foot: F, ft: 0, eb: 1, kb: -1, hd: 0 };
  };
  const sH = hy + AR;
  const sU = hy + 22;
  const props = o.bar
    ? [['bar', hx, hy]]
    : o.rings
      ? [['rings', hx, hy + 4]]
      : [BOX(hx - 78, hy - 8, 84, 8), BOX(hx - 78, hy, 6, FL - hy)];
  if (feetUp) {
    props.push(BOX(268, 152, 60, 48));
  }
  return {
    props,
    keys: [mk(sH), mk(sU)],
    dur: 3,
    mus: { p: ['lats', 'biceps', 'traps'], s: ['forearms', 'lowback'] },
  };
};
ANIMS.pullup = (o = {}) => {
  const by = 30;
  const hx = 200;
  const k = (sy, ea, w, d, e) => ({
    sb: ea ? 0 : -6,
    hip: [hx - 4, sy + T],
    t: -3,
    hand: [hx + 4, by],
    foot: [hx - 24, sy + T + 74],
    eb: -1,
    kb: -1,
    ft: 0,
    hzr: o.rings ? w : null,
    hzl: o.rings ? -w : null,
    d,
    e,
  });
  const hang = k(by + AR, 0, 24, o.neg ? 4 : 1, o.neg ? 'lin' : 'io');
  const top = k(by + 22, 0, 33, o.neg ? 0.8 : 1, 'io');
  return {
    vb: HV,
    noFloor: true,
    bandTo: o.band ? 'knee' : null,
    props: o.rings
      ? [
          ['rings', hx - 6, by],
          ['rings', hx + 6, by],
        ]
      : [['bar', hx, by]],
    keys: o.neg ? [top, hang] : [hang, top],
    mode: o.neg ? 'loop' : 'yoyo',
    dur: o.neg ? 6.5 : 3.2,
    mus: { p: ['lats', 'biceps'], s: ['traps', 'forearms', 'abs'] },
  };
};
ANIMS.hang = () => {
  const by = 30;
  const hx = 200;
  const k = (sy) => ({
    hip: [hx - 4, sy + T],
    t: -3,
    hand: [hx + 4, by],
    foot: [hx - 14, sy + T + 80],
    eb: -1,
    kb: -1,
  });
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys: [k(by + AR), k(by + AR)],
    dur: 3,
    mus: { p: ['forearms', 'lats'], s: ['shoulders', 'biceps'], st: ['lats'] },
  };
};
ANIMS.scap = () => {
  const by = 30;
  const hx = 200;
  /* so lifts the shoulder joint above the top of the chest while hanging loose; depressing the blades brings the chest up to meet it */
  const k = (sy, so) => ({
    hip: [hx - 4, sy + T],
    t: -3,
    hand: [hx + 4, by],
    so: [0, so],
    foot: [hx - 14, sy + T + 80],
    eb: -1,
    kb: -1,
  });
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys: [k(by + AR + 10, -10), k(by + AR, 0)],
    dur: 2.4,
    mus: { p: ['lats', 'traps'], s: ['forearms'] },
  };
};
ANIMS.mup = () => {
  const by = 60;
  const hx = 200;
  const k = (sy, t, hy, hxo = 4, eb = 1) => ({
    hip: [hx - 8, sy + T],
    t,
    hand: [hx + hxo, hy],
    foot: [hx - 40, sy + T + 66],
    eb,
    kb: -1,
  });
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys: [
      k(by + AR, -3, by),
      k(by + 24, -8, by),
      k(by - 10, -10, by + 16, 8, 1),
      k(by - 52, 6, by + 14, 8, 1),
    ],
    dur: 3.8,
    mus: { p: ['lats', 'chest', 'triceps'], s: ['biceps', 'abs', 'forearms'] },
  };
};
ANIMS.superman = () => {
  const hip = [130, 184];
  const a = { hip, t: 82, sb: -24, hr: [50, -14], fr: [-84, -20], hd: -8, kb: -1 };
  const b = { hip, t: 80, sb: -32, hr: [48, -22], fr: [-82, -30], hd: -10, kb: -1 };
  return {
    keys: [a, b],
    dur: 2.4,
    mus: { p: ['lowback', 'glutes'], s: ['traps', 'hamstrings', 'shoulders'] },
  };
};
ANIMS.snowangel = () => {
  const base = { hip: [130, 184], t: 84, sb: -16, fr: [-86, -8], hd: -6 };
  return {
    keys: [
      { ...base, hr: [-58, 6] },
      { ...base, hr: [-36, -34] },
      { ...base, hr: [10, -52] },
      { ...base, hr: [54, -22] },
    ],
    dur: 3.6,
    mus: { p: ['traps', 'lowback'], s: ['shoulders', 'glutes'] },
  };
};
ANIMS.ytw = () => {
  const base = { hip: [130, 184], t: 84, sb: -18, fr: [-86, -8], hd: -8 };
  return {
    keys: [
      { ...base, hr: [56, -30] },
      { ...base, hr: [4, -58] },
      { ...base, hr: [-34, -44] },
    ],
    dur: 3.6,
    mode: 'loop',
    mus: { p: ['traps', 'shoulders'], s: ['lowback', 'glutes'] },
  };
};
ANIMS.bandpull = () => {
  const hip = [180, 104];
  const k = (a) => ({ hip, t: 0, hrp: [a, 62], foot: [180, 194], ft: 0, hd: 0, eb: 1 });
  return {
    props: [['band', 100, 40, 180, 60, 250, 40]],
    keys: [k(2), k(-8)],
    dur: 2.6,
    mus: { p: ['traps', 'shoulders'], s: ['lats', 'biceps'] },
  };
};
ANIMS.squat = () => {
  const F = [150, 194];
  const up = { hip: [150, 104], t: 0, hr: [26, 6], foot: F, ft: 0 };
  const dn = { hip: [124, 150], t: 38, hr: [34, 4], foot: F, ft: 0 };
  return {
    keys: [up, dn],
    dur: 3,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'abs', 'calves'] },
  };
};
ANIMS.jumpsquat = () => {
  const F = [150, 194];
  const A = {
    hip: [124, 150],
    t: 38,
    sb: 8,
    hrp: [127, 46],
    foot: F,
    ft: 0,
    hd: -6,
    d: 0.5,
    e: 'in',
  };
  const B = {
    hip: [146, 100],
    t: 6,
    sb: -4,
    hrp: [-57, 55],
    foot: [150, 186],
    ft: 62,
    hd: -8,
    d: 0.45,
    e: 'out',
  };
  const C = {
    hip: [150, 66],
    t: 0,
    sb: -6,
    hrp: [-81, 66],
    foot: [151, 155],
    foot2: [153, 157],
    ft: 75,
    hd: -8,
    d: 0.45,
    e: 'in',
  };
  const D = { hip: [150, 110], t: 4, sb: 0, hrp: [19, 50], foot: F, ft: 15, d: 0.6, e: 'out' };
  return {
    keys: [A, B, C, D],
    mode: 'loop',
    dur: 2.4,
    mus: { p: ['quads', 'glutes', 'calves'], s: ['hamstrings', 'abs'] },
  };
};
ANIMS.tuckjump = () => {
  const F = [150, 194];
  const A = {
    hip: [124, 150],
    t: 38,
    sb: 8,
    hrp: [127, 46],
    foot: F,
    ft: 0,
    hd: -6,
    d: 0.5,
    e: 'in',
  };
  const B = {
    hip: [146, 100],
    t: 6,
    sb: -4,
    hrp: [-57, 55],
    foot: [150, 186],
    ft: 62,
    hd: -8,
    d: 0.4,
    e: 'out',
  };
  const C = {
    hip: [150, 68],
    t: 8,
    sb: 22,
    hrp: [57, 66],
    foot: [168, 110],
    foot2: [168, 110],
    ft: 20,
    hd: 6,
    d: 0.5,
    e: 'in',
  };
  const D = { hip: [150, 110], t: 4, sb: 0, hrp: [19, 50], foot: F, ft: 15, d: 0.6, e: 'out' };
  return {
    keys: [A, B, C, D],
    mode: 'loop',
    dur: 2.5,
    mus: { p: ['quads', 'hipflex', 'glutes'], s: ['abs', 'calves'] },
  };
};
ANIMS.broadjump = () => {
  const F = [150, 194];
  const A = { hip: [128, 150], t: 42, sb: 8, hrp: [137, 46], foot: F, ft: 0, d: 0.5, e: 'in' };
  const B = {
    hip: [154, 112],
    t: 64,
    sb: -4,
    hrp: [-33, 55],
    foot: [150, 186],
    ft: 60,
    d: 0.3,
    e: 'lin',
  };
  const C = {
    hip: [162, 88],
    t: 76,
    sb: -6,
    hrp: [-8, 55],
    foot: [116, 142],
    foot2: [120, 150],
    ft: 70,
    d: 0.35,
    e: 'lin',
  };
  const C2 = {
    hip: [162, 100],
    t: 62,
    sb: 10,
    hrp: [20, 53],
    foot: [196, 170],
    foot2: [194, 172],
    ft: 20,
    d: 0.35,
    e: 'out',
  };
  const D = { hip: [132, 134], t: 46, sb: 8, hrp: [24, 48], foot: F, ft: 10, d: 0.5, e: 'io' };
  return {
    keys: [A, B, C, C2, D],
    mode: 'loop',
    dur: 2.6,
    scroll: (ph) => 120 * Math.max(0, Math.min(1, (ph - 0.25) / 0.5)),
    mus: { p: ['quads', 'glutes', 'calves'], s: ['hamstrings', 'abs'] },
  };
};
ANIMS.boxjump = () => {
  const A = {
    hip: [100, 150],
    t: 38,
    sb: 8,
    hrp: [131, 46],
    foot: [120, 194],
    ft: 0,
    e: 'in',
    d: 0.6,
  };
  const B = {
    hip: [120, 104],
    t: 10,
    sb: -4,
    hrp: [-57, 55],
    foot: [124, 186],
    ft: 60,
    e: 'out',
    d: 0.5,
  };
  const C = {
    hip: [172, 66],
    t: 14,
    sb: 20,
    hrp: [55, 63],
    foot: [190, 108],
    foot2: [190, 110],
    ft: 20,
    e: 'in',
    d: 0.5,
  };
  const D = {
    hip: [204, 100],
    t: 36,
    sb: 6,
    hrp: [24, 46],
    foot: [226, 128],
    foot2: [226, 128],
    ft: 0,
    e: 'out',
    d: 0.5,
  };
  const E = {
    hip: [226, 40],
    t: 0,
    sb: 0,
    hrp: [86, 66],
    foot: [226, 128],
    foot2: [226, 128],
    ft: 0,
    e: 'io',
    d: 0.6,
  };
  return {
    props: [BOX(200, 140, 80, 60)],
    keys: [A, B, C, D, E],
    dur: 3.6,
    mus: { p: ['quads', 'glutes', 'calves'], s: ['hamstrings', 'abs'] },
  };
};
ANIMS.lunge = () => {
  const fF = [180, 194];
  const bF = [94, 187];
  const up = { hip: [144, 112], t: 3, hr: [8, 40], foot: fF, foot2: bF, ft: 0, ft2: 60 };
  const dn = { hip: [144, 146], t: 5, hr: [8, 40], foot: fF, foot2: bF, ft: 0, ft2: 60 };
  return {
    keys: [up, dn],
    dur: 3,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'calves', 'abs'], st: ['hipflex'] },
  };
};
ANIMS.bulgarian = () => {
  const fF = [196, 194];
  const bF = [100, 150];
  const up = { hip: [150, 118], t: 4, hr: [8, 40], foot: fF, foot2: bF, ft: 0, ft2: 60 };
  const dn = { hip: [148, 156], t: 8, hr: [8, 40], foot: fF, foot2: bF, ft: 0, ft2: 60 };
  return {
    props: [BOX(46, 156, 58, 44)],
    keys: [up, dn],
    dur: 3.2,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'abs', 'calves'], st: ['hipflex'] },
  };
};
ANIMS.pistol = (o = {}) => {
  const F = [140, 194];
  const up = { hip: [140, 104], t: 0, hr: [24, 6], foot: F, foot2: [186, 124], ft2: -20 };
  const dn = { hip: [112, 152], t: 42, hr: [40, 4], foot: F, foot2: [196, 150], ft2: -20 };
  if (o.assist) {
    up.hand = [197, 64];
    dn.hand = [197, 80];
    delete up.hr;
    delete dn.hr;
    up.foot2 = [180, 126];
    dn.foot2 = [190, 152];
  }
  return {
    props: o.assist ? [BOX(203, 56, 6, 144)] : [],
    keys: [up, dn],
    dur: 3.4,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'abs', 'calves'] },
  };
};
ANIMS.shrimp = () => {
  const F = [150, 194];
  const up = {
    hip: [150, 104],
    t: 0,
    hr: [34, 6],
    foot: F,
    foot2: [122, 104],
    hand2: [125, 102],
    ft2: 30,
  };
  const dn = {
    hip: [136, 152],
    t: 10,
    hr: [38, 4],
    foot: F,
    foot2: [108, 150],
    hand2: [111, 148],
    ft2: 30,
  };
  return {
    keys: [up, dn],
    dur: 3.4,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'abs', 'hipflex'] },
  };
};
ANIMS.calf = (o = {}) => {
  const dn = { hip: [160, 104], t: 0, hr: [4, 50], foot: [160, 194], ft: 0 };
  const up = { hip: [160, 94], t: 0, hr: [4, 50], foot: [167.4, 184], ft: 62 };
  if (o.single) {
    dn.foot2 = [172, 152];
    up.foot2 = [172, 142];
    dn.ft2 = 0;
    up.ft2 = 0;
    dn.hand = [196, 86];
    up.hand = [196, 80];
    delete dn.hr;
    delete up.hr;
  }
  return {
    props: o.single ? [WALL(202)] : [],
    keys: [dn, up],
    dur: 2.2,
    mus: { p: ['calves'], s: ['quads'] },
  };
};
ANIMS.bridge = (o = {}) => {
  const S = [100, 184];
  const mk = (a) => {
    const hip = [S[0] + T * Math.cos(a * deg), S[1] - T * Math.sin(a * deg)];
    return { hip, t: -(90 + a), hand: [S[0] + 70, 194], foot: [236, 194], ft: 0, hd: 0 };
  };
  const dn = mk(2);
  const up = mk(24);
  if (o.single) {
    up.foot2 = [up.hip[0] + 84, up.hip[1] - 28];
    dn.foot2 = [dn.hip[0] + 84, dn.hip[1] - 28];
  }
  return { keys: [dn, up], dur: 2.6, mus: { p: ['glutes', 'hamstrings'], s: ['lowback', 'abs'] } };
};
ANIMS.hipthrust = (o = {}) => {
  const S = [92, 136];
  const mk = (a) => {
    const hip = [S[0] + T * Math.cos(a * deg), S[1] - T * Math.sin(a * deg)];
    return { hip, t: -(90 + a), hr: [48, 4], foot: [222, 194], ft: 0 };
  };
  const dn = mk(-30);
  const up = mk(0);
  if (o.single) {
    up.foot2 = [up.hip[0] + 84, up.hip[1] - 28];
    dn.foot2 = [dn.hip[0] + 80, dn.hip[1] - 10];
  }
  return {
    props: [BOX(36, 152, 58, 48)],
    keys: [dn, up],
    dur: 2.8,
    mus: { p: ['glutes', 'hamstrings'], s: ['abs', 'quads'] },
  };
};
ANIMS.rdl = () => {
  const F = [160, 194];
  const up = { hip: [160, 104], t: 0, hr: [4, 56], foot: F };
  const dn = { hip: [140, 108], t: 82, hr: [4, 56], foot: F, foot2: [64, 108], ft2: 0 };
  return {
    keys: [up, dn],
    dur: 3.2,
    mus: { p: ['hamstrings', 'glutes'], s: ['lowback', 'calves'] },
  };
};
ANIMS.nordic = () => {
  const K = [160, 190.4];
  const top = R(K, 90, 46);
  const low = R(K, 28, 46);
  const foot = [K[0] - 40, K[1] - 14];
  const k0 = { hip: top.hip, t: top.t, hr: [16, 24], foot, hd: 0 };
  const k1 = { hip: low.hip, t: low.t, hand: [low.S[0] + 6, 195], foot, hd: 0 };
  return {
    props: [BOX(24, 150, 98, 14), BOX(24, 164, 10, 36)],
    keys: [k0, k1],
    dur: 3.4,
    mus: { p: ['hamstrings', 'glutes'], s: ['calves', 'abs'] },
  };
};
ANIMS.deadbug = () => {
  const hip = [226, 183];
  const base = { hip, t: -90, kb: -1 };
  const tab = [hip[0] + 44, hip[1] - 46];
  const a = { ...base, hr: [0, -68], hr2: [0, -68], foot: tab, foot2: tab };
  /* near arm and FAR leg reach out */
  const b = { ...base, hr: [-68, -2], hr2: [0, -68], foot: tab, foot2: [hip[0] + 90, hip[1] - 8] };
  /* far arm and NEAR leg reach out */
  const c = { ...base, hr: [0, -68], hr2: [-68, -2], foot: [hip[0] + 90, hip[1] - 8], foot2: tab };
  return {
    keys: [a, b, a, c],
    mode: 'loop',
    dur: 6,
    mus: { p: ['abs'], s: ['hipflex', 'obliques', 'shoulders'] },
  };
};
ANIMS.plankhold = () => {
  const F = [48, 186];
  const mk = (th) => {
    const r = R(F, th);
    return { hip: r.hip, t: r.t, hand: [r.S[0] + 30, 195], foot: F, hd: 0 };
  };
  const a = mk(10.2);
  const b = mk(9.4);
  return {
    keys: [a, b],
    dur: 2.4,
    mus: { p: ['abs', 'obliques'], s: ['shoulders', 'glutes', 'quads', 'lowback'] },
  };
};
ANIMS.hollow = (o = {}) => {
  const hip = [200, 184];
  const k = (u, l) => ({
    hip,
    t: -(90 - u * 0.6),
    sb: u * 0.8 + 4,
    hr: [-58, -18 - u * 0.4],
    fr: [88 * Math.cos(l * deg), -88 * Math.sin(l * deg)],
    hd: -4,
  });
  if (o.rock) {
    return {
      keys: [
        { ...k(30, 18), hip: [214, 186] },
        { ...k(8, 34), hip: [172, 186] },
      ],
      dur: 1.6,
      mus: { p: ['abs'], s: ['hipflex', 'obliques', 'quads'] },
    };
  }
  return {
    keys: [k(16, 18), k(18, 20)],
    dur: 2.4,
    mus: { p: ['abs'], s: ['hipflex', 'obliques', 'quads'] },
  };
};
ANIMS.legraise = (o = {}) => {
  const hip = [226, 183];
  const base = { hip, t: -90, hr: [-68, 4] };
  const dn = { ...base, fr: [88, -6] };
  const up = { ...base, fr: [0, -88] };
  if (o.reverse) {
    const S0 = [hip[0] - 64, hip[1]]; /* shoulders stay on the floor */
    const mk = (h, sb, f) => ({
      hip: h,
      t: solveTorso(h, sb, S0),
      sb,
      hr: [-68, 4],
      foot: [h[0] + f[0], h[1] + f[1]],
      foot2: [h[0] + f[0], h[1] + f[1]],
      kb: -1,
    });
    return {
      keys: [mk(hip, 0, [44, -46]), mk([hip[0] - 16, hip[1] - 19], 36, [24, -53])],
      dur: 2.8,
      mus: { p: ['abs'], s: ['hipflex'] },
    };
  }
  return { keys: [dn, up], dur: 3, mus: { p: ['abs', 'hipflex'], s: ['quads', 'obliques'] } };
};
ANIMS.hangraise = (o = {}) => {
  const by = 30;
  const hx = 200;
  const hand = [hx + 4, by];
  const mk = (S, t, sb, fp) => ({ shAt: S, t, sb, hand, eb: -1, kb: -1, hd: 0, frp: fp });
  const S0 = [hx - 4, by + AR];
  const dn = mk(S0, -3, -4, [90, 86]);
  let up;
  if (o.toes) {
    up = mk([hx - 12, by + AR - 8], -24, 40, [-50, 86]);
  } else if (o.knee) {
    up = mk(S0, -3, 18, [35, 58]);
  } else {
    up = mk(S0, -3, 12, [-4, 86]);
  }
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys: [dn, up],
    dur: 3,
    mus: { p: ['abs', 'hipflex'], s: ['forearms', 'lats', 'obliques'] },
  };
};
ANIMS.wiper = () => {
  const by = 30;
  const hx = 200;
  const S = [hx - 4, by + AR];
  const hand = [hx + 4, by];
  const base = { shAt: S, t: -3, sb: 12, hand, eb: -1, kb: -1, frp: [-36, 86] };
  const k = (lsw) => ({ ...base, lsw, pw: lsw * 0.3 });
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys: [k(-42), k(0), k(42)],
    dur: 3.2,
    mus: { p: ['obliques', 'abs'], s: ['hipflex', 'lats', 'forearms'] },
  };
};
ANIMS.dragon = () => {
  const S = [96, 160];
  const mk = (a) => {
    const ux = Math.cos(a * deg);
    const uy = -Math.sin(a * deg);
    return {
      shAt: S,
      t: Math.atan2(-ux, uy) / deg,
      hand: [S[0] - 36, S[1] + 8],
      hd: a * 0.8,
      fr: [88 * ux, 88 * uy],
      kb: -1,
    };
  };
  return {
    props: [BOX(50, 176, 70, 24)],
    keys: [84, 70, 56, 42, 28, 16].map(mk),
    dur: 3.8,
    mus: { p: ['abs', 'hipflex'], s: ['lats', 'lowback', 'shoulders'] },
  };
};
ANIMS.lsit = (o = {}) => {
  const hx = 190;
  const pal = o.parallettes;
  const gy = pal ? 170 : 195;
  const hand = [hx, gy];
  const S = [hx - 6, gy - 73];
  const t = 14;
  const sb = o.v ? -10 : -6;
  const hip = hipFrom(S, t, sb);
  const base = { shAt: S, t, sb, hand, eb: -1, hd: 0 };
  const L = (dx, dy, dx2, dy2) => ({
    ...base,
    foot: [hip[0] + dx, hip[1] + dy],
    foot2: [hip[0] + (dx2 == null ? dx : dx2), hip[1] + (dy2 == null ? dy : dy2)],
  });
  const kk = o.v
    ? [L(88, -4), L(80, -44)]
    : o.tuck
      ? [L(60, 4), L(62, 2)]
      : o.one
        ? [L(88, -6, 60, 4), L(88, -10, 62, 2)]
        : [L(88, -4), L(88, -10)];
  return {
    pal3: pal ? { x: hx, top: gy + 4 } : null,
    props: pal ? [BOX(hx - 14, gy + 4, 34, 6), BOX(hx - 4, gy + 10, 6, 190 - gy)] : [],
    keys: kk,
    dur: 2.4,
    mus: { p: ['abs', 'hipflex', 'triceps'], s: ['quads', 'shoulders', 'forearms'] },
  };
};
ANIMS.sideplank = (o = {}) => {
  if (o.cope) {
    const F = [40, 136];
    const r = R(F, -8);
    const hx = r.S[0] + 30;
    const mk = (d) => ({
      hip: [r.hip[0], r.hip[1] + d],
      t: r.t,
      hand: [hx, 195],
      foot: F,
      foot2: [F[0] + 8, F[1] + 32],
      hd: 0,
      eb: 1,
      kb: -1,
    });
    return {
      props: [BOX(-6, 150, 66, 8), BOX(-6, 158, 6, 42), BOX(54, 158, 6, 42)],
      keys: [mk(0), mk(-1.5)],
      dur: 2.6,
      mus: { p: ['obliques'], s: ['shoulders', 'glutes', 'abs'] },
    };
  }
  const F = [52, 186];
  const base = (th) => {
    const r = R(F, th);
    return { hip: r.hip, t: r.t, hand: [r.S[0] + 30, 195], foot: F, hd: 0, eb: 1 };
  };
  const hold = base(10);
  const kk = o.dips
    ? [base(10), { ...base(10), hip: [base(10).hip[0], base(10).hip[1] + 4], t: 80 }]
    : o.leg
      ? [
          { ...base(10), foot2: [F[0], F[1]] },
          { ...base(10), foot2: [F[0] + 4, F[1] - 52] },
        ]
      : [hold, { ...hold, hip: [hold.hip[0], hold.hip[1] - 1.5] }];
  return { keys: kk, dur: 2.6, mus: { p: ['obliques'], s: ['shoulders', 'glutes', 'abs'] } };
};
ANIMS.flag = (o = {}) => {
  const px = 120;
  const y = 78;
  const base = {
    hip: [px + 8 + T, y],
    t: -90,
    hand: [px + 4, y + 34],
    hand2: [px + 4, y - 36],
    hd: 0,
    eb: 1,
    kb: -1,
  };
  const mk = o.tuck
    ? { ...base, foot: [px + 8 + T + 34, y + 30], foot2: [px + 8 + T + 34, y + 30] }
    : { ...base, foot: [px + 8 + T + 88, y + 2], foot2: [px + 8 + T + 88, y + 2] };
  return {
    vb: [40, -10, 330, 202],
    props: [['pole', px]],
    keys: [mk, { ...mk, hip: [mk.hip[0], mk.hip[1] - 3] }],
    dur: 2.4,
    mus: { p: ['obliques', 'lats'], s: ['shoulders', 'abs', 'forearms'] },
  };
};
ANIMS.handstand = (o = {}) => {
  const hx = 190;
  const gy = 195;
  const shy = gy - AR;
  const mk = (dx, tl) => {
    const t = 180 + tl;
    const d = dirv(t);
    return {
      hip: [hx + dx, shy - T],
      t,
      sb: o.back ? -14 : o.free ? -3 : 4,
      hand: [hx, gy],
      fr: [-d[0] * 88, -d[1] * 88],
      hd: 8,
      eb: -1,
    };
  };
  const keys = o.free ? [mk(5, -2), mk(-5, 2)] : [mk(1, 6), mk(2, 6)];
  const props = o.free ? [] : [['wall', hx + 27, 'R']];
  return {
    vb: [60, -40, 330, 252],
    props,
    keys,
    dur: 2.6,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'forearms'] },
  };
};
ANIMS.chest2wall = () => {
  const hx = 170;
  const S = [hx + 6, 195 - AR + 2];
  const mk = (t) => {
    const hip = hipFrom(S, t, 8);
    const d = dirv(t);
    return {
      shAt: S,
      t,
      sb: 8,
      hand: [hx, 195],
      foot: [hip[0] - d[0] * 88, hip[1] - d[1] * 88],
      hd: 10,
      eb: 1,
    };
  };
  return {
    props: [['wall', 134, 'L']],
    keys: [mk(170), mk(167)],
    dur: 2.6,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'forearms'] },
  };
};
ANIMS.wallplank = () => {
  const WX = 88;
  const SY = 133;
  const L = 154;
  const hand = [257, 195];
  const mk = (y, d) => {
    const F = [WX, y];
    const sx = WX + Math.sqrt(L * L - (SY - y) * (SY - y));
    const S = [sx, SY];
    const t = (Math.atan2(S[0] - F[0], -(S[1] - F[1])) * 180) / Math.PI;
    return { shAt: S, t, sb: 0, hand, foot: F, ft: 0, eb: 1, hd: 4, d };
  };
  return {
    props: [['wall', 76, 'L']],
    keys: [mk(190, 0.7), mk(150, 0.7), mk(112, 0.7), mk(96, 1.6), mk(96, 0.1)],
    dur: 6,
    mus: { p: ['shoulders', 'abs'], s: ['triceps', 'chest', 'quads'] },
  };
};
ANIMS.kickup = () => {
  const hx = 170;
  const S = [hx + 2, 126];
  const hand = [hx, 195];
  const body = (t, sb) => {
    const d = dirv(t);
    return {
      shAt: S,
      t,
      sb,
      hand,
      hd: 8,
      eb: -1,
      kb: -1,
      fr: [-d[0] * 88, -d[1] * 88],
      fr2: [-d[0] * 70 - 8, -d[1] * 70 - 14],
    };
  };
  const A = {
    shAt: S,
    t: 72,
    sb: 0,
    hand,
    hd: 8,
    eb: -1,
    kb: -1,
    foot: [hx - 100, 188],
    fr2: [-74, -28],
    ft: 0,
  };
  const ts = [95, 118, 141, 164, 190];
  return {
    props: [['wall', hx + 40, 'R']],
    keys: [A, ...ts.map((t, i) => body(t, -i * 2))],
    dur: 4.4,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'quads'] },
  };
};
ANIMS.hswalk = () => {
  const gy = 195;
  const hx = 180;
  const k = (xR, yR, xL, yL, bob, legs) => ({
    hip: [hx, gy - AR - T + bob],
    t: 180,
    hand: [hx + xR, gy - yR],
    hand2: [hx + xL, gy - yL],
    foot: [hx + 14 + legs, gy - AR - T - 82 + bob],
    foot2: [hx - 8 - legs, gy - AR - T - 84 + bob],
    hd: 8,
  });
  /* the planted hand slides back as the body moves on, the other hand lifts, swings through and lands in front */
  return {
    vb: [60, -40, 330, 252],
    keys: [
      k(-12, 0, 28, 0, 0, 0),
      k(8, 16, 8, 0, -2, 7),
      k(28, 0, -12, 0, 0, 0),
      k(8, 0, 8, 16, -2, -7),
    ],
    mode: 'loop',
    dur: 4,
    scroll: (ph) => 80 * ph,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'forearms'] },
  };
};
ANIMS.hsshoulder = () => {
  const hx = 190;
  const gy = 195;
  const sh = gy - AR;
  const base = {
    hip: [hx, gy - AR - T],
    t: 180,
    eb: -1,
    hd: 6,
    foot: [hx + 32, gy - AR - T - 82],
    foot2: [hx + 32, gy - AR - T - 82],
    hand: [hx, gy],
    hand2: [hx, gy],
    hzr: 21,
    hzl: -21,
    zsh: 0,
  };
  /* weight over the right hand: the left hand reaches up to the right shoulder; then the mirror image */
  const tapL = { ...base, zsh: 8, hzr: 21, hzl: 27, hand2: [hx, sh + 6] };
  const tapR = { ...base, zsh: -8, hzl: -21, hzr: -27, hand: [hx, sh + 6] };
  return {
    vb: [60, -40, 330, 252],
    props: [WALL(224)],
    keys: [base, tapL, base, tapR],
    mode: 'loop',
    dur: 6,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'forearms'] },
  };
};
ANIMS.headstand = (o = {}) => {
  const hx = 190;
  const gy = 200;
  const sh = [hx, gy - 11 - 17];
  const hand = o.forearm ? [hx + 2, gy - 10] : [hx + 28, gy - 4];
  const k = (d) => {
    const hip = [hx + d, sh[1] - T];
    const base = { hip, t: 180, hand, hd: 0, eb: o.forearm ? -1 : -1, kb: -1 };
    if (o.tuck) {
      return { ...base, foot: [hx + d + 14, hip[1] - 36], foot2: [hx + d + 14, hip[1] - 36] };
    }
    if (o.wall) {
      return { ...base, foot: [hx + d + 36, hip[1] - 78], foot2: [hx + d + 36, hip[1] - 78] };
    }
    return { ...base, foot: [hx + d, hip[1] - 88], foot2: [hx + d, hip[1] - 88] };
  };
  return {
    vb: [80, -20, 300, 245],
    props: o.wall ? [['wall', hx + 46, 'R']] : [],
    keys: [k(0), k(o.wall ? 1 : 3)],
    dur: 2.6,
    mus: { p: ['shoulders', 'traps', 'abs'], s: ['triceps', 'lowback'] },
  };
};
ANIMS.dolphin = () => {
  const H = [232, 194];
  const f = [132, 192];
  const k = (dx, dy) => ({
    hip: [160 + dx, 108 + dy],
    t: 140,
    sb: 6,
    hand: H,
    foot: f,
    hd: 22,
    eb: 1,
    kb: -1,
  });
  return {
    keys: [k(0, 0), k(3, -2)],
    dur: 3.2,
    mus: { p: ['shoulders', 'traps'], s: ['abs', 'triceps'], st: ['hamstrings', 'calves', 'lats'] },
  };
};
ANIMS.tripodfrog = () => {
  const H = [190, 195];
  const S = [206, 173];
  const sb = 24;
  const E = AN.ik(S, H, 36, 34, 1).mid;
  const K = [(S[0] + E[0]) / 2 + 2, (S[1] + E[1]) / 2 - 12];
  const leg = legOnKnee(K, 215, 165);
  const t = solveTorso(leg.hip, sb, S);
  const aHead = Math.atan2(0.37, -0.93) / deg;
  const k = {
    hip: leg.hip,
    t,
    sb,
    hand: H,
    foot: leg.foot,
    foot2: leg.foot2,
    kb: leg.kb,
    hd: aHead - (t + sb),
    eb: 1,
  };
  return {
    keys: [k, { ...k, hip: [k.hip[0] - 1.5, k.hip[1] + 1] }],
    dur: 2.8,
    mus: { p: ['shoulders', 'abs', 'forearms'], s: ['triceps', 'hipflex', 'traps'] },
  };
};
ANIMS.crow = (o = {}) => {
  const hx = 190;
  const gy = 195;
  const H = o.elbow ? [hx - 10, gy] : o.frog ? [hx - 22, gy] : o.crane ? [hx, gy] : [hx - 16, gy];
  if (o.elbow) {
    const S = [hx + 41, gy - 38.3];
    const hip = [S[0] - T, S[1]];
    const k = {
      hip,
      t: 90,
      sb: 0,
      hand: H,
      foot: [hip[0] - 88, hip[1] + 3],
      foot2: [hip[0] - 88, hip[1] + 3],
      hd: -12,
      eb: 1,
      kb: -1,
    };
    return {
      keys: [k, { ...k, hip: [hip[0], hip[1] - 1.5] }],
      dur: 2.6,
      mus: { p: ['forearms', 'shoulders', 'abs'], s: ['triceps', 'hipflex', 'chest'] },
    };
  }
  const cfg = o.crane
    ? { S: [hx + 10, gy - 69], kOff: [-8, 4], phi: 212, shin: 150, sb: 30 }
    : o.frog
      ? { S: [hx + 14, gy - 44], kOff: [0, -12], phi: 190, shin: 165, sb: 28 }
      : { S: [hx + 14, gy - 52], kOff: [-2, -10], phi: 205, shin: 150, sb: 26 };
  const E = AN.ik(cfg.S, H, 36, 34, 1).mid;
  const mid = [(cfg.S[0] + E[0]) / 2, (cfg.S[1] + E[1]) / 2];
  const K = o.crane
    ? [mid[0] + cfg.kOff[0], mid[1] + cfg.kOff[1]]
    : [E[0] + cfg.kOff[0] + 8, E[1] + cfg.kOff[1]];
  const leg = legOnKnee(K, cfg.phi, cfg.shin);
  const t = solveTorso(leg.hip, cfg.sb, cfg.S);
  const k = {
    hip: leg.hip,
    t,
    sb: cfg.sb,
    hand: H,
    foot: leg.foot,
    foot2: leg.foot2,
    kb: leg.kb,
    hd: -20,
    eb: 1,
  };
  return {
    keys: [k, { ...k, hd: -24 }],
    dur: 2.6,
    mus: { p: ['forearms', 'shoulders', 'abs'], s: ['triceps', 'hipflex', 'chest'] },
  };
};
ANIMS.planche = (o = {}) => {
  const hx = 190;
  const gy = 195;
  const hand = [hx, gy];
  if (!o.type) {
    const L1 = R([40, 186], 6.5);
    const pl = { hip: L1.hip, t: L1.t, sb: 8, hand: [L1.S[0] - 42, 195], foot: [40, 186], hd: 6 };
    return {
      keys: [pl, { ...pl, hip: [L1.hip[0] + 4, L1.hip[1] + 2], t: L1.t + 2 }],
      dur: 2.6,
      mus: { p: ['shoulders', 'chest'], s: ['abs', 'forearms', 'triceps'] },
    };
  }
  const mk = (S, t, sb, legs) => {
    const hip = hipFrom(S, t, sb);
    return { shAt: S, t, sb, hand, hd: 0, eb: 1, ...legs(hip) };
  };
  const sel = {
    tuck: mk([hx + 26, gy - 66], 80, 34, (h) => ({
      foot: [h[0] - 6, h[1] + 24],
      foot2: [h[0] - 6, h[1] + 24],
      kb: -1,
    })),
    adv: mk([hx + 30, gy - 66], 86, 16, (h) => ({
      foot: [h[0] - 40, h[1] + 12],
      foot2: [h[0] - 40, h[1] + 12],
      kb: -1,
    })),
    straddle: mk([hx + 46, gy - 52], 90, 0, (h) => ({
      foot: [h[0] - 86, h[1] - 6],
      foot2: [h[0] - 84, h[1] + 8],
    })),
    full: mk([hx + 50, gy - 50], 90, 0, (h) => ({
      foot: [h[0] - 88, h[1]],
      foot2: [h[0] - 88, h[1]],
    })),
  }[o.type];
  return {
    keys: [sel, { ...sel, shAt: [sel.shAt[0], sel.shAt[1] + 2] }],
    dur: 2.6,
    mus: { p: ['shoulders', 'chest', 'abs'], s: ['forearms', 'triceps', 'hipflex'] },
  };
};
ANIMS.lever = (o = {}) => {
  const by = 30;
  const hx = 200;
  const S = [hx, by + AR - 3];
  const hand = [hx, by];
  const mk = (t, sb, fr, extra = {}) => ({
    shAt: S,
    t,
    sb,
    hand,
    eb: -1,
    kb: -1,
    hd: -8,
    fr,
    ...extra,
  });
  const L = {
    skin: [
      [-3, 0, 88],
      [-45, 8, 88],
      [-95, 16, 86],
      [-135, 24, 78],
      [-165, 28, 66],
    ].map(([t, sb, L]) => {
      const d = dirv(t);
      return mk(t, sb, [-d[0] * L, -d[1] * L], { hd: Math.min(14, -t / 10) });
    }),
    tuck: [mk(-90, 20, [-18, 58], { kb: 1 })],
    adv: [mk(-90, 8, [-14, 56], { kb: 1 })],
    straddle: [mk(-90, 0, [86, 6], { fr2: [84, -8] })],
    full: [mk(-90, 0, [88, 2])],
    back: [mk(90, -8, [-88, 4], { hd: 12, eb: 1 })],
  }[o.type || 'tuck'];
  const keys = L.length === 1 ? [L[0], { ...L[0], shAt: [S[0], S[1] + 2] }] : L;
  return {
    vb: HV,
    noFloor: true,
    props: [['bar', hx, by]],
    keys,
    dur: 2.8,
    mus: { p: ['lats', 'abs'], s: ['shoulders', 'forearms', 'biceps', 'hipflex'] },
  };
};
ANIMS.armcircle = () => {
  const hip = [180, 104];
  /* the arm angle runs 90 (down) -> 0 (forward) -> -90 (up) -> -180 (back) -> -270 (down again); the loop plays it back for the reverse circle */
  const mk = (a) => ({ hip, t: 0, hrp: [a, 66], foot: [180, 194] });
  return {
    keys: [90, 45, 0, -45, -90, -135, -180, -225, -270].map(mk),
    mode: 'yoyo',
    dur: 7,
    mus: { p: ['shoulders'], s: ['traps', 'triceps'] },
  };
};
ANIMS.catcow = () => {
  const hand = [180, 195];
  const hip = [112, 147];
  const target = [176, 132];
  const solveT = (sb) => {
    let best = 0;
    let bd = 1e9;
    for (let t = 20; t <= 130; t += 0.5) {
      const p = AN.shoulderOf(hip, t, sb);
      const d = Math.hypot(p[0] - target[0], p[1] - target[1]);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    return best;
  };
  const mk = (sb, hd) => ({ hip, t: solveT(sb), sb, hand, foot: [64, 190], hd, kb: -1, eb: 1 });
  return {
    keys: [mk(-30, 30), mk(46, -36)],
    dur: 3.6,
    mus: { p: ['lowback', 'abs'], s: ['traps'], st: ['lowback'] },
  };
};
ANIMS.dislocate = () => {
  const hip = [180, 104];
  const foot = [180, 194];
  const k = (a, l) => ({ hip, t: 0, hrp: [a, l], foot });
  return {
    keys: [k(79, 51), k(-64, 55), k(-122, 57), k(-208, 59)],
    dur: 4.4,
    mus: { p: ['shoulders'], s: ['traps', 'chest'], st: ['chest'] },
  };
};
ANIMS.greatest = () => {
  const base = {
    hip: [135, 152],
    t: 70,
    hand: [196, 195],
    foot: [62, 187],
    foot2: [200, 194],
    ft: 30,
    eb: 1,
    kb: -1,
    hd: 6,
  };
  const sh = AN.shoulderOf(base.hip, base.t, 0);
  const dx = base.hand[0] - sh[0];
  const dy = base.hand[1] - sh[1];
  const down = {
    ...base,
    hrp2: [(Math.atan2(dy, dx) * 180) / Math.PI, Math.min(68, Math.hypot(dx, dy))],
  };
  const up = { ...base, hrp2: [-88, 68], t: 66, sb: -8, hd: -10, tw: 78, pw: 14, hyw: 40 };
  return {
    keys: [down, { ...down }, up, { ...up }],
    mode: 'loop',
    dur: 6,
    mus: { p: ['hipflex', 'obliques'], s: ['hamstrings', 'glutes'], st: ['hipflex', 'chest'] },
  };
};
ANIMS.wrist = () => {
  const hand = [180, 195];
  const mk = (sx) => ({ shAt: [sx, 132], t: 76, hand, foot: [76, 190], hd: 6, kb: -1 });
  return {
    keys: [mk(166), mk(194)],
    dur: 2.8,
    mus: { p: ['forearms'], st: ['forearms'], s: ['shoulders'] },
  };
};
ANIMS.hipcircle = () => {
  const R = 17;
  const mk = (th) => {
    const c = Math.cos((th * Math.PI) / 180);
    const si = Math.sin((th * Math.PI) / 180);
    return {
      hip: [180 + R * c, 110 + 2 * si],
      t: -c * 6,
      hr: [8, 58],
      hr2: [-2, 58],
      foot: [180, 194],
      psh: R * si,
      hps: 1,
      pw: -si * 14,
      rl: -si * 5,
    };
  };
  return {
    keys: [0, 45, 90, 135, 180, 225, 270, 315, 360, 315, 270, 225, 180, 135, 90, 45].map(mk),
    mode: 'loop',
    dur: 11,
    mus: { p: ['glutes', 'obliques'], s: ['hipflex', 'lowback'] },
  };
};
ANIMS.jacks = () => {
  const A = {
    hip: [180, 108],
    t: 0,
    hr: [4, 56],
    foot: [172, 194],
    foot2: [188, 194],
    d: 0.5,
    e: 'out',
  };
  const J1 = {
    hip: [180, 90],
    t: 0,
    hr: [30, -8],
    foot: [167, 176],
    foot2: [193, 176],
    ft: 45,
    d: 0.5,
    e: 'in',
  };
  const B = {
    hip: [180, 108],
    t: 0,
    hr: [34, -34],
    hr2: [34, -34],
    foot: [156, 194],
    foot2: [204, 194],
    d: 0.5,
    e: 'out',
  };
  const J2 = {
    hip: [180, 90],
    t: 0,
    hr: [30, -8],
    foot: [169, 176],
    foot2: [191, 176],
    ft: 45,
    d: 0.5,
    e: 'in',
  };
  return {
    keys: [A, J1, B, J2],
    mode: 'loop',
    dur: 1.2,
    mus: { p: ['shoulders', 'calves'], s: ['quads', 'glutes'] },
  };
};
ANIMS.child = () => {
  const mk = (sb, dx) => {
    const hip = [60 + dx, 172];
    const t = 84;
    const S = AN.shoulderOf(hip, t, sb);
    return { hip, t, sb, hand: [S[0] + 66, 194], foot: [56, 190], hd: 4, kb: -1, eb: 1 };
  };
  return {
    keys: [mk(20, 0), mk(26, 1)],
    dur: 3.6,
    mus: { st: ['lats', 'lowback', 'glutes'], s: ['shoulders'] },
  };
};
ANIMS.cobra = () => {
  const hand = [186, 195];
  const lo = { hip: [108, 181], t: 80, sb: -10, hand, foot: [22, 186], hd: 0 };
  const hi = { hip: [108, 181], t: 62, sb: -34, hand, foot: [22, 186], hd: -14 };
  return {
    keys: [lo, hi],
    dur: 3.2,
    mus: { st: ['abs', 'hipflex'], p: ['lowback'], s: ['triceps'] },
  };
};
ANIMS.couch = () => {
  const mk = (dx, dy) => ({
    hip: [150 + dx, 158 + dy],
    t: 0,
    hr: [40, 50],
    foot: [192, 194],
    foot2: [108, 148],
    ft2: 90,
    eb: 1,
    kb: -1,
  });
  return {
    props: [BOX(56, 120, 48, 80)],
    keys: [mk(0, 0), mk(6, 4)],
    dur: 3.4,
    mus: { st: ['hipflex', 'quads'], s: ['glutes'] },
  };
};
ANIMS.hamstretch = () => {
  const a = {
    hip: [190, 182],
    t: 28,
    sb: 36,
    hr: [67, 12],
    foot: [278, 190],
    foot2: [278, 190],
    hd: 20,
    eb: 1,
  };
  const b = {
    hip: [190, 182],
    t: 38,
    sb: 42,
    hr: [67, 14],
    foot: [278, 190],
    foot2: [278, 190],
    hd: 24,
    eb: 1,
  };
  return {
    keys: [a, b],
    dur: 3.6,
    mus: { st: ['hamstrings', 'lowback', 'calves'], s: ['hipflex'] },
  };
};
ANIMS.chestdoor = () => {
  const A = {
    hip: [170, 106],
    t: 0,
    hr: [4, 66],
    hand2: [168, 8],
    foot: [170, 194],
    foot2: [170, 194],
    hd: 0,
    eb: 1,
    kb: -1,
  };
  const B = { ...A, tw: -62, pw: -12, hyw: -30, hd: -4 };
  return {
    props: [['wallz', -62]],
    keys: [A, { ...A }, B, { ...B }],
    mode: 'loop',
    dur: 6,
    mus: { st: ['chest', 'biceps', 'shoulders'], s: ['forearms'] },
  };
};
ANIMS.deepsquat = () => {
  const F = [150, 194];
  const a = { hip: [122, 158], t: 26, hr: [32, 18], foot: F, ft: 0 };
  return {
    keys: [a, { ...a, hip: [122, 154] }],
    dur: 3.2,
    mus: { st: ['glutes', 'calves', 'lowback'], s: ['quads', 'hipflex'] },
  };
};
ANIMS.lat = () => {
  const a = { hip: [110, 104], t: 78, hand: [214, 78], foot: [110, 194], hd: 18, eb: 1 };
  return {
    props: [WALL(218)],
    keys: [a, { ...a, hip: [104, 106], t: 82 }],
    dur: 3.4,
    mus: { st: ['lats', 'shoulders'], s: ['triceps'] },
  };
};
ANIMS.balance1 = () => {
  const F = [150, 194];
  const a = {
    hip: [150, 104],
    t: 0,
    hr: [-34, 20],
    hr2: [34, 20],
    foot: F,
    foot2: [186, 118],
    ft2: -10,
  };
  const b = {
    hip: [152, 104],
    t: 1,
    hr: [-36, 14],
    hr2: [36, 14],
    foot: F,
    foot2: [188, 116],
    ft2: -10,
  };
  return {
    keys: [a, b],
    dur: 2.8,
    mus: { p: ['glutes', 'calves'], s: ['quads', 'abs', 'obliques'] },
  };
};
ANIMS.airplane = () => {
  const F = [160, 194];
  const a = {
    hip: [152, 104],
    t: 82,
    hr: [-10, 56],
    hr2: [-10, 56],
    foot: F,
    foot2: [64, 100],
    ft2: 0,
    hd: -24,
  };
  return {
    keys: [a, { ...a, hip: [154, 105], t: 84 }],
    dur: 2.8,
    mus: { p: ['hamstrings', 'glutes', 'lowback'], s: ['calves', 'abs'] },
  };
};
ANIMS.sit = () => ({ keys: [{ hip: [180, 190], t: 0, hr: [4, 56], foot: [264, 192] }], dur: 2 });

/* ===== Stretches ===== */
const STAND = { hip: [160, 104], t: 0, foot: [160, 194], hd: 0, eb: 1, kb: -1 };
ANIMS.neck = () => {
  const N = { ...STAND, hr: [2, 68], d: 0.5 };
  return {
    keys: [N, { ...N, hd: 40 }, N, { ...N, hd: -26 }, N, { ...N, hrl: 34 }, N, { ...N, hrl: -34 }],
    mode: 'loop',
    dur: 12,
    mus: { st: ['neck'], s: ['traps'] },
  };
};
ANIMS.shoulderroll = () => {
  const k = (so) => ({ ...STAND, hr: [2, 68], so, hd: 0 });
  return {
    keys: [k([0, -9]), k([-6, -3]), k([0, 4]), k([5, -3])],
    dur: 3.2,
    mode: 'loop',
    mus: { p: ['shoulders', 'traps'], st: ['neck'] },
  };
};
ANIMS.reachup = () => {
  const up = { ...STAND, t: -2, sb: -8, hrp: [-84, 66], hd: -10 };
  return {
    keys: [{ ...STAND, hrp: [86, 68] }, up, { ...up, rl: 15 }, up, { ...up, rl: -15 }, up],
    mode: 'loop',
    dur: 9,
    mus: { st: ['lats', 'abs', 'obliques'], p: ['shoulders'] },
  };
};
ANIMS.fold = () => {
  const F = [150, 194];
  const up = { hip: [150, 106], t: 0, hr: [2, 68], foot: F, hd: 0, eb: 1, kb: -1 };
  const dn = {
    hip: [140, 112],
    t: 135,
    sb: 25,
    hand: [176, 224 - 40],
    foot: F,
    hd: 20,
    eb: 1,
    kb: -1,
  };
  return {
    keys: [up, dn],
    dur: 4.2,
    mus: { st: ['hamstrings', 'lowback', 'calves'], s: ['quads'] },
  };
};
ANIMS.dog = () => {
  const base = { hip: [152, 112], t: 112, hand: [228, 195], hd: 15, eb: 1, kb: -1 };
  const A = { ...base, foot: [118, 174], foot2: [108, 190] };
  const B = { ...base, foot: [108, 190], foot2: [118, 174], hip: [154, 111] };
  return {
    keys: [A, B],
    mode: 'loop',
    dur: 3.4,
    mus: { st: ['hamstrings', 'calves', 'lats'], p: ['shoulders'] },
  };
};
ANIMS.lowlunge = () => {
  const a = {
    hip: [140, 158],
    t: 2,
    hr: [40, 50],
    foot: [196, 194],
    foot2: [60, 186],
    ft2: 20,
    eb: 1,
    kb: -1,
  };
  const b = { ...a, hip: [146, 160] };
  return { keys: [a, b], dur: 3.4, mus: { st: ['hipflex', 'quads'], s: ['glutes', 'abs'] } };
};
ANIMS.quadstr = () => {
  const mk = (dx) => ({
    hip: [150 + dx, 104],
    t: 0,
    hr: [32, 10],
    foot: [150, 194],
    foot2: [128 + dx, 106],
    hand2: [128 + dx, 106],
    eb: 1,
    kb: -1,
    ft2: -10,
  });
  return {
    props: [['wall', 190, 'R']],
    keys: [mk(0), mk(4)],
    dur: 3.4,
    mus: { st: ['quads', 'hipflex'], s: ['glutes'] },
  };
};
ANIMS.calfwall = () => {
  const mk = (dx) => ({
    hip: [146 + dx, 118 + dx * 0.3],
    t: 50,
    hand: [246, 72],
    foot: [170, 194],
    foot2: [104, 190],
    eb: 1,
    kb: -1,
  });
  return {
    props: [['wall', 252, 'R']],
    keys: [mk(0), mk(4)],
    dur: 3.4,
    mus: { st: ['calves', 'hamstrings'], s: ['quads', 'shoulders'] },
  };
};
ANIMS.chestopen = () => ({
  keys: [
    { ...STAND, hr: [-12, 66] },
    { ...STAND, t: -2, sb: -10, hr: [-46, 36], hd: -12 },
  ],
  dur: 3.6,
  mus: { st: ['chest', 'shoulders', 'biceps'], p: ['traps'] },
});
ANIMS.tricepstr = () => {
  const mk = (t, dx, dy) => {
    const S = AN.shoulderOf(STAND.hip, t, 0);
    const hand = [S[0] + dx, S[1] + dy];
    const E = AN.ik(S, hand, 36, 34, 1).mid;
    return { ...STAND, t, hand, hand2: [E[0] + 1, E[1] - 1], hd: 4 + t, eb: 1 };
  };
  return {
    keys: [mk(0, -9, -26), mk(-4, -11, -24)],
    dur: 3.4,
    mus: { st: ['triceps', 'lats'], s: ['shoulders', 'obliques'] },
  };
};
ANIMS.wristflex = () => {
  const a = { ...STAND, hr: [58, 0], hr2: [62, -4], ft: 0 };
  const b = { ...STAND, hr: [58, 8], hr2: [62, 6] };
  return { keys: [a, b], dur: 3, mus: { st: ['forearms'], s: ['shoulders'] } };
};
ANIMS.seatedcc = () => {
  const base = {
    hip: [150, 140],
    t: 0,
    hand: [186, 124],
    foot: [198, 194],
    foot2: [198, 194],
    eb: 1,
    kb: -1,
  };
  return {
    props: [BOX(114, 156, 70, 44)],
    keys: [
      { ...base, sb: -28, hd: 24 },
      { ...base, t: 4, sb: 36, hd: -28 },
    ],
    dur: 3.6,
    mus: { st: ['lowback', 'chest'], s: ['abs'] },
  };
};
ANIMS.pigeon = () => {
  const common = { foot: [146, 189], foot2: [52, 187], ft2: 20, eb: 1, kb: -1 };
  const hip = [140, 167];
  const reach = (t, sb) => {
    const S = AN.shoulderOf(hip, t, sb);
    const dy = 194 - S[1];
    const dx = Math.sqrt(Math.max(0, 68 * 68 - dy * dy));
    return [S[0] + dx, 194];
  };
  const key = (u) => {
    const t = 45 + 37 * u;
    const sb = 24 * u;
    return { hip, t, sb, hand: reach(t, sb), hd: 4 + 16 * u, ...common };
  };
  return {
    keys: [0, 0.25, 0.5, 0.75, 1].map(key),
    dur: 4,
    mus: { st: ['glutes', 'hipflex'], s: ['quads'] },
  };
};
ANIMS.fig4 = () => {
  const hip = [220, 182];
  const mk = (f2, hr) => ({
    hip,
    t: -90,
    foot2: [hip[0] + f2[0], hip[1] + f2[1]],
    foot: [hip[0] - 13, hip[1] - 44],
    hr,
    eb: 1,
    kb: -1,
  });
  return {
    keys: [mk([14, -70], [40, -34]), mk([8, -64], [34, -30])],
    dur: 3.6,
    mus: { st: ['glutes', 'hamstrings'], s: ['abs'] },
  };
};
ANIMS.kneeschest = () => {
  const hip = [220, 182];
  const mk = (f, hr, rk) => ({
    hip,
    t: -90,
    foot: [hip[0] + f[0], hip[1] + f[1]],
    foot2: [hip[0] + f[0], hip[1] + f[1]],
    hr,
    eb: 1,
    kb: -1,
    rk,
  });
  const A = mk([10, -66], [42, -40], 0);
  return {
    keys: [A, mk([8, -64], [41, -40], 17), A, mk([8, -64], [41, -40], -17)],
    mode: 'loop',
    dur: 6,
    mus: { st: ['lowback', 'glutes'], s: ['abs'] },
  };
};
ANIMS.legsupwall = () => {
  const hip = [212, 182];
  const mk = (dx) => ({
    hip,
    t: -90,
    foot: [hip[0] + 14 + dx, hip[1] - 86],
    foot2: [hip[0] + 14 + dx, hip[1] - 86],
    hr: [64, 4],
    eb: 1,
    kb: -1,
    ft: 80,
  });
  return {
    props: [['wall', 234, 'R']],
    keys: [mk(0), mk(1)],
    dur: 3.4,
    mus: { st: ['hamstrings', 'calves'], s: ['lowback'] },
  };
};
ANIMS.wallangel = () => {
  const lo = { hip: [172, 104], t: 0, hand: [213, 12], foot: [178, 194], hd: -4, eb: 1, kb: -1 };
  const mid = { hip: [176, 104], t: 1.5, hand: [213, -8], foot: [178, 194], hd: -6, eb: 1, kb: -1 };
  const hi = { hip: [180, 104], t: 3, hand: [212, -24], foot: [178, 194], hd: -8, eb: 1, kb: -1 };
  return {
    props: [['wall', 219, 'R']],
    keys: [lo, mid, hi],
    dur: 3.6,
    mus: { p: ['traps', 'shoulders'], st: ['chest', 'lats'] },
  };
};

/* ===== More stretches (added with the random routines) ===== */
ANIMS.crossbody = () => {
  /* one arm straight across the chest, the other hand draws it in at the elbow */
  const S = AN.shoulderOf(STAND.hip, 0, 0);
  const mk = (pull, hd) => ({
    ...STAND,
    hrp: [3, 66 - pull],
    hand2: [S[0] + 33 - pull * 0.4, S[1] + 6],
    hzr: -17 - pull,
    hzl: -12 - pull * 1.2,
    hyw: -28,
    hd,
  });
  return {
    keys: [mk(0, 0), mk(6, 2)],
    dur: 3.6,
    mus: { st: ['shoulders', 'traps'], s: ['triceps'] },
  };
};
ANIMS.neckturn = () => {
  const N = { ...STAND, hr: [2, 68], d: 0.5 };
  return {
    keys: [N, { ...N, hyw: 62, hd: 6 }, N, { ...N, hyw: -62, hd: 6 }],
    mode: 'loop',
    dur: 10,
    mus: { st: ['neck'], s: ['traps'] },
  };
};
ANIMS.wristext = () => {
  /* arm out in front with the palm down; the other hand eases the fingers toward you */
  const a = { ...STAND, hr: [60, 4], hr2: [58, -4] };
  const b = { ...STAND, hr: [58, 12], hr2: [57, 4] };
  return { keys: [a, b], dur: 3.2, mus: { st: ['forearms'], s: ['shoulders'] } };
};
ANIMS.sphinx = () => {
  /* lying on the belly, propped on the forearms: the elbows sit under the shoulders */
  const hip = [108, 182];
  const floor = 192;
  const solve = (sb, y) => {
    let best = 70;
    let bd = 1e9;
    for (let t = 40; t <= 100; t += 0.5) {
      const p = AN.shoulderOf(hip, t, sb);
      const d = Math.abs(p[1] - y);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    return best;
  };
  const sbH = -28;
  const tH = solve(sbH, 150);
  const SH = AN.shoulderOf(hip, tH, sbH);
  const hand = [SH[0] + 34, floor];
  const hi = { hip, t: tH, sb: sbH, hand, hand2: hand, foot: [22, 185], hd: -12, eb: 1, kb: -1 };
  const sbL = -10;
  const tL = solve(sbL, 158);
  const lo = { ...hi, t: tL, sb: sbL, hd: -4 };
  return {
    keys: [lo, hi],
    dur: 3.6,
    mus: { st: ['abs', 'hipflex'], p: ['lowback'], s: ['triceps'] },
  };
};
ANIMS.happybaby = () => {
  /* on your back, knees wide and bent, holding the outsides of your feet */
  const hip = [220, 182];
  const mk = (f, rk) => {
    const foot = [hip[0] + f[0], hip[1] + f[1]];
    return {
      hip,
      t: -90,
      foot,
      foot2: foot,
      hand: foot,
      hand2: foot,
      eb: 1,
      kb: -1,
      rk,
      ft: -80,
      ft2: -80,
    };
  };
  return {
    keys: [mk([-14, -46], 0), mk([-16, -44], 14), mk([-14, -46], 0), mk([-16, -44], -14)],
    mode: 'loop',
    dur: 6,
    mus: { st: ['glutes', 'hamstrings'], s: ['lowback', 'abs'] },
  };
};
ANIMS.lyingtwist = () => {
  /* on your back, knees bent and dropped to one side, arms out wide, head turned the other way */
  const hip = [220, 182];
  const S = AN.shoulderOf(hip, -90, 0);
  const base = {
    hip,
    t: -90,
    hand: [S[0] - 4, 194],
    hand2: [S[0] - 4, 194],
    foot: [hip[0] + 24, hip[1] - 52],
    foot2: [hip[0] + 24, hip[1] - 52],
    hzr: 52,
    hzl: -52,
    eb: 1,
    kb: -1,
  };
  const k = (lsw, hyw) => ({ ...base, lsw, pw: lsw * 0.35, hyw });
  return {
    keys: [k(0, 0), k(82, -42), k(82, -42), k(0, 0), k(-82, 42), k(-82, 42)],
    mode: 'loop',
    dur: 10,
    mus: { st: ['obliques', 'lowback', 'glutes'], s: ['chest'] },
  };
};
ANIMS.seatedtwist = () => {
  /* sitting tall, one knee up and crossed over; the elbow hooks the knee and the chest turns */
  const hip = [190, 182];
  const base = { hip, t: 0, foot: [hip[0] + 90, 190], foot2: [hip[0] + 36, 194], eb: 1, kb: -1 };
  const a = { ...base, hr: [14, 40], hr2: [-10, 44], tw: 0, hyw: 0 };
  const b = {
    ...base,
    hand: [hip[0] + 40, 152],
    hand2: [hip[0] - 34, 194],
    tw: 64,
    pw: 10,
    hyw: 50,
    hd: -2,
  };
  return { keys: [a, b], dur: 4, mus: { st: ['obliques', 'glutes', 'lowback'], s: ['chest'] } };
};
ANIMS.boxhamstring = () => {
  /* one heel on a step, leg long; hinge forward from the hips with a long back */
  const step = BOX(150, 150, 70, 50);
  const heel = [198, 144];
  const base = { foot: [120, 194], foot2: heel, ft2: 70, eb: 1, kb: -1 };
  const mk = (t, sb, dx) => ({ ...base, hip: [112 + dx, 108], t, sb, hr: [60, 20], hd: 6 });
  return {
    props: [step],
    keys: [mk(4, 0, 0), mk(46, 6, 6)],
    dur: 4,
    mus: { st: ['hamstrings', 'calves'], s: ['lowback', 'glutes'] },
  };
};
ANIMS.backround = () => {
  /* hands clasped out in front: push them away and round the upper back */
  const up = { ...STAND, hr: [66, 4], hr2: [66, 4], hd: 0 };
  const rd = { ...STAND, t: -4, sb: 30, hr: [66, 2], hr2: [66, 2], hd: 26, so: [-2, 0] };
  return { keys: [up, rd], dur: 3.6, mus: { st: ['traps', 'lats', 'lowback'], s: ['shoulders'] } };
};
ANIMS.threadneedle = () => {
  /* on all fours: slide one arm through under the body and rest on that shoulder */
  const hip = [112, 147];
  const foot = [64, 190];
  const hand = [196, 195];
  const a = { hip, t: 74, hand, hand2: hand, foot, hd: 10, eb: 1, kb: -1, hzr: 22, hzl: -22 };
  const S = AN.shoulderOf(hip, 92, 24);
  const b = {
    ...a,
    t: 92,
    sb: 24,
    hand2: [S[0] - 5, 193],
    hd: 6,
    tw: -60,
    pw: -8,
    hyw: -34,
    hzl: 10,
  };
  return { keys: [a, b], dur: 4, mus: { st: ['traps', 'obliques', 'shoulders'], s: ['lowback'] } };
};

export {
  R,
  FL,
  T,
  AR,
  HV,
  JV,
  deg,
  dirv,
  hipFrom,
  len2,
  solveTorso,
  legOnKnee,
  BOX,
  WALL,
  plank,
  pushupMus,
  ANIMS,
  STAND,
};
