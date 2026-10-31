/* Front and top-view animations: the second camera angle for moves a
   single side view leaves unclear. Hand-tuned data, ported verbatim. */
/* eslint-disable no-nested-ternary -- hand-tuned code kept as it was written; see docs/ROADMAP.md */

import { ANIMS, BOX, HV, R, deg, len2, plank, pushupMus } from './side-specs.js';

/* ===== Front / top-view animations ===== */
const ANIMF = {};
const perpF = (t) => [Math.cos(t * deg), Math.sin(t * deg)];
ANIMF.jacks = () => {
  const A = {
    hip: [180, 106],
    la: [97, 0.97],
    ra: [83, 0.97],
    ll: [86.7, 0.98],
    rl: [93.3, 0.98],
    d: 0.5,
    e: 'out',
  };
  const J1 = {
    hip: [180, 86],
    la: [165, 0.98],
    ra: [15, 0.98],
    ll: [100, 1],
    rl: [80, 1],
    d: 0.5,
    e: 'in',
  };
  const B = {
    hip: [180, 109],
    la: [-135, 0.98],
    ra: [-45, 0.98],
    ll: [110, 1],
    rl: [70, 1],
    d: 0.5,
    e: 'out',
  };
  const J2 = {
    hip: [180, 88],
    la: [170, 0.98],
    ra: [10, 0.98],
    ll: [95, 1],
    rl: [85, 1],
    d: 0.5,
    e: 'in',
  };
  return {
    view: 'front',
    keys: [A, J1, B, J2],
    mode: 'loop',
    dur: 1.2,
    mus: { p: ['shoulders', 'calves'], s: ['quads', 'glutes'] },
  };
};
/* lying prone, seen from above: head on the left, feet on the right */
const TOP = {
  hip: [250, 112],
  t: -90,
  ll: [4, 0.98],
  rl: [-4, 0.98],
  elL: 'down',
  elR: 'up',
  kL: 'down',
  kR: 'up',
  ts: 1,
};
ANIMF.snowangel = () => {
  const ks = [
    [5, -5],
    [35, -35],
    [65, -65],
    [95, -95],
    [125, -125],
    [155, -155],
    [175, -175],
  ].map(([l, r]) => ({ ...TOP, la: [l, 0.98], ra: [r, 0.98], d: 1 }));
  return {
    view: 'front',
    noFloor: true,
    props: [['mat', 96, 66, 262, 92]],
    keys: ks,
    dur: 4.2,
    mus: { p: ['traps', 'lowback'], s: ['shoulders', 'glutes'] },
  };
};
ANIMF.ytw = () => {
  const Y = { ...TOP, la: [160, 0.98], ra: [-160, 0.98], d: 0.6 };
  const T = { ...TOP, la: [90, 0.98], ra: [-90, 0.98], d: 0.6 };
  const sL = [186, 112 + 19];
  const sR = [186, 112 - 19];
  const W = {
    ...TOP,
    hl: [sL[0] - 18, sL[1] + 40],
    hr: [sR[0] - 18, sR[1] - 40],
    elL: 'right',
    elR: 'right',
    d: 0.6,
  };
  const mv = (o) => ({ ...o, d: 0.45 });
  return {
    view: 'front',
    noFloor: true,
    props: [['mat', 96, 56, 262, 112]],
    keys: [Y, mv(Y), T, mv(T), W, mv(W)].map((k, i) =>
      i % 2 ? { ...k, d: 0.45 } : { ...k, d: 0.7 },
    ),
    mode: 'loop',
    dur: 6,
    mus: { p: ['traps', 'shoulders'], s: ['lowback', 'glutes'] },
  };
};
/* side plank from the front: stacked feet at the left, forearm under the shoulder on the right */
function sidePlankF(o = {}) {
  const cope = o.cope;
  const F = cope ? [40, 140] : [44, 188];
  const th = cope ? 1 : 18;
  const r = R(F, th);
  const pc = perpF(r.t);
  const S = r.S;
  const shR = [S[0] + 19 * pc[0], S[1] + 19 * pc[1]];
  const arm = { hr: [shR[0] + 2, 190], fsr: 0.2, la: [-96, 0.98], elL: 'up', elR: 'down' };
  const feet = cope
    ? { fl: [42, 138], fr: [52, 172] }
    : { fl: [F[0] + 4, F[1] + 1], fr: [F[0] + 2, F[1] + 5] };
  const base = { shAt: S, t: r.t, sb: 0, ...arm, ...feet, kL: 'up', kR: 'down' };
  let keys = [base, { ...base, shAt: [S[0], S[1] - 1.5] }];
  if (o.dips) {
    keys = [base, { ...base, t: r.t - 12 }];
  }
  if (o.leg) {
    keys = [{ ...base }, { ...base, fl: [F[0] + 38, F[1] - 70] }];
  }
  const props = cope ? [BOX(-6, 150, 70, 8), BOX(-6, 158, 6, 42)] : [];
  return {
    view: 'front',
    props,
    keys,
    dur: 2.8,
    mus: { p: ['obliques'], s: ['shoulders', 'glutes', 'abs'] },
  };
}
ANIMF.sideplank = sidePlankF;
ANIMF.flag = (o = {}) => {
  const hip = [200, 96];
  const t = -90;
  const base = { hip, t, hl: [100, 150], hr: [100, 64], elL: 'down', elR: 'up' };
  const legs = o.tuck
    ? { fl: [238, 126], fr: [238, 118], kL: 'down', kR: 'down' }
    : { fl: [288, 102], fr: [288, 90], kL: 'down', kR: 'up' };
  const k = { ...base, ...legs };
  return {
    view: 'front',
    props: [['pole', 100]],
    keys: [k, { ...k, hip: [200, 94.5] }],
    dur: 2.6,
    mus: { p: ['obliques', 'lats'], s: ['shoulders', 'abs', 'forearms'] },
  };
};
ANIMF.bandpull = () => {
  const hip = [180, 106];
  const A = { hip, hl: [177, 52], hr: [183, 52], as: 0.45, elL: 'out', elR: 'out' };
  const B = { hip, la: [180, 0.99], ra: [0, 0.99], as: 1, elL: 'out', elR: 'out' };
  return {
    view: 'front',
    keys: [A, B],
    dur: 2.6,
    links: [['hdL', 'hdR']],
    mus: { p: ['traps', 'shoulders'], s: ['lats', 'biceps'] },
  };
};
/* hanging from a bar, seen from the front */
function pullF(o = {}) {
  const by = 30;
  const wide = o.archer || o.type;
  const HL = wide ? [124, by] : [156, by];
  const HR = wide ? [236, by] : [204, by];
  const hang = (sx, sy, t = 0) => ({
    shAt: [sx, sy],
    t,
    hl: HL,
    hr: HR,
    elL: 'out',
    elR: 'out',
    ll: [92, 0.98],
    rl: [88, 0.98],
    kL: 'out',
    kR: 'out',
  });
  let keys;
  if (o.dead || o.scap) {
    const hh = (sy) => ({ ...hang(180, sy), as: asFor([161, sy], HL) });
    keys = o.dead ? [hh(100), hh(102)] : [hh(100), hh(90)];
  } else if (o.rings) {
    const r = (sy, hx) => ({
      ...hang(180, sy),
      hl: [180 - hx, sy < 70 ? 44 : 32],
      hr: [180 + hx, sy < 70 ? 44 : 32],
    });
    keys = [r(96, 24), r(48, 34)];
  } else if (o.type === 'typewriter') {
    const L = { ...hang(150, 46, -10), hd: -6 };
    const R = { ...hang(210, 46, 10), hd: 6 };
    keys = [hang(180, 84), L, R, L];
  } else if (o.archer) {
    const L = { ...hang(150, 46, -10), hd: -6 };
    const R = { ...hang(210, 46, 10), hd: 6 };
    const H = hang(180, 80);
    keys = [H, L, H, R];
  } else {
    keys = [hang(180, 96), hang(180, 40)];
  }
  return {
    view: 'front',
    noFloor: true,
    vb: HV,
    props: o.rings
      ? [
          ['rings', 156, 32],
          ['rings', 204, 32],
        ]
      : [['bar', 180, by, wide ? 120 : 52]],
    keys,
    mode: o.archer || o.type ? 'loop' : 'yoyo',
    dur: o.archer || o.type ? 6.4 : 3.2,
    mus: { p: ['lats', 'biceps'], s: ['traps', 'forearms', 'abs'] },
  };
}
ANIMF.pullup = pullF;
ANIMF.wiper = () => {
  const by = 30;
  const S = [180, 96];
  const hand = { hl: [156, by], hr: [204, by], elL: 'out', elR: 'out' };
  const mk = (a) => ({ shAt: S, t: 0, ...hand, ll: [a, 0.98], rl: [a, 0.98], kL: 'up', kR: 'up' });
  return {
    view: 'front',
    legsOver: true,
    noFloor: true,
    props: [['bar', 180, by, 52]],
    keys: [mk(-150), mk(-90), mk(-30)],
    dur: 3,
    mus: { p: ['obliques', 'abs'], s: ['hipflex', 'lats', 'forearms'] },
  };
};
ANIMF.jumpsquat = () => {
  const mk = (hy, fl, fr, la, ra, extra) => ({ hip: [180, hy], fl, fr, la, ra, ...extra });
  const A = mk(136, [158, 194], [202, 194], [98, 0.85], [82, 0.85], { d: 0.5, e: 'in', ts: 0.97 });
  const B = mk(103, [166, 188], [194, 188], [-120, 0.98], [-60, 0.98], { d: 0.45, e: 'out' });
  const C = mk(68, [171, 156], [189, 156], [-100, 0.98], [-80, 0.98], { d: 0.45, e: 'in' });
  const D = mk(112, [160, 194], [200, 194], [110, 0.8], [70, 0.8], { d: 0.6, e: 'out' });
  return {
    view: 'front',
    keys: [A, B, C, D],
    mode: 'loop',
    dur: 2.4,
    mus: { p: ['quads', 'glutes', 'calves'], s: ['hamstrings', 'abs'] },
  };
};
ANIMF.tuckjump = () => {
  const mk = (hy, fl, fr, la, ra, extra) => ({ hip: [180, hy], fl, fr, la, ra, ...extra });
  const A = mk(136, [158, 194], [202, 194], [98, 0.85], [82, 0.85], { d: 0.5, e: 'in', ts: 0.97 });
  const B = mk(103, [166, 188], [194, 188], [-120, 0.98], [-60, 0.98], { d: 0.4, e: 'out' });
  const C = mk(68, [172, 120], [188, 120], [120, 0.6], [60, 0.6], {
    d: 0.5,
    e: 'in',
    ls: 0.62,
    sb: 0,
  });
  const D = mk(112, [160, 194], [200, 194], [110, 0.8], [70, 0.8], { d: 0.6, e: 'out' });
  return {
    view: 'front',
    legsOver: true,
    keys: [A, B, C, D],
    mode: 'loop',
    dur: 2.5,
    mus: { p: ['quads', 'hipflex', 'glutes'], s: ['abs', 'calves'] },
  };
};

