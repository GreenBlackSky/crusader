/* The 3D mannequin (three.js r128): poses come from the 2D specs, lifted
   into 3D; a stage with props, a camera you can drag, and a render loop.
   Ported verbatim (only re-formatted); its API is in mannequin3d.d.ts. */
/* eslint-disable no-nested-ternary -- hand-tuned code kept as it was written; see docs/ROADMAP.md */

import * as THREE from 'three';
import { AN } from './engine.js';
import { ANIMF } from './front-specs.js';
import { ANIMS } from './side-specs.js';
import { intentW3 } from './descriptions.js';

/* ===== 3D mannequin (three.js). Poses come from the 2D specs, lifted into 3D ===== */
const A3 = (() => {
  if (typeof THREE === 'undefined') {
    return { ok: false };
  }
  const FLY = 200;
  const UA = 36;
  const FA = 34;
  const TH = 46;
  const SH = 44;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const rad = (d) => (d * Math.PI) / 180;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const P2 = (a, z = 0) => V(a[0], FLY - a[1], z);

  /* two-bone IK in 3D with a pole (the direction the middle joint points to) */
  function ik3(R, T, l1, l2, pole) {
    const d0 = T.clone().sub(R);
    let d = d0.length();
    const maxd = l1 + l2 - 0.02;
    const mind = Math.abs(l1 - l2) + 1;
    const a = d0.clone().normalize();
    if (d > maxd) {
      d = maxd;
    }
    if (d < mind) {
      d = mind;
    }
    const end = R.clone().add(a.clone().multiplyScalar(d));
    const al = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - al * al));
    const q = pole.clone().sub(a.clone().multiplyScalar(pole.dot(a)));
    if (q.lengthSq() < 1e-6) {
      q.set(0, 0, 1).sub(a.clone().multiplyScalar(a.z));
    }
    if (q.lengthSq() < 1e-6) {
      q.set(1, 0, 0);
    }
    q.normalize();
    return {
      mid: R.clone().add(a.multiplyScalar(al)).add(q.clone().multiplyScalar(h)),
      end,
      pole: q,
    };
  }
  const flare = (pole, out, deg) =>
    pole
      .clone()
      .multiplyScalar(Math.cos(rad(deg)))
      .add(out.clone().multiplyScalar(Math.sin(rad(deg))))
      .normalize();

  /* ---------- lifts: 2D skeleton -> 3D joints ---------- */
  const DEF = { hand: [21, 21], foot: [11, 11], flare: 22, kflare: 8, sw: 19, hw: 9 };
  function liftSide(s, w, ex) {
    const o = Object.assign({}, DEF, w || {});
    ex = ex || {};
    const J = { plane: 'side', right: V(0, 0, 1), tops: o.tops || [0] };
    const zo = (o.zo || 0) + (ex.zsh || 0);
    const psh = ex.psh || 0; /* zsh: the whole body slides sideways (archer push-up) */
    J.spine = s.sp.pts.map((p, i) => P2(p, zo + psh * (1 - i / 3)));
    // forward normal in the sagittal plane: screen (-dy, dx)/l, flipped to world y-up
    J.fwd = [0, 1, 2].map((i) => {
      const a = s.sp.pts[i];
      const b = s.sp.pts[i + 1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      return V(-dy / l, -(dx / l), 0);
    });
    const ash = P2(s.ash, zo);
    const hipC = P2(s.hip, zo + psh);
    J.pelvis = hipC;
    J.neckBase = J.spine[3];
    /* turning and leaning: tw = chest turn, pw = hip turn, rl = lean to the side, positive turns left / leans right (degrees) */
    const rotv = (v, ax, deg) => v.clone().applyAxisAngle(ax.clone().normalize(), rad(deg));
    let right0 = V(0, 0, 1);
    let right2 = V(0, 0, 1);
    let ashR = ash.clone();
    let roll = V(0, 0, 0);
    if (ex.rl) {
      const ax = J.fwd[0].clone();
      const P0 = J.spine[0];
      const rp = (p) => P0.clone().add(rotv(p.clone().sub(P0), ax, ex.rl));
      for (let i = 1; i < 4; i++) {
        J.spine[i] = rp(J.spine[i]);
      }
      ashR = rp(ash);
      roll = ashR.clone().sub(ash);
      J.fwd[1] = rotv(J.fwd[1], ax, ex.rl);
      J.fwd[2] = rotv(J.fwd[2], ax, ex.rl);
      right2 = rotv(right2, ax, ex.rl);
    }
    if (ex.tw) {
      const u2 = J.spine[3].clone().sub(J.spine[2]);
      right2 = rotv(right2, u2, ex.tw);
      J.fwd[2] = rotv(J.fwd[2], u2, ex.tw);
      const u1 = J.spine[2].clone().sub(J.spine[1]);
      J.fwd[1] = rotv(J.fwd[1], u1, ex.tw * 0.5 + (ex.pw || 0) * 0.5);
    }
    if (ex.pw) {
      const u0 = J.spine[1].clone().sub(J.spine[0]);
      right0 = rotv(right0, u0, ex.pw);
      J.fwd[0] = rotv(J.fwd[0], u0, ex.pw);
    }
    J.shR = ashR.clone().add(right2.clone().multiplyScalar(o.sw));
    J.shL = ashR.clone().sub(right2.clone().multiplyScalar(o.sw));
    J.hipR = hipC.clone().add(right0.clone().multiplyScalar(o.hw));
    J.hipL = hipC.clone().sub(right0.clone().multiplyScalar(o.hw));
    const polePlane = (root2, tg2, mid2, sgn) => {
      /* the way the elbow or knee points: the measured bend plus a small push toward the pose's chosen side, so a straightening limb never flips */
      let px = mid2[0] - (root2[0] + tg2[0]) / 2;
      let py = mid2[1] - (root2[1] + tg2[1]) / 2;
      const ux = tg2[0] - root2[0];
      const uy = tg2[1] - root2[1];
      const l = Math.hypot(ux, uy) || 1;
      px += -(uy / l) * sgn * 0.8;
      py += (ux / l) * sgn * 0.8;
      return V(px, -py, 0).normalize();
    };
    const arm = (side, el, hd) => {
      const sh = side > 0 ? J.shR : J.shL;
      const hz = side > 0 ? o.hand[0] : o.hand[1];
      const hzAbs = side > 0 ? ex.hzr : ex.hzl; /* hzr / hzl: exact sideways position of a hand */
      let T = V(
        hd[0],
        FLY - hd[1],
        hzAbs != null ? hzAbs : zo + side * hz + psh * (ex.hps || 0),
      ).add(roll);
      let pole = flare(
        polePlane(s.ash, hd, el, s.eb),
        V(0, 0, side),
        Array.isArray(o.flare) ? o.flare[side > 0 ? 0 : 1] : o.flare,
      );
      if (o.tarms) {
        T = sh.clone().add(V(0, 0, side * (UA + FA)));
        pole = V(0, -1, 0);
      }
      if (o.pole && o.pole[side > 0 ? 'R' : 'L']) {
        pole = V(...o.pole[side > 0 ? 'R' : 'L']).normalize();
      }
      const r = ik3(sh, T, UA, FA, pole);
      (J.gaps = J.gaps || []).push(T.distanceTo(r.end));
      return r;
    };
    const leg = (side, kn, an, toe) => {
      const hp = side > 0 ? J.hipR : J.hipL;
      const fz = side > 0 ? o.foot[0] : o.foot[1];
      let T = V(an[0], FLY - an[1], zo + side * fz);
      const rotY = (v) =>
        hipC.clone().add(
          v
            .clone()
            .sub(hipC)
            .applyAxisAngle(V(0, 1, 0), rad(ex.lsw || 0)),
        );
      if (ex.lsw) {
        T = rotY(T);
      }
      const pole0 = flare(
        polePlane(s.hip, an, kn, s.kb),
        V(0, 0, side),
        Array.isArray(o.kflare) ? o.kflare[side > 0 ? 0 : 1] : o.kflare,
      );
      const pole = ex.lsw ? pole0.clone().applyAxisAngle(V(0, 1, 0), rad(ex.lsw)) : pole0;
      const r = ik3(hp, T, TH, SH, pole);
      (J.gaps = J.gaps || []).push(T.distanceTo(r.end));
      r.toe = V(toe[0], FLY - toe[1], zo + side * fz);
      if (ex.lsw) {
        r.toe = rotY(r.toe);
      }
      if (o.grounded) {
        r.toe.y = Math.max(r.toe.y, 3.2);
      }
      /* a foot in the air points its toes along the leg (lever, planche, hollow, jumps); a foot that bears weight stays flat */
      const tops = o.tops || [0];
      const touch = tops.some((h) => Math.abs(r.toe.y - h) < 9 || Math.abs(r.end.y - h) < 12);
      const wall = (o.walls || []).find((w) => Math.abs(r.end.x - w.x) < 16 && r.end.y > 14);
      if (wall) {
        r.toe = r.end.clone().add(
          V(wall.out * 0.25, 1, 0)
            .normalize()
            .multiplyScalar(14),
        );
      } else if (!touch) {
        const f = r.toe.clone().sub(r.end).normalize();
        const l = r.end.clone().sub(r.mid).normalize();
        const al = l.y > -0.5 ? 0.9 : 0.35;
        r.toe = r.end.clone().add(
          l
            .multiplyScalar(al)
            .add(f.multiplyScalar(1 - al))
            .normalize()
            .multiplyScalar(14),
        );
      }
      return r;
    };
    const aR = arm(1, s.el, s.hd);
    const aL = arm(-1, s.el2, s.hd2);
    const lR = leg(1, s.kn, s.an, s.toe);
    const lL = leg(-1, s.kn2, s.an2, s.toe2);
    Object.assign(J, {
      elR: aR.mid,
      wrR: aR.end,
      pElR: aR.pole,
      elL: aL.mid,
      wrL: aL.end,
      pElL: aL.pole,
      knR: lR.mid,
      anR: lR.end,
      pKnR: lR.pole,
      toeR: lR.toe,
      knL: lL.mid,
      anL: lL.end,
      pKnL: lL.pole,
      toeL: lL.toe,
    });
    J.head = P2(s.head, zo);
    J.headFwd = V(-s.hdir[1], -s.hdir[0], 0);
    if (ex.rl) {
      const ax = V(0, 0, 0).copy(J.fwd[0]);
      const P0 = J.spine[0];
      J.head = P0.clone().add(rotv(J.head.clone().sub(P0), ax, ex.rl));
      J.headFwd = rotv(J.headFwd, ax, ex.rl);
    }
    J.headUp = J.head.clone().sub(J.spine[3]).normalize();
    if (ex.tw) {
      J.headFwd = rotv(J.headFwd, J.spine[3].clone().sub(J.spine[2]), ex.tw);
    }
    if (ex.hyw) {
      J.headFwd = rotv(J.headFwd, J.headUp, ex.hyw);
    }
    if (ex.hrl) {
      const hl = J.head.clone().sub(J.spine[3]).length();
      J.headUp = rotv(J.headUp, J.headFwd, ex.hrl);
      J.head = J.spine[3].clone().add(J.headUp.clone().multiplyScalar(hl));
    }
    if (ex.rk) {
      /* rock: roll the whole figure about its long axis, through the pelvis */
      const ax = J.spine[3].clone().sub(J.spine[0]).normalize();
      const c = J.pelvis.clone();
      const up = Math.abs(ex.rk) * 0.3;
      const rp = (p) =>
        c
          .clone()
          .add(p.clone().sub(c).applyAxisAngle(ax, rad(ex.rk)))
          .add(V(0, up, 0));
      const rd = (d) => d.clone().applyAxisAngle(ax, rad(ex.rk));
      [
        'pelvis',
        'neckBase',
        'shL',
        'shR',
        'hipL',
        'hipR',
        'elL',
        'elR',
        'wrL',
        'wrR',
        'knL',
        'knR',
        'anL',
        'anR',
        'toeL',
        'toeR',
        'head',
      ].forEach((k) => {
        if (J[k]) {
          J[k] = rp(J[k]);
        }
      });
      J.spine = J.spine.map(rp);
      J.fwd = J.fwd.map(rd);
      ['headUp', 'headFwd', 'pElL', 'pElR', 'pKnL', 'pKnR'].forEach((k) => {
        if (J[k]) {
          J[k] = rd(J[k]);
        }
      });
    }
    return J;
  }
  function liftFrontal(s, w, top, ex) {
    ex = ex || {};
    const J = { plane: top ? 'top' : 'front', tops: [0] };
    const M = (a, h) => (top ? V(a[0], h == null ? 12 : h, a[1]) : V(a[0], FLY - a[1], 0));
    J.spine = s.sp.pts.map((p) => M(p, 13));
    const fwd = top ? V(0, -1, 0) : V(0, 0, 1);
    J.fwd = [fwd.clone(), fwd.clone(), fwd.clone()];
    J.right = top ? V(0, 0, -1) : V(-1, 0, 0);
    J.pelvis = M(s.hip, 13);
    J.neckBase = J.spine[3];
    J.shL = M(s.shL, 14);
    J.shR = M(s.shR, 14);
    J.hipL = M(s.hL, 12);
    J.hipR = M(s.hR, 12);
    const outward = (p, c) => {
      const d = p.x - c.x;
      return V(d >= 0 ? 1 : -1, 0, 0);
    };
    const polePl = (rootP, tgP, midP) => {
      const m = rootP.clone().add(tgP).multiplyScalar(0.5);
      const d = midP.clone().sub(m);
      return d.lengthSq() < 0.25 ? null : d.normalize();
    };
    const arm = (sh, el2, hd2, fs) => {
      const T = M(hd2, top ? 15 : 0);
      const mid = M(el2, top ? 15 : 0);
      if (!top && fs != null && fs < 0.999) {
        T.z += FA * Math.sqrt(1 - fs * fs);
      }
      if (!top && ex.as != null && ex.as < 0.999) {
        const dz = (UA + FA) * Math.sqrt(1 - ex.as * ex.as);
        T.z += dz;
        mid.z += dz * 0.5;
      }
      let pole = polePl(sh, T, mid) || (top ? V(0, 0, -1) : outward(sh, J.spine[3]));
      if (!top && ex.as != null && ex.as < 0.999) {
        pole = outward(sh, J.spine[3]);
      } /* arms reaching toward the camera bend sideways */
      const r = ik3(sh, T, UA, FA, pole);
      (J.gaps = J.gaps || []).push(T.distanceTo(r.end));
      return r;
    };
    const leg = (hp, kn2, an2) => {
      const T = M(an2, top ? 11 : 0);
      const mid = M(kn2, top ? 11 : 0);
      const pole = polePl(hp, T, mid) || (top ? V(0, 0, 1) : outward(hp, J.pelvis));
      const r = ik3(hp, T, TH, SH, pole);
      (J.gaps = J.gaps || []).push(T.distanceTo(r.end));
      return r;
    };
    const aL = arm(J.shL, s.elL, s.hdL, ex.fsl);
    const aR = arm(J.shR, s.elR, s.hdR, ex.fsr);
    const lL = leg(J.hipL, s.knL, s.anL);
    const lR = leg(J.hipR, s.knR, s.anR);
    const toeOf = (an) =>
      top
        ? an
            .clone()
            .add(V(0, 0, 0))
            .add(V(0, -2, 0))
            .add(V(-1, 0, 0).multiplyScalar(0))
        : an.clone().add(V(0, -2, 12));
    Object.assign(J, {
      elL: aL.mid,
      wrL: aL.end,
      pElL: aL.pole,
      elR: aR.mid,
      wrR: aR.end,
      pElR: aR.pole,
      knL: lL.mid,
      anL: lL.end,
      pKnL: lL.pole,
      knR: lR.mid,
      anR: lR.end,
      pKnR: lR.pole,
    });
    if (top) {
      const dir = J.pelvis.clone().sub(J.spine[3]).setY(0).normalize();
      J.toeL = J.anL
        .clone()
        .add(dir.clone().multiplyScalar(13))
        .add(V(0, -2, 0));
      J.toeR = J.anR
        .clone()
        .add(dir.clone().multiplyScalar(13))
        .add(V(0, -2, 0));
    } /* lying prone: feet rest flat, toes pointing away from the head */
    else {
      J.toeL = toeOf(J.anL);
      J.toeR = toeOf(J.anR);
    }
    J.head = M(s.head, 14);
    J.headUp = J.head.clone().sub(J.spine[3]).normalize();
    J.headFwd = fwd.clone();
    return J;
  }
  return {
    ok: true,
    THREE_V: THREE.REVISION,
    V,
    P2,
    ik3,
    liftSide,
    liftFrontal,
    FLY,
    DEF,
    clamp,
    rad,
  };
})();

