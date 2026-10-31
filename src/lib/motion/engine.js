/* The 2D animation engine: a jointed figure drawn as SVG, posed by inverse
   kinematics between keyframes ("keys"), seen from the side or the front.
   Ported verbatim from the original single-file app (only re-formatted);
   its API is described in engine.d.ts. */
/* eslint-disable no-nested-ternary -- hand-tuned code kept as it was written; see docs/ROADMAP.md */

/* ===== Stylized stick-figure animation engine (side view, facing right) ===== */
const AN = (() => {
  const SEGS = [24, 16, 24];
  const T = 64;
  const UA = 36;
  const FA = 34;
  const TH = 46;
  const SH = 44;
  const FL = 200;
  const rad = (d) => (d * Math.PI) / 180;
  const NS = 'http://www.w3.org/2000/svg';
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = (a) => Math.hypot(a[0], a[1]);
  const unit = (a) => {
    const l = len(a) || 1;
    return [a[0] / l, a[1] / l];
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpV = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const ease = (t) => t * t * (3 - 2 * t);

  const dirOf = (ang) => [Math.sin(rad(ang)), -Math.cos(rad(ang))];
  /* three torso blocks: pelvis, abdomen, chest. sb = total spine flexion (+ rounds forward, - arches) */
  function spineOf(hip, t, sb) {
    const a = [t, t + sb / 2, t + sb];
    const j1 = add(hip, mul(dirOf(a[0]), SEGS[0]));
    const j2 = add(j1, mul(dirOf(a[1]), SEGS[1]));
    const sh = add(j2, mul(dirOf(a[2]), SEGS[2]));
    return { pts: [hip, j1, j2, sh], angs: a };
  }
  function onSpine(sp, f) {
    const L = sp.L || SEGS;
    const tot = L[0] + L[1] + L[2];
    let d = f * tot;
    for (let i = 0; i < 3; i++) {
      if (d <= L[i] || i === 2) {
        const u = clamp01(d / L[i]);
        const dv = dirOf(sp.angs[i]);
        return {
          c: add(sp.pts[i], mul(dv, L[i] * u)),
          d: dv,
          ang: (Math.atan2(dv[1], dv[0]) * 180) / Math.PI,
        };
      }
      d -= L[i];
    }
  }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  /* rigid body line from an anchor (feet/knees) at angle th above horizontal (0=right, 90=up, 180=left) */
  function rigid(F, th, a = 90, L = a + T) {
    const c = Math.cos(rad(th));
    const s = Math.sin(rad(th));
    return { hip: [F[0] + a * c, F[1] - a * s], t: 90 - th, S: [F[0] + L * c, F[1] - L * s] };
  }

  function ik(r, tg, l1, l2, s) {
    let dx = tg[0] - r[0];
    let dy = tg[1] - r[1];
    let d = Math.hypot(dx, dy);
    const maxd = l1 + l2 - 0.02;
    const mind = Math.abs(l1 - l2) + 1;
    if (d < 0.001) {
      dx = 0;
      dy = 1;
      d = 1;
    }
    let end = tg;
    if (d > maxd) {
      const k = maxd / d;
      dx *= k;
      dy *= k;
      d = maxd;
      end = [r[0] + dx, r[1] + dy];
    } else if (d < mind) {
      const k = mind / d;
      dx *= k;
      dy *= k;
      d = mind;
      end = [r[0] + dx, r[1] + dy];
    }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / d;
    const uy = dy / d;
    const nx = -uy * s;
    const ny = ux * s;
    return { mid: [r[0] + ux * a + nx * h, r[1] + uy * a + ny * h], end };
  }

  /* resolve a key into absolute numbers */
  const polV = (p) => [
    Math.cos(rad(p[0])) * p[1],
    Math.sin(rad(p[0])) * p[1],
  ]; /* angle: 0 forward, 90 down, -90 up; unwrapped so the author picks the arc */
  function resolve(k) {
    const t = k.t || 0;
    const sb = k.sb || 0;
    const hip = k.shAt ? sub(k.shAt, spineOf([0, 0], t, sb).pts[3]) : k.hip;
    const anch = k.shAt || null;
    const sh = spineOf(hip, t, sb).pts[3];
    const so = k.so || [0, 0];
    const ash = add(sh, so);
    const hp = k.hand ? null : k.hrp || null;
    const hp2 = k.hand2 || k.hr2 ? null : k.hrp2 || k.hrp || null;
    const fp = k.foot ? null : k.frp || null;
    const fp2 = k.foot2 || k.fr2 ? null : k.frp2 || k.frp || null;
    const hand = k.hand || (hp ? add(ash, polV(hp)) : k.hr ? add(ash, k.hr) : add(ash, [0, 60]));
    const hand2 = k.hand2 || (k.hrp2 ? add(ash, polV(k.hrp2)) : k.hr2 ? add(ash, k.hr2) : hand);
    const foot = k.foot || (fp ? add(hip, polV(fp)) : k.fr ? add(hip, k.fr) : add(hip, [0, 88]));
    const foot2 = k.foot2 || (k.frp2 ? add(hip, polV(k.frp2)) : k.fr2 ? add(hip, k.fr2) : foot);
    return {
      hip,
      t,
      sb,
      so,
      anch,
      hand,
      hand2,
      foot,
      foot2,
      hp,
      hp2,
      fp,
      fp2,
      lsw: k.lsw || 0,
      psh: k.psh || 0,
      hps: k.hps || 0,
      rk: k.rk || 0,
      zsh: k.zsh || 0,
      hzr: k.hzr == null ? null : k.hzr,
      hzl: k.hzl == null ? null : k.hzl,
      hd: k.hd || 0,
      tw: k.tw || 0,
      pw: k.pw || 0,
      rl: k.rl || 0,
      hrl: k.hrl || 0,
      hyw: k.hyw || 0,
      ft: k.ft || 0,
      ft2: k.ft2 == null ? k.ft || 0 : k.ft2,
      eb: k.eb || 1,
      kb: k.kb || -1,
      d: k.d == null ? 1 : k.d,
      e: k.e || 'io',
    };
  }
  function mix(a, b, u) {
    const tt = lerp(a.t, b.t, u);
    const sbb = lerp(a.sb, b.sb, u);
    let hip;
    let anch = null;
    if (a.anch && b.anch) {
      anch = lerpV(a.anch, b.anch, u);
      hip = sub(anch, spineOf([0, 0], tt, sbb).pts[3]);
    } else {
      hip = lerpV(a.hip, b.hip, u);
    }
    let hand = lerpV(a.hand, b.hand, u);
    let hand2 = lerpV(a.hand2, b.hand2, u);
    let foot = lerpV(a.foot, b.foot, u);
    let foot2 = lerpV(a.foot2, b.foot2, u);
    const soI = lerpV(a.so, b.so, u);
    const shP = add(spineOf(hip, tt, sbb).pts[3], soI);
    const pol = (p, q) => polV([lerp(p[0], q[0], u), lerp(p[1], q[1], u)]);
    if (a.hp && b.hp) {
      hand = add(shP, pol(a.hp, b.hp));
    }
    if (a.hp2 && b.hp2) {
      hand2 = add(shP, pol(a.hp2, b.hp2));
    }
    if (a.fp && b.fp) {
      foot = add(hip, pol(a.fp, b.fp));
    }
    if (a.fp2 && b.fp2) {
      foot2 = add(hip, pol(a.fp2, b.fp2));
    }
    return {
      hip,
      anch,
      t: tt,
      sb: sbb,
      lsw: lerp(a.lsw, b.lsw, u),
      psh: lerp(a.psh, b.psh, u),
      hps: lerp(a.hps, b.hps, u),
      rk: lerp(a.rk, b.rk, u),
      zsh: lerp(a.zsh, b.zsh, u),
      hzr: a.hzr == null ? b.hzr : b.hzr == null ? a.hzr : lerp(a.hzr, b.hzr, u),
      hzl: a.hzl == null ? b.hzl : b.hzl == null ? a.hzl : lerp(a.hzl, b.hzl, u),
      so: soI,
      hand,
      hand2,
      foot,
      foot2,
      hp: null,
      hp2: null,
      fp: null,
      fp2: null,
      hd: lerp(a.hd, b.hd, u),
      tw: lerp(a.tw, b.tw, u),
      pw: lerp(a.pw, b.pw, u),
      rl: lerp(a.rl, b.rl, u),
      hrl: lerp(a.hrl, b.hrl, u),
      hyw: lerp(a.hyw, b.hyw, u),
      ft: lerp(a.ft, b.ft, u),
      ft2: lerp(a.ft2, b.ft2, u),
      eb: a.eb,
      kb: a.kb,
    };
  }

  function skeleton(p) {
    const sp = spineOf(p.hip, p.t, p.sb);
    const dir = dirOf(p.t);
    const sh = sp.pts[3];
    const hdir = dirOf(p.t + p.sb + p.hd);
    const head = add(sh, mul(hdir, 17));
    const ash = add(sh, p.so);
    const A = ik(ash, p.hand, UA, FA, p.eb);
    const A2 = ik(ash, p.hand2, UA, FA, p.eb);
    const L = ik(p.hip, p.foot, TH, SH, p.kb);
    const L2 = ik(p.hip, p.foot2, TH, SH, p.kb);
    const toe = (l, ft) => {
      const sd = unit(sub(l.end, l.mid));
      const n = [sd[1], -sd[0]]; // toward knee side
      const a = rad(ft);
      const c = Math.cos(a);
      const s = Math.sin(a);
      const r = [n[0] * c - n[1] * s, n[0] * s + n[1] * c];
      return add(l.end, mul(r, 14));
    };
    return {
      hip: p.hip,
      sh,
      ash,
      dir,
      head,
      hdir,
      sp,
      el: A.mid,
      hd: A.end,
      el2: A2.mid,
      hd2: A2.end,
      kn: L.mid,
      an: L.end,
      kn2: L2.mid,
      an2: L2.end,
      toe: toe(L, p.ft),
      toe2: toe(L2, p.ft2),
      eb: p.eb,
      kb: p.kb,
    };
  }

  /* muscle overlays */
  const COL = { p: '#E8553A', s: '#F4B63F', st: '#3B8EDB' };
  function seg(a, b, f, off, nrm, rx, ry) {
    const d = sub(b, a);
    const c = add(add(a, mul(d, f)), mul(nrm, off));
    return { c, ang: (Math.atan2(d[1], d[0]) * 180) / Math.PI, rx, ry };
  }
  const sps = (k, f, off, rx, ry) => {
    const o = onSpine(k.sp, f);
    const n = [-o.d[1], o.d[0]];
    return { c: add(o.c, mul(n, off)), ang: o.ang, rx, ry };
  };
  const MUS = {
    chest: (k) => sps(k, 0.84, 8, 11, 8),
    abs: (k) => sps(k, 0.4, 7, 12, 6),
    obliques: (k) => sps(k, 0.4, 0, 12, 9),
    lats: (k) => sps(k, 0.66, -8, 15, 6),
    traps: (k) => sps(k, 0.95, -7, 9, 7),
    lowback: (k) => sps(k, 0.16, -8, 10, 6),
    glutes: (k) => ({ c: add(k.hip, mul(k.fr, -6)), ang: 0, rx: 11, ry: 11 }),
    shoulders: (k) => ({ c: k.sh, ang: 0, rx: 9, ry: 9 }),
    neck: (k) => ({
      c: mul(add(k.sh, k.head), 0.5),
      ang: (Math.atan2(k.head[1] - k.sh[1], k.head[0] - k.sh[0]) * 180) / Math.PI,
      rx: 10,
      ry: 5.5,
    }),
    hipflex: (k) => ({ c: add(k.hip, mul(k.fr, 8)), ang: 0, rx: 7, ry: 9 }),
    triceps: (k) => seg(k.sh, k.elA, 0.5, k.armOut * 4, k.armN, 15, 5),
    biceps: (k) => seg(k.sh, k.elA, 0.5, -k.armOut * 4, k.armN, 15, 5),
    forearms: (k) => seg(k.elA, k.hdA, 0.5, 0, k.armN, 14, 4.5),
    quads: (k) => seg(k.hip, k.knA, 0.5, k.legOut * 5, k.legN, 21, 7),
    hamstrings: (k) => seg(k.hip, k.knA, 0.5, -k.legOut * 5, k.legN, 21, 7),
    calves: (k) => seg(k.knA, k.anA, 0.4, -k.legOut * 4, k.legN2, 15, 6),
  };
  function overlayCtx(s, far) {
    const fr = [-s.dir[1], s.dir[0]];
    const el = far ? s.el2 : s.el;
    const hd = far ? s.hd2 : s.hd;
    const kn = far ? s.kn2 : s.kn;
    const an = far ? s.an2 : s.an;
    const au = unit(sub(hd, s.sh));
    const lu = unit(sub(an, s.hip));
    const lu2 = unit(sub(an, kn));
    return {
      hip: s.hip,
      sh: s.ash,
      head: s.head,
      dir: s.dir,
      fr,
      sp: s.sp,
      elA: el,
      hdA: hd,
      knA: kn,
      anA: an,
      armN: [-au[1], au[0]],
      armOut: s.eb,
      legN: [-lu[1], lu[0]],
      legOut: -s.kb,
      legN2: [-lu2[1], lu2[0]],
    };
  }

  /* ====== mannequin shapes ====== */
  const f2 = (n) => Math.round(n * 100) / 100;
  const PT = (p) => f2(p[0]) + ' ' + f2(p[1]);
  const nrm = (u) => [-u[1], u[0]];
  /* ellipse from four cubic curves: stable between frames (arcs flipped when endpoints were rounded) */
  function ell(c, rx, ry, ang) {
    const a = (ang * Math.PI) / 180;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const k = 0.5523;
    const Pn = (x, y) => PT([c[0] + x * ca - y * sa, c[1] + x * sa + y * ca]);
    return (
      'M' +
      Pn(rx, 0) +
      'C' +
      Pn(rx, k * ry) +
      ' ' +
      Pn(k * rx, ry) +
      ' ' +
      Pn(0, ry) +
      'C' +
      Pn(-k * rx, ry) +
      ' ' +
      Pn(-rx, k * ry) +
      ' ' +
      Pn(-rx, 0) +
      'C' +
      Pn(-rx, -k * ry) +
      ' ' +
      Pn(-k * rx, -ry) +
      ' ' +
      Pn(0, -ry) +
      'C' +
      Pn(k * rx, -ry) +
      ' ' +
      Pn(rx, -k * ry) +
      ' ' +
      Pn(rx, 0) +
      'Z'
    );
  }
  const circ = (c, r) => ell(c, r, r, 0);
  /* tapered capsule: two end circles joined by tangent lines, built from curves too */
  function cap(a, b, w0, w1) {
    const d = sub(b, a);
    const L = len(d) || 0.01;
    const u = [d[0] / L, d[1] / L];
    const n = nrm(u);
    const r0 = w0 / 2;
    const r1 = w1 / 2;
    const s = Math.max(-1, Math.min(1, (r0 - r1) / L));
    const co = Math.sqrt(1 - s * s); // tangent tilt
    const t1 = [u[0] * s + n[0] * co, u[1] * s + n[1] * co];
    const t2 = [u[0] * s - n[0] * co, u[1] * s - n[1] * co];
    const A1 = add(a, mul(t1, r0));
    const B1 = add(b, mul(t1, r1));
    const B2 = add(b, mul(t2, r1));
    const A2 = add(a, mul(t2, r0));
    const k = 0.5523;
    const capB = (c, r, p1, p2, dirv) => {
      // semicircle from p1 to p2 around direction dirv
      const q1 = add(p1, mul(dirv, k * r * 1.0));
      const q2 = add(p2, mul(dirv, k * r * 1.0));
      const m = add(c, mul(dirv, r));
      const h1 = add(m, mul(nrm(dirv), k * r));
      const h2 = sub(m, mul(nrm(dirv), k * r));
      return 'C' + PT(q1) + ' ' + PT(h1) + ' ' + PT(m) + 'C' + PT(h2) + ' ' + PT(q2) + ' ' + PT(p2);
    };
    return (
      'M' +
      PT(A1) +
      'L' +
      PT(B1) +
      capB(b, r1, B1, B2, u) +
      'L' +
      PT(A2) +
      capB(a, r0, A2, A1, [-u[0], -u[1]]) +
      'Z'
    );
  }
  const STYLES = {
    mannequin: {
      name: 'Mannequin',
      shade: true,
      torso(s) {
        const P = s.sp.pts;
        const o = {};
        const L = [-2.5, -3.5];
        const eg = (A, B, ry, grow) => {
          const c = mul(add(A, B), 0.5);
          const ang = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
          const l = len(sub(B, A)) / 2 + grow;
          return { d: ell(c, l, ry, ang), sd: ell(add(c, L), l * 0.62, ry * 0.5, ang) };
        };
        o.pelvis = eg(P[0], P[1], 15, 4);
        o.abd = eg(P[1], P[2], 10, 3);
        o.chest = eg(P[2], P[3], 16, 6);
        o.spine = { d: cap(P[0], P[3], 9, 9) };
        return o;
      },
      seg: (k, a, b) => {
        const W = { ua: [15, 11], fa: [11, 8], th: [21, 15], sh: [14, 9] }[k];
        return {
          d: cap(a, b, W[0], W[1]),
          sd: cap(add(a, [-2, -3]), add(b, [-2, -3]), W[0] * 0.36, W[1] * 0.36),
        };
      },
      hand: (c) => ({ d: circ(c, 5.5), sd: circ(add(c, [-1.5, -2]), 2.2) }),
      foot: (a, b) => ({ d: cap(a, b, 9, 6), sd: cap(add(a, [-1, -2]), add(b, [-1, -2]), 3, 2) }),
      head: (c, hd) => {
        const ang = (Math.atan2(hd[1], hd[0]) * 180) / Math.PI;
        return { d: ell(c, 12.5, 10.5, ang), sd: ell(add(c, [-3, -3.5]), 6, 4, ang) };
      },
      torsoF(s) {
        const P = s.sp.pts;
        const o = {};
        const L = [-2.5, -3.5];
        const eg = (A, B, ry, grow) => {
          const c = mul(add(A, B), 0.5);
          const ang = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
          const l = len(sub(B, A)) / 2 + grow;
          return { d: ell(c, l, ry, ang), sd: ell(add(c, L), l * 0.62, ry * 0.5, ang) };
        };
        o.pelvis = eg(P[0], P[1], 17, 4);
        o.abd = eg(P[1], P[2], 12, 3);
        o.chest = eg(P[2], P[3], 21, 5);
        o.spine = { d: cap(P[0], P[3], 10, 10) };
        return o;
      },
      neck: (a, b) => ({ d: cap(a, b, 8, 8) }),
      joint: (c, r) => ({ d: circ(c, r), sd: circ(add(c, [-1.5, -2]), r * 0.45) }),
      mus: (c, ang, rx, ry) => ell(c, rx, ry, ang),
    },
  };
  const PARTS = [
    'fUA',
    'fFA',
    'fHand',
    'fTh',
    'fSh',
    'fFoot',
    'fjE',
    'fjK',
    'spine',
    'pelvis',
    'abd',
    'chest',
    'neck',
    'head',
    'nTh',
    'nSh',
    'nFoot',
    'njK',
    'njH',
    'nUA',
    'nFA',
    'nHand',
    'njE',
    'njS',
  ];
  const PARTS_F = [
    'lTh',
    'lSh',
    'lFoot',
    'ljK',
    'rTh',
    'rSh',
    'rFoot',
    'rjK',
    'ljH',
    'rjH',
    'spine',
    'pelvis',
    'abd',
    'chest',
    'neck',
    'head',
    'lUA',
    'lFA',
    'lHand',
    'ljE',
    'ljS',
    'rUA',
    'rFA',
    'rHand',
    'rjE',
    'rjS',
  ];
  function shapesForF(st, s) {
    const o = st.torsoF(s);
    const limb = (p, sh, E, H, hip, K, A, TO) => {
      o[p + 'UA'] = st.seg('ua', sh, E);
      o[p + 'FA'] = st.seg('fa', E, H);
      o[p + 'Hand'] = st.hand(H);
      o[p + 'Th'] = st.seg('th', hip, K);
      o[p + 'Sh'] = st.seg('sh', K, A);
      o[p + 'Foot'] = st.foot(A, TO);
      o[p + 'jE'] = st.joint(E, 6);
      o[p + 'jK'] = st.joint(K, 8);
      o[p + 'jS'] = st.joint(sh, 8.5);
      o[p + 'jH'] = st.joint(hip, 9);
    };
    limb('l', s.shL, s.elL, s.hdL, s.hL, s.knL, s.anL, s.toeL);
    limb('r', s.shR, s.elR, s.hdR, s.hR, s.knR, s.anR, s.toeR);
    o.neck = st.neck(s.S, s.head);
    o.head = st.head(s.head, s.hdir);
    return o;
  }
  function shapesFor(st, s) {
    const o = st.torso(s);
    const limb = (p, far) => {
      const E = far ? s.el2 : s.el;
      const H = far ? s.hd2 : s.hd;
      const K = far ? s.kn2 : s.kn;
      const A = far ? s.an2 : s.an;
      const TO = far ? s.toe2 : s.toe;
      o[p + 'UA'] = st.seg('ua', s.ash, E);
      o[p + 'FA'] = st.seg('fa', E, H);
      o[p + 'Hand'] = st.hand(H);
      o[p + 'Th'] = st.seg('th', s.hip, K);
      o[p + 'Sh'] = st.seg('sh', K, A);
      o[p + 'Foot'] = st.foot(A, TO);
      o[p + 'jE'] = st.joint(E, 6);
      o[p + 'jK'] = st.joint(K, 8);
      if (!far) {
        o.njS = st.joint(s.ash, 8.5);
        o.njH = st.joint(s.hip, 9.5);
      }
    };
    limb('f', true);
    limb('n', false);
    o.neck = st.neck(s.sh, s.head);
    o.head = st.head(s.head, s.hdir);
    return o;
  }

  /* ====== front / top view ====== */
  const WS = 19;
  const HW = 9;
  const perp = (ang) => [Math.cos(rad(ang)), Math.sin(rad(ang))];
  function spineF(hip, t, sb, ts) {
    const a = [t, t + sb / 2, t + sb];
    const L = SEGS.map((x) => x * ts);
    const j1 = add(hip, mul(dirOf(a[0]), L[0]));
    const j2 = add(j1, mul(dirOf(a[1]), L[1]));
    const sh = add(j2, mul(dirOf(a[2]), L[2]));
    return { pts: [hip, j1, j2, sh], angs: a, L };
  }
  const polar = (o, ang, r) => [o[0] + Math.cos(rad(ang)) * r, o[1] + Math.sin(rad(ang)) * r];
  function resolveF(k) {
    const t = k.t || 0;
    const sb = k.sb || 0;
    const ts = k.ts == null ? 1 : k.ts;
    const w = k.w || 1;
    const hip = k.shAt ? sub(k.shAt, spineF([0, 0], t, sb, ts).pts[3]) : k.hip;
    const sp = spineF(hip, t, sb, ts);
    const S = sp.pts[3];
    const pc = perp(t + sb);
    const ph = perp(t);
    const shL = sub(S, mul(pc, WS * w));
    const shR = add(S, mul(pc, WS * w));
    const hL = sub(hip, mul(ph, HW));
    const hR = add(hip, mul(ph, HW));
    const as = k.as == null ? 1 : k.as;
    const ls = k.ls == null ? 1 : k.ls;
    const fsl = k.fsl == null ? 1 : k.fsl;
    const fsr = k.fsr == null ? 1 : k.fsr;
    const ssl = k.ssl == null ? 1 : k.ssl;
    const ssr = k.ssr == null ? 1 : k.ssr;
    const limb = (abs, pol, def, root, l1, l2) =>
      abs
        ? { pol: null, abs }
        : { pol: pol || def, abs: polar(root, (pol || def)[0], (l1 + l2) * (pol || def)[1]) };
    return {
      hip,
      anch: k.shAt || null,
      t,
      sb,
      ts,
      w,
      as,
      ls,
      fsl,
      fsr,
      ssl,
      ssr,
      aL: limb(k.hl, k.la, [96, 0.96], shL, UA * as, FA * as * fsl),
      aR: limb(k.hr, k.ra, [84, 0.96], shR, UA * as, FA * as * fsr),
      lL: limb(k.fl, k.ll, [90, 0.98], hL, TH * ls, SH * ls * ssl),
      lR: limb(k.fr, k.rl, [90, 0.98], hR, TH * ls, SH * ls * ssr),
      hd: k.hd || 0,
      elL: k.elL || 'out',
      elR: k.elR || 'out',
      kL: k.kL || 'out',
      kR: k.kR || 'out',
      d: k.d == null ? 1 : k.d,
      e: k.e || 'io',
    };
  }
  function mixF(a, b, u) {
    const tt = lerp(a.t, b.t, u);
    const sbb = lerp(a.sb, b.sb, u);
    const tss = lerp(a.ts, b.ts, u);
    let hip;
    let anch = null;
    if (a.anch && b.anch) {
      anch = lerpV(a.anch, b.anch, u);
      hip = sub(anch, spineF([0, 0], tt, sbb, tss).pts[3]);
    } else {
      hip = lerpV(a.hip, b.hip, u);
    }
    const angLerp = (x, y) => x + (((y - x + 540) % 360) - 180) * u;
    const mixL = (p, q) =>
      p.pol && q.pol
        ? { pol: [angLerp(p.pol[0], q.pol[0]), lerp(p.pol[1], q.pol[1], u)], abs: null }
        : { pol: null, abs: lerpV(p.abs, q.abs, u) };
    return {
      hip,
      anch,
      t: tt,
      sb: sbb,
      ts: tss,
      w: lerp(a.w, b.w, u),
      as: lerp(a.as, b.as, u),
      ls: lerp(a.ls, b.ls, u),
      fsl: lerp(a.fsl, b.fsl, u),
      fsr: lerp(a.fsr, b.fsr, u),
      ssl: lerp(a.ssl, b.ssl, u),
      ssr: lerp(a.ssr, b.ssr, u),
      aL: mixL(a.aL, b.aL),
      aR: mixL(a.aR, b.aR),
      lL: mixL(a.lL, b.lL),
      lR: mixL(a.lR, b.lR),
      hd: lerp(a.hd, b.hd, u),
      elL: a.elL,
      elR: a.elR,
      kL: a.kL,
      kR: a.kR,
    };
  }
  function ikPick(r, tg, l1, l2, mode, cx) {
    const A = ik(r, tg, l1, l2, 1);
    const B = ik(r, tg, l1, l2, -1);
    const sc = (m) =>
      mode === 'out'
        ? Math.abs(m[0] - cx)
        : mode === 'in'
          ? -Math.abs(m[0] - cx)
          : mode === 'up'
            ? -m[1]
            : mode === 'down'
              ? m[1]
              : mode === 'left'
                ? -m[0]
                : mode === 'right'
                  ? m[0]
                  : 0;
    return sc(A.mid) >= sc(B.mid) ? A : B;
  }
  function skeletonF(p) {
    const sp = spineF(p.hip, p.t, p.sb, p.ts);
    const S = sp.pts[3];
    const pc = perp(p.t + p.sb);
    const ph = perp(p.t);
    const W = WS * p.w;
    const shL = sub(S, mul(pc, W));
    const shR = add(S, mul(pc, W));
    const hL = sub(p.hip, mul(ph, HW));
    const hR = add(p.hip, mul(ph, HW));
    const tgt = (sp_, root, l1, l2) =>
      sp_.pol ? polar(root, sp_.pol[0], (l1 + l2) * sp_.pol[1]) : sp_.abs;
    const aL = p.as * UA;
    const aF = p.as * FA;
    const AL = ikPick(shL, tgt(p.aL, shL, aL, aF * p.fsl), aL, aF * p.fsl, p.elL, S[0]);
    const AR = ikPick(shR, tgt(p.aR, shR, aL, aF * p.fsr), aL, aF * p.fsr, p.elR, S[0]);
    const tl = p.ls * TH;
    const sl = p.ls * SH;
    const LL = ikPick(hL, tgt(p.lL, hL, tl, sl * p.ssl), tl, sl * p.ssl, p.kL, p.hip[0]);
    const LR = ikPick(hR, tgt(p.lR, hR, tl, sl * p.ssr), tl, sl * p.ssr, p.kR, p.hip[0]);
    const hdir = dirOf(p.t + p.sb + p.hd);
    const head = add(S, mul(hdir, 17));
    const toe = (an, side) => add(an, add(mul(ph, side * 8), mul(dirOf(p.t), -3)));
    return {
      hip: p.hip,
      sp,
      S,
      sh: S,
      ash: S,
      shL,
      shR,
      hL,
      hR,
      head,
      hdir,
      pc,
      ph,
      elL: AL.mid,
      hdL: AL.end,
      elR: AR.mid,
      hdR: AR.end,
      knL: LL.mid,
      anL: LL.end,
      knR: LR.mid,
      anR: LR.end,
      toeL: toe(LL.end, -1),
      toeR: toe(LR.end, 1),
    };
  }
  const pointsF = (s) => [
    s.hip,
    ...s.sp.pts,
    s.shL,
    s.shR,
    s.elL,
    s.elR,
    s.hdL,
    s.hdR,
    s.hL,
    s.hR,
    s.knL,
    s.knR,
    s.anL,
    s.anR,
    s.toeL,
    s.toeR,
  ];
  const spsF = (k, f, off, rx, ry, across) => {
    const o = onSpine(k.sp, f);
    const n = [-o.d[1], o.d[0]];
    return { c: add(o.c, mul(n, off)), ang: o.ang + (across ? 90 : 0), rx, ry };
  };
  const mid2 = (a, b, f = 0.5) => add(a, mul(sub(b, a), f));
  const angOf = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const segF = (a, b, f, rx, ry) => ({ c: mid2(a, b, f), ang: angOf(a, b), rx, ry });
  const MUSF = {
    chest: (k) => [spsF(k, 0.84, -9, 10, 8), spsF(k, 0.84, 9, 10, 8)],
    abs: (k) => [spsF(k, 0.4, 0, 12, 7)],
    obliques: (k) => [spsF(k, 0.42, -14, 12, 5), spsF(k, 0.42, 14, 12, 5)],
    lats: (k) => [spsF(k, 0.64, -15, 14, 6), spsF(k, 0.64, 15, 14, 6)],
    traps: (k) => [spsF(k, 0.95, 0, 17, 6, true)],
    lowback: (k) => [spsF(k, 0.16, 0, 14, 6, true)],
    glutes: (k) => [
      { c: k.hL, ang: 0, rx: 10, ry: 10 },
      { c: k.hR, ang: 0, rx: 10, ry: 10 },
    ],
    shoulders: (k) => [
      { c: k.shL, ang: 0, rx: 9, ry: 9 },
      { c: k.shR, ang: 0, rx: 9, ry: 9 },
    ],
    neck: (k) => [{ c: mid2(k.S, k.head), ang: angOf(k.S, k.head), rx: 10, ry: 5.5 }],
    hipflex: (k) => [
      { c: k.hL, ang: 0, rx: 7, ry: 9 },
      { c: k.hR, ang: 0, rx: 7, ry: 9 },
    ],
    biceps: (k) => [segF(k.shL, k.elL, 0.5, 15, 5), segF(k.shR, k.elR, 0.5, 15, 5)],
    triceps: (k) => [segF(k.shL, k.elL, 0.5, 15, 5), segF(k.shR, k.elR, 0.5, 15, 5)],
    forearms: (k) => [segF(k.elL, k.hdL, 0.5, 14, 4.5), segF(k.elR, k.hdR, 0.5, 14, 4.5)],
    quads: (k) => [segF(k.hL, k.knL, 0.5, 21, 7), segF(k.hR, k.knR, 0.5, 21, 7)],
    hamstrings: (k) => [segF(k.hL, k.knL, 0.5, 21, 7), segF(k.hR, k.knR, 0.5, 21, 7)],
    calves: (k) => [segF(k.knL, k.anL, 0.4, 15, 6), segF(k.knR, k.anR, 0.4, 15, 6)],
  };

  const VIEWS = {
    side: {
      resolve,
      mix,
      skeleton,
      points: (s) => [
        s.hip,
        ...s.sp.pts,
        s.el,
        s.hd,
        s.el2,
        s.hd2,
        s.kn,
        s.an,
        s.kn2,
        s.an2,
        s.toe,
        s.toe2,
      ],
      parts: PARTS,
      shapes: shapesFor,
      MUS,
      ctx: (s) => [overlayCtx(s, false), overlayCtx(s, true)],
      far: true,
    },
    front: {
      resolve: resolveF,
      mix: mixF,
      skeleton: skeletonF,
      points: pointsF,
      parts: PARTS_F,
      shapes: shapesForF,
      MUS: MUSF,
      ctx: (s) => [s],
      far: false,
    },
  };

  /* props */
  function drawProps(svg, props, vb) {
    const g = document.createElementNS(NS, 'g');
    const el = (n, at, par = g) => {
      const e = document.createElementNS(NS, n);
      for (const k in at) {
        e.setAttribute(k, at[k]);
      }
      par.appendChild(e);
      return e;
    };
    for (const p of props) {
      const [type, a, b, c, d] = p;
      if (type === 'floor') {
        el('line', { x1: vb[0] - 20, y1: FL, x2: vb[0] + vb[2] + 20, y2: FL, class: 'a-floor' });
      }
      if (type === 'wall') {
        el('rect', {
          x: b === 'L' ? a - 240 : a,
          y: vb[1] - 10,
          width: 240,
          height: FL - vb[1] + 10,
          class: 'a-wall',
        });
        el('line', { x1: a, y1: vb[1] - 10, x2: a, y2: FL, class: 'a-wallline' });
      }
      if (type === 'box') {
        el('rect', { x: a, y: b, width: c, height: d, rx: 3, class: 'a-box' });
      }
      if (type === 'bar') {
        const hw = c || 34;
        el('line', { x1: a - hw, y1: b, x2: a + hw, y2: b, class: 'a-bar' });
        el('line', { x1: a - hw, y1: b, x2: a - hw, y2: b - 60, class: 'a-rope' });
        el('line', { x1: a + hw, y1: b, x2: a + hw, y2: b - 60, class: 'a-rope' });
      }
      if (type === 'mat') {
        el('rect', { x: a, y: b, width: c, height: d, rx: 14, class: 'a-mat' });
      }
      if (type === 'rings') {
        el('line', { x1: a, y1: vb[1] - 10, x2: a, y2: b - 6, class: 'a-rope' });
        el('circle', { cx: a, cy: b, r: 6, class: 'a-ring' });
      }
      if (type === 'rail') {
        el('line', { x1: a, y1: b, x2: a + c, y2: b, class: 'a-bar' });
        el('line', { x1: a + 4, y1: b, x2: a + 4, y2: FL, class: 'a-rope' });
        el('line', { x1: a + c - 4, y1: b, x2: a + c - 4, y2: FL, class: 'a-rope' });
      }
      if (type === 'pole') {
        el('line', { x1: a, y1: vb[1], x2: a, y2: FL, class: 'a-bar' });
      }
      if (type === 'door') {
        el('line', { x1: a, y1: vb[1], x2: a, y2: FL, class: 'a-rope' });
      }
      if (type === 'band') {
        el('path', { d: `M${a} ${b} Q${c} ${d} ${p[5]} ${p[6]}`, class: 'a-band', fill: 'none' });
      }
    }
    svg.appendChild(g);
  }

  const EASE = { io: ease, lin: (t) => t, in: (t) => t * t, out: (t) => 1 - (1 - t) * (1 - t) };
  const flipE = (e) => (e === 'in' ? 'out' : e === 'out' ? 'in' : e);
  function buildSegs(keys, mode) {
    const n = keys.length;
    const segs = [];
    if (mode === 'yoyo') {
      for (let i = 0; i < n - 1; i++) {
        segs.push({ a: i, b: i + 1, w: keys[i].d, e: keys[i].e });
      }
      for (let i = n - 1; i > 0; i--) {
        segs.push({ a: i, b: i - 1, w: keys[i - 1].d, e: flipE(keys[i - 1].e) });
      }
    } else {
      for (let i = 0; i < n; i++) {
        segs.push({ a: i, b: (i + 1) % n, w: keys[i].d, e: keys[i].e });
      }
    }
    const tot = segs.reduce((x, s) => x + s.w, 0);
    let acc = 0;
    segs.forEach((s) => {
      s.t0 = acc / tot;
      acc += s.w;
      s.t1 = acc / tot;
    });
    return segs;
  }
  function seq(spec) {
    const V = VIEWS[spec.view || 'side'];
    const keys = spec.keys.map(V.resolve);
    const mode = spec.mode || 'yoyo';
    return {
      keys,
      V,
      n: keys.length,
      mode,
      dur: spec.dur || 3,
      segs: keys.length > 1 ? buildSegs(keys, mode) : [],
    };
  }
  function poseAt(sq, ph) {
    // ph in [0,1)
    if (sq.n === 1) {
      return sq.keys[0];
    }
    let s = sq.segs[sq.segs.length - 1];
    for (const g of sq.segs) {
      if (ph < g.t1) {
        s = g;
        break;
      }
    }
    const u = (ph - s.t0) / Math.max(1e-6, s.t1 - s.t0);
    return sq.V.mix(sq.keys[s.a], sq.keys[s.b], EASE[s.e](clamp01(u)));
  }

  function fitView(spec, sq, aspect) {
    let x0 = 1e9;
    let x1 = -1e9;
    let y0 = 1e9;
    let y1 = -1e9;
    const add = (p, r = 0) => {
      x0 = Math.min(x0, p[0] - r);
      x1 = Math.max(x1, p[0] + r);
      y0 = Math.min(y0, p[1] - r);
      y1 = Math.max(y1, p[1] + r);
    };
    for (let i = 0; i <= 24; i++) {
      const s = sq.V.skeleton(poseAt(sq, i / 24));
      sq.V.points(s).forEach((p) => add(p, 7));
      add(s.head, 13);
    }
    for (const p of spec.props || []) {
      const [t, a, b, c, d] = p;
      if (t === 'box') {
        add([a, b]);
        add([a + c, b + d]);
      }
      if (t === 'wall') {
        add([a, 100]);
      }
      if (t === 'mat') {
        add([a, b]);
        add([a + c, b + d]);
      }
      if (t === 'bar') {
        const hw = c || 34;
        add([a - hw, b - 40]);
        add([a + hw, b]);
      }
      if (t === 'rings') {
        add([a, b - 30]);
      }
      if (t === 'rail') {
        add([a, b]);
        add([a + c, b]);
      }
      if (t === 'pole') {
        add([a, 0]);
      }
      if (t === 'band') {
        add([a, b]);
        add([p[5], p[6]]);
      }
    }
    if (!spec.noFloor) {
      y1 = Math.max(y1, FL + 6);
    }
    const pad = 16;
    x0 -= pad;
    x1 += pad;
    y0 -= pad;
    y1 += pad;
    const asp = aspect || 360 / 220;
    let W = x1 - x0;
    let H = y1 - y0;
    if (W / H < asp) {
      W = H * asp;
    } else {
      H = W / asp;
    }
    if (W < 230) {
      W = 230;
      H = W / asp;
    }
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    let vy = cy - H / 2;
    if (!spec.noFloor && vy + H < FL + 8) {
      vy = FL + 8 - H;
    }
    return [cx - W / 2, vy, W, H];
  }

  const live = new Set();
  let raf = 0;
  let last = 0;
  function tick(ts) {
    for (const a of live) {
      if (!a.svg.isConnected) {
        live.delete(a);
        continue;
      }
      if (a.playing) {
        a.t += Math.max(0, Math.min(0.1, (ts - last) / 1000));
        a.draw((((a.t / a.sq.dur) % 1) + 1) % 1);
      }
    }
    last = ts;
    raf = live.size ? requestAnimationFrame(tick) : 0;
  }
  function start() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function mount(host, spec, opt = {}) {
    host.textContent = '';
    const sq = seq(spec);
    const V = sq.V;
    const vb = fitView(spec, sq, opt.asp);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', vb.join(' '));
    svg.setAttribute('class', 'anim-svg');
    svg.setAttribute('role', 'img');
    if (opt.label) {
      svg.setAttribute('aria-label', opt.label);
    }
    host.appendChild(svg);
    const props = (spec.noFloor ? [] : [['floor']]).concat(spec.props || []);
    drawProps(svg, props, vb);
    const mk = (n, at) => {
      const e = document.createElementNS(NS, n);
      for (const k in at) {
        e.setAttribute(k, at[k]);
      }
      svg.appendChild(e);
      return e;
    };
    let ticks = null;
    if (spec.scroll) {
      ticks = document.createElementNS(NS, 'g');
      for (let x = vb[0] - 120; x < vb[0] + vb[2] + 120; x += 40) {
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', x);
        l.setAttribute('x2', x);
        l.setAttribute('y1', FL + 4);
        l.setAttribute('y2', FL + 12);
        l.setAttribute('class', 'a-floor');
        ticks.appendChild(l);
      }
      svg.appendChild(ticks);
    }
    const st = STYLES.mannequin;
    const els = {};
    let order = V.parts;
    if (spec.legsOver && !V.far) {
      const legs = order.filter((n) => /^[lr](Th|Sh|Foot|jK|jH)$/.test(n));
      order = order.filter((n) => !legs.includes(n));
      order.splice(order.indexOf('head') + 1, 0, ...legs);
    }
    for (const nm of order) {
      const isFar = V.far && nm.startsWith('f') && nm !== 'fjE0';
      const p = mk('path', { class: 'a-part' + (isFar && nm !== 'spine' ? ' a-far' : '') });
      const sh = st.shade ? mk('path', { class: 'a-shade' }) : null;
      els[nm] = { p, sh };
    }
    const links = (spec.links || []).map((l) => ({ l, e: mk('path', { class: 'a-link' }) }));
    const mus = [];
    const lists = [
      ['s', (spec.mus && spec.mus.s) || []],
      ['p', (spec.mus && spec.mus.p) || []],
      ['st', (spec.mus && spec.mus.st) || []],
    ];
    for (const [kind, arr] of lists) {
      for (const m of arr) {
        if (!V.MUS[m]) {
          continue;
        }
        const limb =
          V.far && ['triceps', 'biceps', 'forearms', 'quads', 'hamstrings', 'calves'].includes(m);
        mus.push({
          m,
          e: mk('path', { fill: COL[kind], class: 'a-mus', opacity: 0.86 }),
          far: false,
        });
        if (limb) {
          mus.push({
            m,
            e: mk('path', { fill: COL[kind], class: 'a-mus', opacity: 0.4 }),
            far: true,
          });
        }
      }
    }
    function draw(ph) {
      const s = V.skeleton(poseAt(sq, ph));
      const out = V.shapes(st, s);
      for (const nm of order) {
        const o = out[nm];
        const e = els[nm];
        e.p.setAttribute('d', (o && o.d) || '');
        if (e.sh) {
          e.sh.setAttribute('d', (o && o.sd) || '');
        }
      }
      for (const { l, e } of links) {
        const A = s[l[0]];
        const B = s[l[1]];
        const m = mid2(A, B);
        e.setAttribute('d', 'M' + PT(A) + 'Q' + PT([m[0], m[1] + 6]) + ' ' + PT(B));
      }
      if (ticks) {
        ticks.setAttribute('transform', 'translate(' + f2(-(spec.scroll(ph) % 40)) + ' 0)');
      }
      const ctx = V.ctx(s);
      for (const o of mus) {
        const r = V.MUS[o.m](o.far ? ctx[1] : ctx[0]);
        const rs = Array.isArray(r) ? r : [r];
        o.e.setAttribute('d', rs.map((x) => st.mus(x.c, x.ang, x.rx, x.ry)).join(''));
      }
    }
    const a = { svg, sq, draw, t: 0, playing: !!opt.play };
    draw(opt.at == null ? 0.5 : opt.at);
    if (opt.play) {
      live.add(a);
      start();
    }
    a.phase = () => (((a.t / sq.dur) % 1) + 1) % 1;
    a.setPlaying = (v) => {
      a.playing = v;
      if (v) {
        live.add(a);
        start();
      }
    };
    return a;
  }
  function player(spec) {
    const sq = seq(spec);
    return {
      dur: sq.dur,
      scroll: spec.scroll,
      at: (ph) => {
        const p = poseAt(sq, ph);
        return { p, s: sq.V.skeleton(p) };
      },
    };
  }
  function sample(spec, ph) {
    const sq = seq(spec);
    const p = poseAt(sq, ph);
    return { p, s: sq.V.skeleton(p) };
  }
  return {
    mount,
    player,
    ik,
    rigid,
    resolve,
    skeleton,
    sample,
    T,
    shoulderOf: (hip, t, sb) => spineOf(hip, t, sb).pts[3],
    spineOf,
  };
})();

export { AN };