/* ===== More front views: the second angle for moves a single side view leaves unclear ===== */
const F0 = {
  hip: [180, 106],
  t: 0,
  la: [96, 0.96],
  ra: [84, 0.96],
  ll: [87, 0.98],
  rl: [93, 0.98],
};
const asFor = (S, H) => Math.min(1, Math.max(0.3, len2(S, H) / 66));
/* push-ups, seen head-on: with t = 180 the torso runs away from the camera, so the hips show above the shoulders */
ANIMF.pushup = (o = {}) => {
  const hw = o.hw || 28;
  const hy = o.hy || 195;
  const ts = 0.26;
  const legE = 0.22 + (o.lift || 0) * 0.6;
  const mk = (sx, sy, hl, hr) => ({
    shAt: [sx, sy],
    t: 180,
    ts,
    hl,
    hr,
    elL: 'out',
    elR: 'out',
    ls: 0.5,
    ll: [-90, legE],
    rl: [-90, legE],
    kL: 'out',
    kR: 'out',
  });
  let hl = [180 + hw, hy];
  let hr = [180 - hw, hy];
  let top = mk(180, hy - 62, hl, hr);
  let bot = mk(180, hy - 26, hl, hr);
  if (o.diamond) {
    hl = [186, hy];
    hr = [174, hy];
    top = mk(180, hy - 62, hl, hr);
    bot = mk(180, hy - 26, hl, hr);
  }
  if (o.archer) {
    hl = [222, hy];
    hr = [130, hy];
    top = mk(180, hy - 62, hl, hr);
    bot = mk(206, hy - 28, hl, hr);
  }
  if (o.one) {
    hl = [190, hy];
    hr = [172, hy - 62];
    top = mk(180, hy - 62, hl, hr);
    bot = mk(180, hy - 28, hl, hr);
  }
  const props = [];
  if (o.ring) {
    props.push(['rings', 180 + hw, hy], ['rings', 180 - hw, hy]);
  }
  if (o.box) {
    props.push(BOX(180 - hw - 26, hy + 5, 2 * hw + 52, 200 - hy - 5));
  }
  return {
    view: 'front',
    props,
    keys: [top, bot],
    dur: 2.8,
    mus: { p: ['chest', 'triceps'], s: ['shoulders', 'abs', 'glutes'] },
  };
};
ANIMF.pike = (o = {}) => {
  const legE = o.elev ? 0.55 : 0.8;
  const mk = (sy) => ({
    shAt: [180, sy],
    t: 180,
    ts: 0.8,
    hl: [203, 195],
    hr: [157, 195],
    elL: 'out',
    elR: 'out',
    ls: 0.5,
    ll: [90, legE],
    rl: [90, legE],
  });
  return {
    view: 'front',
    keys: [mk(132), mk(172)],
    dur: 3,
    mus: { p: ['shoulders', 'triceps'], s: ['chest', 'traps'] },
  };
};
ANIMF.hspu = () => {
  const mk = (sy) => ({
    shAt: [180, sy],
    t: 180,
    ts: 1,
    hl: [199, 195],
    hr: [161, 195],
    elL: 'out',
    elR: 'out',
    ll: [-90, 0.98],
    rl: [-90, 0.98],
  });
  return {
    view: 'front',
    keys: [mk(133), mk(173)],
    dur: 3.2,
    mus: { p: ['shoulders', 'triceps'], s: ['traps', 'abs'] },
  };
};
ANIMF.benchdip = () => {
  const hy = 150;
  const mk = (sy) => ({
    shAt: [180, sy],
    t: 0,
    hl: [154, hy],
    hr: [206, hy],
    as: asFor([161, sy], [154, hy]),
    elL: 'out',
    elR: 'out',
    fl: [166, 198],
    fr: [194, 198],
    ls: 0.55,
    kL: 'out',
    kR: 'out',
  });
  return {
    view: 'front',
    props: [BOX(116, hy + 4, 128, 8)],
    keys: [mk(hy - 64), mk(hy - 34)],
    dur: 2.8,
    mus: { p: ['triceps'], s: ['chest', 'shoulders'] },
  };
};
ANIMF.dip = (o = {}) => {
  const y = 118;
  const hl = [156, y];
  const hr = [204, y];
  const mk = (sy) => ({
    shAt: [180, sy],
    t: 0,
    hl,
    hr,
    as: asFor([161, sy], hl),
    elL: 'out',
    elR: 'out',
    ll: [91, 0.98],
    rl: [89, 0.98],
  });
  const props = o.rings
    ? [
        ['rings', 156, y],
        ['rings', 204, y],
      ]
    : [BOX(144, y + 3, 24, 5), BOX(192, y + 3, 24, 5)];
  return {
    view: 'front',
    noFloor: true,
    props,
    keys: [mk(y - 66), mk(y - 32)],
    dur: 3,
    mus: { p: ['triceps', 'chest'], s: ['shoulders'] },
  };
};
/* L-sit family, seen from the front: legs point at the camera so they look short */
ANIMF.lsit = (o = {}) => {
  const gy = o.pal ? 172 : 193;
  const hl = [154, gy];
  const hr = [206, gy];
  const S = [180, gy - 72];
  const hy = gy - 10;
  const base = {
    shAt: S,
    t: 0,
    ts: 0.97,
    hl,
    hr,
    elL: 'out',
    elR: 'out',
    ls: 0.5,
    kL: 'up',
    kR: 'up',
  };
  const ext = { ll: [88, 0.9], rl: [92, 0.9] };
  const tuckL = { fl: [172, hy - 4], kL: 'up' };
  const tuckR = { fr: [188, hy - 4], kR: 'up' };
  let legs = ext;
  if (o.tuck) {
    legs = { ...tuckL, ...tuckR };
  }
  if (o.one) {
    legs = { ...tuckL, rl: [92, 0.9] };
  }
  if (o.v) {
    legs = { ll: [-95, 0.55], rl: [-85, 0.55] };
  }
  const k = { ...base, ...legs };
  const props = [['mat', 112, 197, 136, 12]];
  if (o.pal) {
    props.push(BOX(144, gy + 4, 20, 5), BOX(196, gy + 4, 20, 5));
  }
  return {
    view: 'front',
    noFloor: true,
    legsOver: !!(o.tuck || o.one || o.v),
    props,
    keys: [k, { ...k, shAt: [S[0], S[1] - 1.5] }],
    dur: 2.4,
    mus: { p: ['abs', 'hipflex', 'triceps'], s: ['quads', 'shoulders', 'forearms'] },
  };
};
ANIMF.squat = () => {
  const feet = { fl: [157, 194], fr: [203, 194] };
  const stand = {
    hip: [180, 106],
    t: 0,
    ...feet,
    hl: [177, 62],
    hr: [183, 62],
    as: 0.45,
    elL: 'out',
    elR: 'out',
    kL: 'out',
    kR: 'out',
  };
  const dn = {
    hip: [180, 152],
    t: 0,
    ts: 0.97,
    ...feet,
    ls: 0.62,
    ssl: 1.25,
    ssr: 1.25,
    hl: [177, 108],
    hr: [183, 108],
    as: 0.45,
    elL: 'out',
    elR: 'out',
    kL: 'out',
    kR: 'out',
  };
  return {
    view: 'front',
    keys: [stand, dn],
    dur: 3,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'abs', 'calves'] },
  };
};
ANIMF.handstand = (o = {}) => {
  const base = (sx, t, extra) => ({
    shAt: [sx, 133],
    t,
    ts: 1,
    hl: [199, 195],
    hr: [161, 195],
    elL: 'out',
    elR: 'out',
    ll: [-90, 0.98],
    rl: [-90, 0.98],
    kL: 'out',
    kR: 'out',
    ...extra,
  });
  let keys;
  if (o.free) {
    keys = [base(180, 177.5), base(180, 182.5)];
  } else if (o.walk) {
    keys = [
      base(180, 180),
      base(170, 183, { hl: [208, 176], ll: [-100, 0.98], rl: [-80, 0.98] }),
      base(180, 180),
      base(190, 177, { hr: [152, 176], ll: [-100, 0.98], rl: [-80, 0.98] }),
    ];
  } else if (o.taps) {
    keys = [
      base(180, 180),
      base(192, 177, { hr: [196, 140], elR: 'down' }),
      base(180, 180),
      base(168, 183, { hl: [164, 140], elL: 'down' }),
    ];
  } else if (o.kick) {
    keys = [
      base(180, 180, { ts: 0.8, ll: [90, 0.95], rl: [90, 0.95] }),
      base(180, 180, { ts: 0.9, ll: [-90, 0.98], rl: [90, 0.95] }),
      base(180, 180),
    ];
  } else {
    keys = [base(180, 180), base(180, 180, { ts: 0.985 })];
  }
  return {
    view: 'front',
    keys,
    mode: o.walk || o.taps ? 'loop' : 'yoyo',
    dur: o.walk || o.taps ? 4.4 : 2.8,
    mus: { p: ['shoulders', 'traps'], s: ['triceps', 'abs', 'forearms'] },
  };
};
ANIMF.headstand = (o = {}) => {
  const hx = o.tripod ? 26 : 14;
  const k = {
    shAt: [180, 160],
    t: 180,
    ts: 1,
    hl: [180 + hx, 194],
    hr: [180 - hx, 194],
    elL: 'out',
    elR: 'out',
    ll: [-90, 0.98],
    rl: [-90, 0.98],
  };
  return {
    view: 'front',
    keys: [k, { ...k, shAt: [180, 159], t: 181 }],
    dur: 2.8,
    mus: { p: ['shoulders', 'traps', 'abs'], s: ['triceps', 'lowback'] },
  };
};
ANIMF.crow = (o = {}) => {
  const c = o.crane
    ? { sy: 128, ts: 0.5, h: 16, fy: 90, ls: 0.6 }
    : o.frog
      ? { sy: 156, ts: 0.55, h: 22, fy: 122, ls: 0.78 }
      : { sy: 148, ts: 0.55, h: 22, fy: 106, ls: 0.62 };
  const k = {
    shAt: [180, c.sy],
    t: 180,
    ts: c.ts,
    hl: [180 + c.h + 1, 195],
    hr: [180 - c.h - 1, 195],
    elL: 'out',
    elR: 'out',
    fl: [185, c.fy],
    fr: [175, c.fy],
    ls: c.ls,
    kL: 'out',
    kR: 'out',
  };
  return {
    view: 'front',
    keys: [k, { ...k, shAt: [180, c.sy - 1.5] }],
    dur: 2.6,
    mus: { p: ['forearms', 'shoulders', 'abs'], s: ['triceps', 'hipflex', 'chest'] },
  };
};
ANIMF.neck = () => ({
  view: 'front',
  keys: [
    { ...F0, hd: -32, so: 0 },
    { ...F0, hd: 32 },
  ],
  dur: 4,
  mus: { st: ['neck'], s: ['traps'] },
});
ANIMF.reachup = () => {
  const L = { ...F0, t: -5, sb: -14, la: [-124, 0.98], ra: [-108, 0.98], hd: -6 };
  const R = { ...F0, t: 5, sb: 14, la: [-72, 0.98], ra: [-56, 0.98], hd: 6 };
  return {
    view: 'front',
    keys: [L, R],
    dur: 4,
    mus: { st: ['lats', 'obliques'], p: ['shoulders'] },
  };
};
ANIMF.tricepstr = () => {
  const a = { ...F0, hl: [176, 24], elL: 'up', hr: [164, 14], elR: 'down', hd: 4 };
  return {
    view: 'front',
    keys: [a, { ...a, t: 3, sb: 5, hl: [175, 20] }],
    dur: 3.4,
    mus: { st: ['triceps', 'lats'], s: ['shoulders', 'obliques'] },
  };
};
ANIMF.wallangel = () => {
  const W = {
    ...F0,
    hl: [150, 40],
    hr: [210, 40],
    elL: 'down',
    elR: 'down',
    ll: [88, 0.98],
    rl: [92, 0.98],
  };
  const M = { ...F0, hl: [138, 10], hr: [222, 10], elL: 'out', elR: 'out' };
  const Y = { ...F0, la: [-125, 0.98], ra: [-55, 0.98], elL: 'out', elR: 'out' };
  return {
    view: 'front',
    keys: [W, M, Y],
    dur: 3.6,
    mus: { p: ['traps', 'shoulders'], st: ['chest', 'lats'] },
  };
};
ANIMF.hipcircle = () => {
  const mk = (dx, dy, t) => ({
    ...F0,
    hip: [180 + dx, 110 + dy],
    t,
    fl: [172, 194],
    fr: [188, 194],
    hl: [162 + dx * 0.5, 96],
    hr: [198 + dx * 0.5, 96],
    elL: 'out',
    elR: 'out',
    ll: null,
    rl: null,
  });
  const k = [mk(12, 0, -5), mk(0, 6, 0), mk(-12, 0, 5), mk(0, -3, 0)].map((x) => {
    delete x.ll;
    delete x.rl;
    return x;
  });
  return {
    view: 'front',
    keys: k,
    mode: 'loop',
    dur: 3,
    mus: { p: ['glutes', 'obliques'], s: ['hipflex', 'lowback'] },
  };
};