/* ===== 3D mannequin: segments, joints and muscles ===== */
(() => {
  if (!A3.ok) {
    return;
  }
  const { V } = A3;
  const UA = 36;
  const FA = 34;
  const TH = 46;
  const SH = 44;
  const COLS = { p: 0xe8553a, s: 0xf4b63f, st: 0x3b8edb };

  function capsuleGeo(r0, r1, L, seg = 20) {
    const pts = [];
    const N = 7;
    for (let i = 0; i <= N; i++) {
      const t = -Math.PI / 2 + ((Math.PI / 2) * i) / N;
      pts.push(new THREE.Vector2(Math.max(0.001, r0 * Math.cos(t)), r0 * Math.sin(t)));
    }
    for (let i = 0; i <= N; i++) {
      const t = ((Math.PI / 2) * i) / N;
      pts.push(new THREE.Vector2(Math.max(0.001, r1 * Math.cos(t)), L + r1 * Math.sin(t)));
    }
    return new THREE.LatheGeometry(pts, seg);
  }
  const sphereGeo = new THREE.SphereGeometry(1, 24, 16);

  /* muscle map: name -> [node, [x, y, z], [sx, sy, sz]]. Torso nodes are centred; limb nodes start at the proximal joint */
  const MUSC = {
    chest: [
      ['chest', [-9.5, 3, 10.5], [9.5, 7, 4.5]],
      ['chest', [9.5, 3, 10.5], [9.5, 7, 4.5]],
    ],
    lats: [
      ['chest', [-13, -2, -9], [8, 11, 4]],
      ['chest', [13, -2, -9], [8, 11, 4]],
    ],
    traps: [
      ['chest', [0, 10, -9.5], [13, 7, 4]],
      ['chest', [0, 4, -10], [8, 6, 3.4]],
    ],
    abs: [
      ['abd', [0, 1, 8.8], [6.5, 11, 3.2]],
      ['pelvis', [0, 5, 10], [6, 6, 2.8]],
    ],
    obliques: [
      ['abd', [-10, 0, 3.5], [3.8, 9, 6]],
      ['abd', [10, 0, 3.5], [3.8, 9, 6]],
    ],
    lowback: [
      ['abd', [-4.5, -1, -8], [3.8, 9, 3]],
      ['abd', [4.5, -1, -8], [3.8, 9, 3]],
    ],
    glutes: [
      ['pelvis', [-8.5, -2, -9.5], [8.2, 8, 5.5]],
      ['pelvis', [8.5, -2, -9.5], [8.2, 8, 5.5]],
    ],
    hipflex: [
      ['pelvis', [-8, 5, 9], [4, 7, 3]],
      ['pelvis', [8, 5, 9], [4, 7, 3]],
    ],
    neck: [['neck', [0, 4, 0], [4.4, 7, 4.4]]],
    shoulders: [
      ['uaL', [0, 3, 0], [7.4, 9, 7.4]],
      ['uaR', [0, 3, 0], [7.4, 9, 7.4]],
    ],
    biceps: [
      ['uaL', [0, 16, 4.6], [3.9, 12, 3.2]],
      ['uaR', [0, 16, 4.6], [3.9, 12, 3.2]],
    ],
    triceps: [
      ['uaL', [0, 17, -4.8], [3.9, 13, 3.4]],
      ['uaR', [0, 17, -4.8], [3.9, 13, 3.4]],
    ],
    forearms: [
      ['faL', [0, 12, 2], [3.7, 12, 3.4]],
      ['faR', [0, 12, 2], [3.7, 12, 3.4]],
    ],
    quads: [
      ['thL', [0, 22, 6.8], [6.4, 19, 5]],
      ['thR', [0, 22, 6.8], [6.4, 19, 5]],
    ],
    hamstrings: [
      ['thL', [0, 22, -6.6], [6.1, 19, 4.8]],
      ['thR', [0, 22, -6.6], [6.1, 19, 4.8]],
    ],
    calves: [
      ['shL', [0, 14, -4.6], [4.7, 12, 4.2]],
      ['shR', [0, 14, -4.6], [4.7, 12, 4.2]],
    ],
  };

  function build() {
    const root = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x566677).convertSRGBToLinear(),
      roughness: 0.55,
      metalness: 0.04,
    });
    const nodes = {};
    const shapes = {};
    const node = (name, geo, scale, pos) => {
      const g = new THREE.Group();
      root.add(g);
      const m = new THREE.Mesh(geo, body);
      m.castShadow = true;
      if (scale) {
        m.scale.set(scale[0], scale[1], scale[2]);
      }
      if (pos) {
        m.position.set(pos[0], pos[1], pos[2]);
      }
      g.add(m);
      nodes[name] = g;
      shapes[name] = m;
      return g;
    };
    ['L', 'R'].forEach((sd) => {
      node('ua' + sd, capsuleGeo(5.6, 4.4, UA));
      node('fa' + sd, capsuleGeo(4.4, 3.2, FA));
      node('th' + sd, capsuleGeo(8.4, 6.2, TH));
      node('sh' + sd, capsuleGeo(6, 3.8, SH));
      const hn = node('hd' + sd, sphereGeo, [4.4, 5.4, 2.1], [0, 5, 0]);
      const fing = new THREE.Mesh(sphereGeo, body);
      fing.scale.set(3.9, 4, 1.7);
      fing.position.set(0, 10.4, 0);
      fing.castShadow = true;
      hn.add(fing);
      const thumb = new THREE.Mesh(sphereGeo, body);
      thumb.scale.set(1.7, 3.4, 1.6);
      thumb.position.set(sd === 'L' ? -4.2 : 4.2, 5.2, 0);
      thumb.castShadow = true;
      hn.add(thumb);
      const fn = node('ft' + sd, sphereGeo, [3.9, 6.6, 2.9], [0, 7.4, 0]);
      const heel = new THREE.Mesh(sphereGeo, body);
      heel.scale.set(3.5, 3.6, 3.4);
      heel.position.set(0, -0.6, -0.2);
      heel.castShadow = true;
      fn.add(heel);
    });
    node('pelvis', sphereGeo, [17, 12.5, 11]);
    node('abd', sphereGeo, [12, 9, 9.5]);
    node('chest', sphereGeo, [21, 14.5, 12.5]);
    node('girdle', capsuleGeo(4.6, 4.6, 38));
    node('hipbar', capsuleGeo(6, 6, 18));
    node('sp0', capsuleGeo(4.4, 4.4, 24));
    node('sp1', capsuleGeo(4.4, 4.4, 16));
    node('sp2', capsuleGeo(4.4, 4.4, 24));
    node('neck', capsuleGeo(3.7, 3.7, 8));
    node('head', sphereGeo, [9.2, 11.6, 10.2]);
    const nose = new THREE.Mesh(sphereGeo, body);
    nose.scale.set(2, 2.6, 2.8);
    nose.position.set(0, -1.5, 9.8);
    nodes.head.add(nose);
    const eyes = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x26323f).convertSRGBToLinear(),
        roughness: 0.5,
      }),
    );
    eyes.scale.set(6.2, 1.1, 1);
    eyes.position.set(0, 2.6, 9.2);
    nodes.head.add(eyes);
    /* muscles */
    const mats = {};
    for (const k in COLS) {
      mats[k] = new THREE.MeshStandardMaterial({
        color: new THREE.Color(COLS[k]).convertSRGBToLinear(),
        emissive: new THREE.Color(COLS[k]).convertSRGBToLinear(),
        emissiveIntensity: 0.3,
        roughness: 0.5,
        transparent: true,
        opacity: 0.93,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
    }
    const muscles = {};
    for (const name in MUSC) {
      muscles[name] = MUSC[name].map(([nd, p, sc]) => {
        const m = new THREE.Mesh(sphereGeo, mats.p);
        m.position.set(p[0], p[1], p[2]);
        m.scale.set(sc[0], sc[1], sc[2]);
        m.visible = false;
        nodes[nd].add(m);
        return m;
      });
    }
    return { root, nodes, shapes, body, muscles, mats, nose, eyes };
  }

  const _m = new THREE.Matrix4();
  function orient(n, y, zHint) {
    const yy = y.clone().normalize();
    const z = zHint.clone().sub(yy.clone().multiplyScalar(zHint.dot(yy)));
    if (z.lengthSq() < 1e-6) {
      z.set(0, 0, 1);
      z.sub(yy.clone().multiplyScalar(z.dot(yy)));
    }
    if (z.lengthSq() < 1e-6) {
      z.set(1, 0, 0);
      z.sub(yy.clone().multiplyScalar(z.dot(yy)));
    }
    z.normalize();
    const x = new THREE.Vector3().crossVectors(yy, z);
    _m.makeBasis(x, yy, z);
    n.quaternion.setFromRotationMatrix(_m);
  }
  /* the direction a hand points and which way its palm faces: flat on a surface it presses, otherwise it follows the forearm */
  function handFrame(J, B, C, front) {
    const up = V(0, 1, 0);
    const fa = C.clone().sub(B).normalize();
    const tops = J.tops || [0];
    const dist = Math.min(...tops.map((h) => Math.abs(C.y - (h + 5))));
    const k = Math.max(0, Math.min(1, 1 - (dist - 3) / 6));
    let fw;
    if (J.plane === 'front') {
      fw = V(0, 0, 1);
    } else if (J.plane === 'top') {
      fw = J.spine[3].clone().sub(J.spine[0]);
      fw.y = 0;
      if (fw.length() < 0.1) {
        fw.set(1, 0, 0);
      }
      fw.normalize();
    } else {
      /* which way the body faces along the floor: where the spine leans toward its head, or (when it is upright or inverted) where the chest faces */
      const sp = J.spine[3].clone().sub(J.spine[0]);
      sp.y = 0;
      const cf = J.fwd[2].clone();
      cf.y = 0;
      if (sp.length() > 18) {
        fw = V(sp.x < 0 ? -1 : 1, 0, 0);
      } else if (cf.length() > 0.3) {
        fw = V(cf.x < 0 ? -1 : 1, 0, 0);
      } else {
        fw = V(1, 0, 0);
      }
    }
    /* a hand on a surface continues the way the forearm leans along it; only a vertical forearm falls back to the body's facing direction */
    const hz = fa.clone();
    hz.y = 0;
    const hl = hz.length();
    const w = Math.max(0, Math.min(1, (hl - 0.15) / 0.45));
    const heading = hl > 1e-3 ? hz.divideScalar(hl) : fw.clone();
    const flat = heading
      .multiplyScalar(w)
      .add(fw.clone().multiplyScalar(1 - w))
      .normalize();
    const dir = fa
      .clone()
      .multiplyScalar(1 - k)
      .add(flat.multiplyScalar(k))
      .normalize();
    const hint = front
      .clone()
      .multiplyScalar(1 - k)
      .add(up.clone().multiplyScalar(k));
    return { dir, hint, k, fa, facing: fw };
  }
  function pose(M, J) {
    const N = M.nodes;
    const S = J.spine;
    const up = V(0, 1, 0);
    /* torso */
    const seg = (name, a, b, f, center, off = 0) => {
      const d = b.clone().sub(a);
      const l = d.length();
      orient(N[name], d, f);
      N[name].position.copy(
        center
          ? a
              .clone()
              .add(d.clone().multiplyScalar(0.5))
              .add(d.clone().normalize().multiplyScalar(off))
          : a,
      );
      return l;
    };
    seg('pelvis', S[0], S[1], J.fwd[0], true, -2.5);
    seg('abd', S[1], S[2], J.fwd[1], true);
    seg('chest', S[2], S[3], J.fwd[2], true, 1.5);
    seg('sp0', S[0], S[1], J.fwd[0], false);
    seg('sp1', S[1], S[2], J.fwd[1], false);
    seg('sp2', S[2], S[3], J.fwd[2], false);
    /* girdle and hip bar */
    const gd = J.shR.clone().sub(J.shL);
    const gl = gd.length();
    orient(N.girdle, gd, J.fwd[2]);
    N.girdle.position.copy(J.shL);
    M.shapes.girdle.scale.y = gl / 38;
    const hd = J.hipR.clone().sub(J.hipL);
    const hl = hd.length();
    orient(N.hipbar, hd, J.fwd[0]);
    N.hipbar.position.copy(J.hipL);
    M.shapes.hipbar.scale.y = hl / 18;
    /* head and neck */
    orient(N.head, J.headUp, J.headFwd);
    N.head.position.copy(J.head);
    const nd = J.head.clone().sub(S[3]);
    const nl = nd.length();
    orient(N.neck, nd, J.fwd[2]);
    N.neck.position.copy(S[3]);
    M.shapes.neck.scale.y = Math.max(0.2, (nl - 7) / 8);
    /* limbs */
    const limb = (n1, n2, nh, A, B, C, front, _hand) => {
      orient(N[n1], B.clone().sub(A), front);
      N[n1].position.copy(A);
      orient(N[n2], C.clone().sub(B), front);
      N[n2].position.copy(B);
      if (nh) {
        const hf = handFrame(J, B, C, front);
        const dir = hf.dir;
        const hint = hf.hint;
        const k = hf.k;
        orient(N[nh], dir, hint);
        N[nh].position.copy(C).add(V(0, -2.3 * k, 0));
      }
    };
    limb('uaL', 'faL', 'hdL', J.shL, J.elL, J.wrL, J.pElL.clone().negate());
    limb('uaR', 'faR', 'hdR', J.shR, J.elR, J.wrR, J.pElR.clone().negate());
    limb('thL', 'shL', null, J.hipL, J.knL, J.anL, J.pKnL);
    limb('thR', 'shR', null, J.hipR, J.knR, J.anR, J.pKnR);
    const foot = (n, an, toe) => {
      const d = toe.clone().sub(an);
      if (d.lengthSq() < 1) {
        d.set(0, 0, 1);
      }
      orient(N[n], d, up);
      N[n].position.copy(an);
    };
    foot('ftL', J.anL, J.toeL);
    foot('ftR', J.anR, J.toeR);
  }
  function setMuscles(M, mus) {
    for (const k in M.muscles) {
      M.muscles[k].forEach((m) => (m.visible = false));
    }
    const on = (list, kind) =>
      (list || []).forEach((n) =>
        (M.muscles[n] || []).forEach((m) => {
          m.visible = true;
          m.material = M.mats[kind];
        }),
      );
    on(mus && mus.st, 'st');
    on(mus && mus.s, 's');
    on(mus && mus.p, 'p');
  }
  Object.assign(A3, { build, pose, setMuscles, capsuleGeo, handFrame });
})();