/* chest and arm stretch against a door frame, seen from the front: forearm up the wall, body turns away */
ANIMF.chestdoor = () => {
  const base = {
    hip: [180, 106],
    t: 0,
    la: [96, 0.96],
    hr: [235, 8],
    elR: 'right',
    ll: [87, 0.98],
    rl: [93, 0.98],
  };
  return {
    view: 'front',
    props: [['wall', 243, 'R']],
    keys: [{ ...base }, { ...base, w: 0.72, t: -5, sb: -3, hd: -8 }],
    dur: 3.6,
    mus: { st: ['chest', 'biceps', 'shoulders'], s: ['forearms'] },
  };
};

ANIMS.rlunge = () => {
  const fF = [180, 194];
  const arms = [8, 40];
  const stand = {
    hip: [172, 104],
    t: 2,
    hr: arms,
    foot: fF,
    foot2: [170, 194],
    ft: 0,
    ft2: 0,
    d: 0.8,
    e: 'io',
  };
  const step = {
    hip: [174, 108],
    t: 3,
    hr: arms,
    foot: fF,
    foot2: [124, 170],
    ft: 0,
    ft2: 40,
    d: 0.8,
    e: 'io',
  };
  const lunge = {
    hip: [144, 146],
    t: 5,
    hr: arms,
    foot: fF,
    foot2: [94, 187],
    ft: 0,
    ft2: 60,
    d: 1,
  };
  return {
    keys: [stand, step, lunge],
    dur: 4.2,
    mus: { p: ['quads', 'glutes'], s: ['hamstrings', 'calves', 'abs'], st: ['hipflex'] },
  };
};

/* archer push-up: one arm bends under you while the other reaches out straight; then the other way */
ANIMS.archer = () => {
  const base = plank({ thDown: 7, mus: pushupMus });
  const up = base.keys[0];
  const dn = base.keys[1];
  const top = { ...up, zsh: 0, hzr: 36, hzl: -36 };
  const left = { ...dn, zsh: -15, hzl: -34, hzr: 54 };
  const right = { ...dn, zsh: 15, hzr: 34, hzl: -54 };
  return { keys: [top, left, top, right], mode: 'loop', dur: 6, mus: base.mus };
};

export { ANIMF, perpF, TOP, sidePlankF, pullF, F0, asFor };