/* ===== 3D stage: scene, props, camera and the render loop ===== */
(() => {
  if (!A3.ok) {
    return;
  }
  const { V, FLY } = A3;
  let R = null;
  let current = null;
  const cssColor = (name, fb) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return new THREE.Color(v || fb).convertSRGBToLinear();
  };

  function ensure() {
    if (R) {
      return R;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'a3-canvas';
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: !!A3.debug,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1.6, 5, 4000);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8b9a, 0.72));
      const sun = new THREE.DirectionalLight(0xffffff, 0.62);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      scene.add(sun);
      scene.add(sun.target);
      const M = A3.build();
      scene.add(M.root);
      const props = new THREE.Group();
      scene.add(props);
      R = { canvas, renderer, scene, camera, sun, M, props, w: 0, h: 0, raf: 0 };
      bindInput(R);
      return R;
    } catch (e) {
      console.warn('WebGL unavailable', e);
      A3.ok = false;
      return null;
    }
  }
  A3.available = () => !!ensure();

  const PLANES = { side: 90, front: 0, top: 0 };
  function presetAngles(info, name) {
    const fa = PLANES[info.plane] || 0;
    if (name === 'side') {
      return { az: fa - 90, el: 4 };
    }
    if (name === 'front') {
      return { az: fa, el: 4 };
    }
    if (name === 'top') {
      return { az: 0, el: 86 };
    }
    const wallR = (info.spec.props || []).some((p) => p[0] === 'wall' && p[2] !== 'L');
    return info.plane === 'side'
      ? { az: wallR ? -30 : 38, el: 14 }
      : info.plane === 'front'
        ? { az: -26, el: 12 }
        : { az: 0, el: 76 };
  }

  function bindInput(r) {
    let drag = null;
    r.canvas.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY };
      try {
        r.canvas.setPointerCapture(e.pointerId);
      } catch {
        /* capture is optional */
      }
    });
    r.canvas.addEventListener('pointermove', (e) => {
      if (!drag || !current) {
        return;
      }
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      current.target.az -= dx * 0.55;
      current.az = current.target.az;
      current.target.el = Math.max(2, Math.min(88, current.target.el + dy * 0.35));
      current.el = current.target.el;
      current.preset = 'free';
      current.onPreset?.('free');
    });
    const end = () => {
      drag = null;
    };
    r.canvas.addEventListener('pointerup', end);
    r.canvas.addEventListener('pointercancel', end);
    r.canvas.addEventListener(
      'wheel',
      (e) => {
        if (!current) {
          return;
        }
        e.preventDefault();
        current.zoom = Math.max(0.55, Math.min(2.2, current.zoom * (e.deltaY > 0 ? 1.08 : 0.92)));
      },
      { passive: false },
    );
  }

  function buildProps(spec, plane, floorY) {
    const g = new THREE.Group();
    const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0 });
    const prop = mat(cssColor('--prop', '#C6CFD9'));
    const wallM = mat(cssColor('--prop-fill', '#D5DCE4'));
    const metal = mat(cssColor('--prop-line', '#8C99A7'));
    const add = (geo, m, x, y, z, shadow = true) => {
      const me = new THREE.Mesh(geo, m);
      me.position.set(x, y, z);
      me.castShadow = shadow;
      me.receiveShadow = true;
      g.add(me);
      return me;
    };
    const cyl = (r, len, axis) => {
      const geo = new THREE.CylinderGeometry(r, r, len, 14);
      if (axis === 'z') {
        geo.rotateX(Math.PI / 2);
      }
      if (axis === 'x') {
        geo.rotateZ(Math.PI / 2);
      }
      return geo;
    };
    const ceil = FLY + 150;
    const floor = add(
      new THREE.CircleGeometry(420, 56),
      mat(cssColor('--prop-fill', '#D5DCE4').multiplyScalar(0.9)),
      0,
      floorY,
      0,
      false,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = false;
    if (spec.pal3) {
      /* two parallettes, one under each hand */
      const bx = spec.pal3.x;
      const by = FLY - spec.pal3.top - 2.4;
      [-22, 22].forEach((z) => {
        add(cyl(2.4, 38, 'x'), metal, bx, by, z);
        [-15, 15].forEach((dx) =>
          add(cyl(1.8, by - floorY, 'y'), metal, bx + dx, floorY + (by - floorY) / 2, z),
        );
      });
    }
    const rings = [];
    for (const p of spec.props || []) {
      const [t, a, b, c, d] = p;
      if (t === 'box') {
        if (!spec.pal3) {
          add(new THREE.BoxGeometry(c, d, 84), prop, a + c / 2, FLY - (b + d / 2), 0);
        }
      } else if (t === 'wall') {
        const hgt = Math.min(ceil - floorY, 230);
        const left = p[2] === 'L';
        const geo = new THREE.PlaneGeometry(300, hgt);
        geo.rotateY(left ? Math.PI / 2 : -Math.PI / 2);
        const wm = new THREE.MeshStandardMaterial({
          color: wallM.color.clone().lerp(new THREE.Color(1, 1, 1), 0.35),
          roughness: 0.95,
          side: THREE.FrontSide,
        });
        add(geo, wm, a, floorY + hgt / 2, 0, false);
      } else if (t === 'bar') {
        const y = FLY - b;
        if (plane === 'side') {
          const hw = 46;
          add(cyl(1.9, hw * 2, 'z'), metal, a, y, 0);
          [-hw, hw].forEach((z) =>
            add(cyl(1.6, y + 26 - floorY, 'y'), metal, a, floorY + (y + 26 - floorY) / 2, z),
          );
        } else {
          const hw = c || 34;
          add(cyl(1.9, hw * 2, 'x'), metal, a, y, 0);
          [-hw, hw].forEach((x) => add(cyl(1.6, 70, 'y'), metal, a + x, y + 35, 0));
        }
      } else if (t === 'wallz') {
        const hgt = ceil - floorY;
        add(
          new THREE.BoxGeometry(900, hgt, 24),
          wallM,
          180,
          floorY + hgt / 2,
          a + (a < 0 ? -12 : 12),
          false,
        );
      } else if (t === 'rings') {
        rings.push([a, FLY - b]);
      } else if (t === 'rail') {
        const y = FLY - b;
        [-24, 24].forEach((z) => {
          add(cyl(1.9, c, 'x'), metal, a + c / 2, y, z);
          [a + 4, a + c - 4].forEach((x) =>
            add(cyl(1.5, y - floorY, 'y'), metal, x, floorY + (y - floorY) / 2, z),
          );
        });
      } else if (t === 'pole') {
        add(cyl(2.4, ceil - floorY, 'y'), metal, a, floorY + (ceil - floorY) / 2, 0);
      } else if (t === 'mat') {
        const gm =
          plane === 'top' ? new THREE.BoxGeometry(c, 3, d) : new THREE.BoxGeometry(c, 2, 56);
        const cx = plane === 'top' ? a + c / 2 : a + c / 2;
        const cz = plane === 'top' ? b + d / 2 : 0;
        add(gm, prop, cx, floorY + 1.5, cz, false);
      }
    }
    if (rings.length) {
      const place = (x, y, z) => {
        const tor = add(new THREE.TorusGeometry(6.5, 1.3, 10, 24), metal, x, y, z);
        tor.rotation.y = (Math.PI / 2) * (plane === 'side' ? 1 : 0);
        add(cyl(0.5, ceil - y, 'y'), metal, x, y + (ceil - y) / 2, z, false);
      };
      if (plane === 'side') {
        const mx = rings.reduce((s, r) => s + r[0], 0) / rings.length;
        const y = rings[0][1];
        [-24, 24].forEach((z) => place(mx, y, z));
      } else {
        rings.forEach(([x, y]) => place(x, y, 0));
      }
    }
    return g;
  }

  function mount(host, info, opt = {}) {
    const r = ensure();
    if (!r) {
      return null;
    }
    if (current) {
      current.stop();
      current = null;
    }
    const spec = info.spec;
    const dur = spec.dur || 3;
    const tops = [0];
    (spec.props || []).forEach((p) => {
      if (p[0] === 'box') {
        tops.push(FLY - p[2]);
      }
    });
    const walls = (spec.props || [])
      .filter((p) => p[0] === 'wall')
      .map((p) => ({ x: p[1], out: p[2] === 'L' ? 1 : -1 }));
    const w3g = Object.assign({}, info.w3, { grounded: !spec.noFloor, tops, walls });
    const lift = (ph) => {
      const { s, p } = AN.sample(spec, ph);
      return info.plane === 'side'
        ? A3.liftSide(s, w3g, {
            tw: p.tw,
            pw: p.pw,
            rl: p.rl,
            hrl: p.hrl,
            hyw: p.hyw,
            lsw: p.lsw,
            psh: p.psh,
            hps: p.hps,
            rk: p.rk,
            zsh: p.zsh,
            hzr: p.hzr,
            hzl: p.hzl,
          })
        : A3.liftFrontal(s, w3g, info.plane === 'top', { as: p.as, fsl: p.fsl, fsr: p.fsr });
    };
    const names = [
      'spine',
      'neckBase',
      'shL',
      'shR',
      'elL',
      'elR',
      'wrL',
      'wrR',
      'hipL',
      'hipR',
      'knL',
      'knR',
      'anL',
      'anR',
      'toeL',
      'toeR',
      'head',
    ];
    const box = new THREE.Box3();
    let minY = 1e9;
    for (let i = 0; i < 32; i++) {
      const J = lift(i / 32);
      names.forEach((n) => {
        const v = J[n];
        (Array.isArray(v) ? v : [v]).forEach((p) => {
          box.expandByPoint(p);
          minY = Math.min(minY, p.y);
        });
      });
    }
    const floorY = spec.noFloor && info.plane !== 'top' ? minY - 10 : 0;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const rad = Math.max(40, size.length() * 0.5 + 8);
    r.props.clear();
    r.props.add(buildProps(spec, info.plane, floorY));
    A3.setMuscles(r.M, spec.mus);
    const bodyCol = cssColor('--fig', '#566677');
    r.M.body.color.copy(bodyCol);
    host.textContent = '';
    host.appendChild(r.canvas);

    const box8 = [];
    for (let i = 0; i < 8; i++) {
      box8.push(
        V(
          i & 1 ? box.max.x + 6 : box.min.x - 6,
          i & 2 ? box.max.y + 6 : box.min.y - 6,
          i & 4 ? box.max.z + 6 : box.min.z - 6,
        ),
      );
    }
    const h = {
      host,
      info,
      az: 0,
      el: 0,
      zoom: 1,
      t: 0,
      playing: !!opt.play,
      preset: opt.preset || '3d',
      target: presetAngles(info, opt.preset || '3d'),
      last: 0,
      stopped: false,
    };
    h.az = h.target.az;
    h.el = h.target.el;
    /* moving ground for the broad jump: the figure stays put and the floor marks slide past it */
    let ticks = null;
    if (spec.scroll) {
      ticks = new THREE.Group();
      const tm = new THREE.MeshStandardMaterial({
        color: cssColor('--line-strong', '#9AA7B4'),
        roughness: 0.9,
      });
      for (let x = -640; x <= 640; x += 40) {
        const tk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 170), tm);
        tk.position.set(center.x + x, floorY + 0.3, center.z);
        tk.receiveShadow = true;
        ticks.add(tk);
      }
      r.props.add(ticks);
    }
    /* a resistance band running from the bar down to the knee that sits in it */
    let bandM = null;
    const barP = (spec.props || []).find((p) => p[0] === 'bar');
    if (spec.bandTo && barP) {
      bandM = new THREE.Mesh(
        new THREE.CylinderGeometry(2.1, 2.1, 1, 12),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xf08a24).convertSRGBToLinear(),
          roughness: 0.7,
        }),
      );
      bandM.castShadow = true;
      r.props.add(bandM);
    }
    const linkLine =
      spec.links && spec.links.length
        ? new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(1, 0, 0)]),
            new THREE.LineBasicMaterial({ color: 0x7a8aa0 }),
          )
        : null;
    if (linkLine) {
      r.props.add(linkLine);
    }
    h.phase = () => (((h.t / dur) % 1) + 1) % 1;
    h.stop = () => {
      h.stopped = true;
    };
    h.setPlaying = (v) => {
      h.playing = v;
      kick();
    };
    h.setPreset = (name) => {
      h.preset = name;
      h.target = presetAngles(info, name);
      kick();
    };
    h.draw = (ph) => {
      const J = lift(ph);
      A3.pose(r.M, J);
      if (bandM) {
        const A = V(barP[1] + 20, FLY - barP[2], 0);
        const B = J.knR.clone().add(V(14, 0, -3));
        const d = B.clone().sub(A);
        const len = d.length();
        bandM.position.copy(A.clone().add(B).multiplyScalar(0.5));
        bandM.scale.set(1, len, 1);
        bandM.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
      }
      if (ticks) {
        ticks.position.x = -(spec.scroll(ph) % 40);
      }
      if (linkLine) {
        const p = linkLine.geometry.attributes.position;
        p.setXYZ(0, J.wrL.x, J.wrL.y, J.wrL.z);
        p.setXYZ(1, J.wrR.x, J.wrR.y, J.wrR.z);
        p.needsUpdate = true;
      }
      const sun = r.sun;
      sun.position.set(center.x + rad * 0.9, floorY + rad * 2.4, center.z + rad * 1.4);
      sun.target.position.set(center.x, floorY, center.z);
      const sc = sun.shadow.camera;
      const e = rad * 1.6;
      sc.left = -e;
      sc.right = e;
      sc.top = e;
      sc.bottom = -e;
      sc.near = 10;
      sc.far = rad * 7;
      sc.updateProjectionMatrix();
      const w = host.clientWidth || 360;
      const hh = host.clientHeight || 220;
      if (w !== r.w || hh !== r.h) {
        r.renderer.setSize(w, hh, false);
        r.w = w;
        r.h = hh;
      }
      r.camera.aspect = w / hh;
      /* ease toward the preset */
      const wrap = (a) => ((a + 540) % 360) - 180;
      h.az += wrap(h.target.az - h.az) * 0.2;
      h.el += (h.target.el - h.el) * 0.2;
      const az = (h.az * Math.PI) / 180;
      const el = (h.el * Math.PI) / 180;
      const dirv = V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      const rightv = V(0, 1, 0).cross(dirv).normalize();
      const upv = dirv.clone().cross(rightv).normalize();
      let mx = 1;
      let my = 1;
      let md = 0;
      box8.forEach((c) => {
        const q = c.clone().sub(center);
        mx = Math.max(mx, Math.abs(q.dot(rightv)));
        my = Math.max(my, Math.abs(q.dot(upv)));
        md = Math.max(md, q.dot(dirv));
      });
      const tf = Math.tan((r.camera.fov * Math.PI) / 360);
      const D = (Math.max(my / tf, mx / (tf * (w / hh))) * 1.12 + md) / h.zoom;
      r.camera.position.set(
        center.x + D * Math.sin(az) * Math.cos(el),
        center.y + D * Math.sin(el),
        center.z + D * Math.cos(az) * Math.cos(el),
      );
      r.camera.aspect = w / hh;
      r.camera.updateProjectionMatrix();
      r.camera.lookAt(center);
      r.renderer.render(r.scene, r.camera);
    };
    function frame(ts) {
      if (h.stopped || !host.isConnected) {
        r.raf = 0;
        return;
      }
      if (h.playing) {
        h.t += Math.max(0, Math.min(0.1, (ts - (h.last || ts)) / 1000));
      }
      h.last = ts;
      h.draw((((h.t / dur) % 1) + 1) % 1);
      r.raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!r.raf) {
        h.last = performance.now();
        r.raf = requestAnimationFrame(frame);
      }
    }
    h.t = (opt.at == null ? 0.5 : opt.at) * dur;
    current = h;
    h.draw(opt.at == null ? 0.5 : opt.at);
    /* always restart the loop (the original tested `h.playing || true`) */
    {
      cancelAnimationFrame(r.raf);
      r.raf = 0;
      kick();
    }
    return h;
  }
  A3.mount = mount;
  A3.current = () => current;
  A3.stage = () => R;

  /* sideways spread of hands and feet, and how far elbows and knees flare out (units like the 2D scenes) */
  const W3 = {
    'wall-pushup': { hand: [24, 24], flare: 38 },
    'incline-pushup': { hand: [26, 26], flare: 40 },
    'knee-pushup': { hand: [27, 27], flare: 40 },
    pushup: { hand: [28, 28], flare: 42 },
    'diamond-pushup': { hand: [5, 5], flare: 62 },
    'decline-pushup': { hand: [28, 28], flare: 42 },
    'ring-pushup': { hand: [24, 24], flare: 38 },
    'archer-pushup': { hand: [24, 46], flare: 36 },
    'pseudo-planche-pushup': { hand: [22, 22], flare: 22 },
    'one-arm-pushup': { hand: [4, 34], flare: 30 },
    'pike-pushup': { hand: [24, 24], flare: 34 },
    'elevated-pike-pushup': { hand: [24, 24], flare: 34 },
    'wall-hspu': { hand: [22, 22], flare: 32 },
    'bench-dip': { hand: [24, 24], flare: 14 },
    'parallel-dip': { hand: [24, 24], flare: 16 },
    'ring-dip': { hand: [24, 24], flare: 16 },
    squat: { foot: [17, 17], kflare: 14 },
    'deep-squat-hold': { foot: [19, 19], kflare: 16 },
    'jump-squat': { foot: [16, 16], kflare: 12 },
    'tuck-jump': { foot: [14, 14] },
    'tuck-sit': { hand: [22, 22], flare: 6 },
    'one-leg-lsit': { hand: [22, 22], flare: 6 },
    lsit: { hand: [22, 22], flare: 6 },
    'parallette-lsit': { hand: [22, 22], flare: 6 },
    'v-sit': { hand: [22, 22], flare: 6 },
    crow: { hand: [22, 22], flare: 46, foot: [8, 8], kflare: 40 },
    'frog-stand': { hand: [22, 22], flare: 46, kflare: 50 },
    crane: { hand: [20, 20], flare: 20, kflare: 36 },
    'dead-hang': { hand: [26, 26], flare: 20 },
    'scap-pull': { hand: [26, 26], flare: 20 },
    'ring-pullup': { hand: [24, 24], flare: 26 },
    'muscle-up': { hand: [22, 22], flare: 20 },
    'table-row': { hand: [24, 24], flare: 32 },
    'table-row-elevated': { hand: [24, 24], flare: 32 },
    'aussie-row': { hand: [24, 24], flare: 30 },
    'ring-row': { hand: [24, 24], flare: 24 },
    'superman-hold': { hand: [22, 22], flare: 8 },
    'broad-jump': { foot: [14, 14] },
    'box-jump': { foot: [14, 14] },
    'glute-bridge': { foot: [15, 15], kflare: 10, hand: [24, 24] },
    'single-leg-bridge': { foot: [10, 10], hand: [24, 24] },
    'hip-thrust': { foot: [16, 16], hand: [26, 26] },
    'single-leg-hip-thrust': { foot: [10, 10], hand: [26, 26] },
    'nordic-curl': { hand: [22, 22], foot: [10, 10] },
    'calf-raise': { foot: [10, 10] },
    'single-leg-calf-raise': { foot: [8, 8] },
    airplane: { tarms: true },
    'single-leg-stand': { tarms: true },
    'hollow-hold': { hand: [10, 10], flare: 6 },
    'hollow-rock': { hand: [10, 10], flare: 6 },
    'dragon-flag-negative': { hand: [20, 20] },
    'dead-bug': { hand: [18, 18] },
    plank: { hand: [18, 18], flare: 4 },
    'reverse-crunch': { hand: [26, 26] },
    'lying-leg-raise': { hand: [26, 26] },
    'hanging-knee-raise': { hand: [24, 24], flare: 12 },
    'hanging-leg-raise': { hand: [24, 24], flare: 12 },
    'toes-to-bar': { hand: [24, 24], flare: 12 },
    'wall-plank': { hand: [22, 22], foot: [10, 10] },
    'chest-to-wall-handstand': { hand: [22, 22], flare: 20 },
    'kick-up': { hand: [22, 22], flare: 20 },
    'back-to-wall-handstand': { hand: [22, 22], flare: 20 },
    'handstand-shoulder-taps': { hand: [22, 22], flare: 20 },
    'freestanding-handstand': { hand: [22, 22], flare: 20 },
    'handstand-walk': { hand: [22, 22], flare: 20 },
    'tripod-headstand': { hand: [28, 28], flare: 50 },
    headstand: { hand: [12, 12], flare: 50 },
    'elbow-lever': { hand: [20, 20], flare: 14 },
    'planche-lean': { hand: [22, 22], flare: 10 },
    'tuck-planche': { hand: [22, 22], flare: 10 },
    'adv-tuck-planche': { hand: [22, 22], flare: 10 },
    'straddle-planche': { hand: [22, 22], flare: 10, foot: [36, 36] },
    'full-planche': { hand: [22, 22], flare: 10, foot: [8, 8] },
    'skin-the-cat': { hand: [22, 22], flare: 6 },
    'tuck-front-lever': { hand: [22, 22], flare: 6 },
    'adv-tuck-front-lever': { hand: [22, 22], flare: 6 },
    'straddle-front-lever': { hand: [22, 22], flare: 6, foot: [36, 36] },
    'full-front-lever': { hand: [22, 22], flare: 6, foot: [8, 8] },
    'back-lever': { hand: [22, 22], flare: 6, foot: [8, 8] },
    'cross-body-shoulder': { hand: [10, 10] },
    'happy-baby': { hand: [34, 34], foot: [34, 34], kflare: 44 },
    'lying-twist': { hand: [8, 8], foot: [10, 10], kflare: 4 },
    'seated-twist': { hand: [10, 10], foot: [10, 10] },
    'thread-needle': { hand: [22, 22], flare: 10 },
    'sphinx-pose': { hand: [14, 14], flare: 14 },
    'upper-back-round': { hand: [4, 4], flare: 0 },
    'box-hamstring': { hand: [10, 10], foot: [9, 9] },
    'wrist-extensor': { hand: [10, 10] },
    'child-pose': { hand: [30, 30] },
    'cobra-stretch': { hand: [24, 24], flare: 18 },
    'downward-dog': { hand: [24, 24], foot: [14, 14], flare: 30 },
    'forward-fold': { hand: [18, 18] },
    'calf-stretch': { hand: [22, 22] },
    'wall-lat-stretch': { hand: [22, 22] },
    'chest-opener': { hand: [8, 8], flare: 0 },
    'wall-angels': { hand: [22, 22], flare: 12 },
    'cat-cow': { hand: [22, 22], flare: 10 },
    'wrist-prep': { hand: [22, 22] },
    'pigeon-stretch': { hand: [22, 22], flare: 20 },
    'knees-to-chest': { hand: [10, 10] },
    'worlds-greatest': { hand: [20, 20] },
    'doorway-chest': { hand: [24, 24] },
    pullup: { hand: [26, 26], flare: 26 },
    chinup: { hand: [18, 18], flare: 26 },
    'negative-pullup': { hand: [26, 26], flare: 26 },
    'band-pullup': { hand: [26, 26], flare: 26 },
  };
  Object.assign(W3, {
    /* single-leg and split stances: the body sits over the standing foot */
    'reverse-lunge': { foot: [10, 10], hand: [22, 22] },
    'split-squat': { foot: [10, 10], hand: [22, 22] },
    'bulgarian-split-squat': { foot: [10, 10], kflare: 4, hand: [22, 22] },
    'shrimp-squat': { foot: [9, 9], zo: -9, kflare: 10 },
    'assisted-pistol': { foot: [9, 9], zo: -9, kflare: 8 },
    'pistol-squat': { foot: [9, 9], zo: -9, kflare: 8 },
    'single-leg-rdl': { foot: [9, 9], zo: -9, hand: [22, 22] },
    'single-leg-bridge': { foot: [14, 14], kflare: 6, hand: [24, 24] },
    'single-leg-hip-thrust': { foot: [14, 14], hand: [26, 26] },
    'single-leg-calf-raise': { foot: [9, 9], zo: -9 },
    'single-leg-stand': { foot: [9, 9], zo: -9, tarms: true },
    airplane: { foot: [9, 9], zo: -9, tarms: true },
    /* rows: shoulder-width grip, elbows travel back along the ribs */
    'table-row': { hand: [24, 24], flare: 38 },
    'table-row-elevated': { hand: [24, 24], flare: 38 },
    'aussie-row': { hand: [24, 24], flare: 38 },
    'ring-row': { hand: [22, 22], flare: 34 },
    /* planche: straight arms; straddle legs spread wide */
    'planche-lean': { hand: [22, 22], flare: 6, foot: [8, 8] },
    'tuck-planche': { hand: [22, 22], flare: 8, kflare: 34, foot: [10, 10] },
    'adv-tuck-planche': { hand: [22, 22], flare: 8, kflare: 30, foot: [12, 12] },
    'straddle-planche': { hand: [22, 22], flare: 6, foot: [42, 42] },
    'full-planche': { hand: [22, 22], flare: 6, foot: [6, 6] },
    /* levers: shoulder-width grip on the bar */
    'skin-the-cat': { hand: [24, 24], flare: 6, foot: [8, 8] },
    'tuck-front-lever': { hand: [24, 24], flare: 5, kflare: 20, foot: [8, 8] },
    'adv-tuck-front-lever': { hand: [24, 24], flare: 5, foot: [8, 8] },
    'straddle-front-lever': { hand: [24, 24], flare: 5, foot: [44, 44] },
    'full-front-lever': { hand: [24, 24], flare: 5, foot: [6, 6] },
    'back-lever': { hand: [24, 24], flare: 5, foot: [7, 7] },
  });
  Object.assign(W3, {
    'dolphin-pose': { hand: [17, 17], flare: 4 },
    'tripod-frog': { hand: [25, 25], flare: 46, kflare: 44, foot: [8, 8] },
    'wall-tripod-headstand': { hand: [28, 28], flare: 50, foot: [8, 8] },
    'tripod-tuck': { hand: [28, 28], flare: 50, kflare: 28, foot: [8, 8] },
  });
  /* stretches: clasped hands sit together behind the back; the pulling hand reaches across to the other elbow */
  Object.assign(W3, {
    'chest-opener': { hand: [4, 4], flare: 3 },
    'triceps-stretch': { hand: [9, -15], flare: 18 },
  });
  Object.assign(W3, {
    'doorway-chest': { hand: [21, 56], flare: 0, pole: { L: [0, -0.73, -0.69] } },
    'worlds-greatest': { hand: [20, 22], foot: [10, 10], kflare: 6 },
  });
  /* stretches: arms reach straight to where they are going, the crossed leg turns out */
  Object.assign(W3, {
    'child-pose': { hand: [19, 19], flare: 0, foot: [14, 14], kflare: 8 },
    'seated-hamstring': { hand: [12, 12], flare: 0, foot: [11, 11] },
    'downward-dog': { hand: [18, 18], flare: 0, foot: [10, 10] },
    'pigeon-stretch': { hand: [19, 19], flare: 0, foot: [-8, 11], kflare: [64, 4] },
    'figure-4': { hand: [-6, 14], flare: [30, 10], foot: [-9, 11], kflare: [82, 6] },
  });
  Object.assign(W3, { 'windshield-wiper': { hand: [24, 24], flare: 8, foot: [8, 8] } });
  Object.assign(W3, {
    'wrist-flexor': { hand: [10, -6], flare: 4 },
    'hip-circles': { hand: [19, 19], flare: 18 },
  });
  Object.assign(W3, {
    'triceps-stretch': { hand: [6, -24], flare: [42, 10] },
    'one-arm-pushup': { hand: [20, 34], flare: 42 },
    'knees-to-chest': { hand: [27, 27], flare: 8, kflare: 14 },
  });
  A3.W3 = W3;
  A3.infoFor = (ex) => {
    const front = ex.front && ex.fdef === 1 && ex.p3 !== 'side';
    const spec = front ? ANIMF[ex.front](ex.fparams) : ANIMS[ex.anim](ex.params);
    const plane = front
      ? spec.noFloor && (spec.props || []).some((p) => p[0] === 'mat')
        ? 'top'
        : 'front'
      : 'side';
    return {
      spec,
      plane,
      w3: Object.assign(
        {},
        typeof intentW3 === 'function' ? intentW3(ex.id) : {},
        W3[ex.id] || ex.w3 || {},
      ),
      label: ex.name,
    };
  };
})();

export { A3 };
