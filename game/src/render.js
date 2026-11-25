// Silicon Chef — render.js
// Semua gambar digambar prosedural di canvas 2D: dapur, komponen PC, chef, partikel.
// Tanpa file gambar apa pun. Palet dapur hangat (krem, merah tomat, teal, kuning
// mentega), bentuk chunky membulat. Motion Playful: ease-out-back, squash &
// stretch, tiga layer — primary (chef + komponen), secondary (bayangan, ring
// progress), ambient (uap naik, gradien berdenyut).

import { COMPONENTS, LAYOUT, STATIONS, TUNING, VIEW, componentById, stationById } from './config.js';
import { ingredientRect, plateRect, restartRect, serveRect, startRect, stationRect, trashRect } from './kitchen.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CREAM = '#fff6e5';
const WALL = '#ffe3c2';
const TOMATO = '#e4572e';
const TEAL = '#2a9d8f';
const BUTTER = '#ffd166';
const INK = '#3a2e25';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 700} ${size}px system-ui, "Segoe UI", sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---- Ikon komponen PC (satu fungsi per bentuk, digambar dari kode) ----
export function drawComponentIcon(ctx, comp, cx, cy, size, squash) {
  const s = size;
  const sy = squash || 1;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, sy);
  ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.strokeStyle = comp.dark;
  ctx.fillStyle = comp.color;
  if (comp.shape === 'slab') {
    rr(ctx, -s * 0.5, -s * 0.22, s, s * 0.44, s * 0.1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#eef2f6';
    rr(ctx, -s * 0.34, -s * 0.12, s * 0.5, s * 0.24, s * 0.05);
    ctx.fill();
    ctx.fillStyle = comp.dark;
    for (let i = 0; i < 3; i += 1) ctx.fillRect(-s * 0.34 + i * s * 0.06, -s * 0.12, s * 0.03, s * 0.24);
  } else if (comp.shape === 'stick') {
    rr(ctx, -s * 0.5, -s * 0.16, s, s * 0.32, s * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1d2b1f';
    for (let i = 0; i < 5; i += 1) ctx.fillRect(-s * 0.42 + i * s * 0.17, -s * 0.1, s * 0.09, s * 0.2);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-s * 0.5, s * 0.16, s, s * 0.08);
  } else if (comp.shape === 'card') {
    rr(ctx, -s * 0.5, -s * 0.3, s, s * 0.6, s * 0.08);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dbeafe';
    ctx.beginPath();
    ctx.arc(-s * 0.12, 0, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = comp.dark;
    for (let i = 0; i < 3; i += 1) {
      const a = (i * Math.PI * 2) / 3 + 0.5;
      ctx.beginPath();
      ctx.moveTo(-s * 0.12, 0);
      ctx.arc(-s * 0.12, 0, s * 0.2, a, a + 1.1);
      ctx.closePath();
      ctx.fillStyle = comp.dark;
      ctx.fill();
    }
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(s * 0.22, -s * 0.3, s * 0.1, s * 0.6);
  } else if (comp.shape === 'screen') {
    rr(ctx, -s * 0.48, -s * 0.36, s * 0.96, s * 0.66, s * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#bfefff';
    rr(ctx, -s * 0.4, -s * 0.28, s * 0.8, s * 0.5, s * 0.04);
    ctx.fill();
    ctx.fillStyle = '#9be15d';
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, s * 0.14);
    ctx.lineTo(-s * 0.1, -s * 0.12);
    ctx.lineTo(s * 0.05, s * 0.06);
    ctx.lineTo(s * 0.22, -s * 0.16);
    ctx.lineTo(s * 0.3, s * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = comp.dark;
    ctx.fillRect(-s * 0.05, s * 0.3, s * 0.1, s * 0.14);
    ctx.fillRect(-s * 0.22, s * 0.44, s * 0.44, s * 0.06);
  } else if (comp.shape === 'chip') {
    ctx.fillStyle = comp.dark;
    for (let i = 0; i < 4; i += 1) {
      ctx.fillRect(-s * 0.4 + i * s * 0.24, -s * 0.5, s * 0.1, s * 0.14);
      ctx.fillRect(-s * 0.4 + i * s * 0.24, s * 0.36, s * 0.1, s * 0.14);
    }
    rr(ctx, -s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.08);
    ctx.fillStyle = comp.color;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff3c4';
    rr(ctx, -s * 0.2, -s * 0.2, s * 0.4, s * 0.4, s * 0.05);
    ctx.fill();
    text(ctx, 'CPU', 0, 1, s * 0.22, comp.dark, 800, 'center');
  } else if (comp.shape === 'fan') {
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = comp.color;
    for (let i = 0; i < 3; i += 1) {
      const a = (i * Math.PI * 2) / 3 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s * 0.38, a, a + 1.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (comp.shape === 'board') {
    rr(ctx, -s * 0.5, -s * 0.34, s, s * 0.68, s * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8ecae6';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.2);
    ctx.lineTo(-s * 0.1, -s * 0.2);
    ctx.lineTo(-s * 0.1, s * 0.1);
    ctx.moveTo(s * 0.1, -s * 0.24);
    ctx.lineTo(s * 0.38, -s * 0.24);
    ctx.stroke();
    ctx.fillStyle = '#22223b';
    ctx.fillRect(-s * 0.34, -s * 0.06, s * 0.22, s * 0.22);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(s * 0.14, s * 0.02, s * 0.24, s * 0.16);
    ctx.fillStyle = '#e0e0e0';
    for (let i = 0; i < 3; i += 1) ctx.fillRect(-s * 0.44 + i * s * 0.05, s * 0.24, s * 0.03, s * 0.08);
  } else {
    // kabel: gulungan melingkar
    ctx.strokeStyle = comp.color;
    ctx.lineWidth = s * 0.13;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = comp.dark;
    rr(ctx, s * 0.24, -s * 0.4, s * 0.2, s * 0.2, s * 0.04);
    ctx.fill();
  }
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const W = VIEW.width;
  const H = VIEW.height;

  function drawBackground(t) {
    // Dinding krem berdenyut halus (ambient) + lantai papan.
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.6);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, WALL);
    grad.addColorStop(0.55, CREAM);
    grad.addColorStop(0.56, '#d9a066');
    grad.addColorStop(1, '#c98d54');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + pulse * 0.04})`;
    ctx.fillRect(0, 0, W, 400);
    // Ubin dinding.
    ctx.strokeStyle = 'rgba(180, 120, 60, 0.18)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 400);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(W, 200);
    ctx.stroke();
    // (Rak bumbu di dinding sengaja tidak digambar: order ketiga menutupi area itu.)
    text(ctx, 'DAPUR SILIKON', 24, 30, 15, 'rgba(90, 50, 20, 0.55)', 800);
  }

  function drawHud(state, t) {
    const hud = LAYOUT.hud;
    ctx.fillStyle = '#2b2118';
    ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
    text(ctx, '🍳 SILICON CHEF', 24, 30, 24, BUTTER, 900);
    text(ctx, 'Masak PC!', 296, 31, 13, '#ffb4a2', 700);
    text(ctx, `SKOR ${state.score}`, 430, 30, 22, '#ffffff', 800);
    if (state.combo >= 2) {
      const pop = 1 + 0.12 * Math.sin(t * 8);
      ctx.save();
      ctx.translate(600, 30);
      ctx.scale(pop, pop);
      text(ctx, `🔥 COMBO x${state.combo}`, 0, 0, 19, '#ff9f1c', 900, 'center');
      ctx.restore();
    }
    // Hati.
    for (let i = 0; i < TUNING.maxHearts; i += 1) {
      const x = 760 + i * 36;
      ctx.font = '24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i < state.hearts ? '❤️' : '🖤', x, 30);
    }
    // Timer shift.
    const frac = state.shiftLeft / TUNING.shiftSeconds;
    const mm = Math.floor(state.shiftLeft / 60);
    const ss = Math.floor(state.shiftLeft % 60);
    text(ctx, `SHIFT ${mm}:${String(ss).padStart(2, '0')}`, 900, 20, 14, '#ffffff', 700);
    ctx.fillStyle = '#4a3b2e';
    rr(ctx, 900, 32, 180, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? TEAL : frac > 0.25 ? BUTTER : TOMATO;
    rr(ctx, 900, 32, Math.max(12, 180 * frac), 12, 6);
    ctx.fill();
    text(ctx, state.best > 0 ? `TERBAIK ${state.best}` : '', 1110, 30, 13, '#ffd166', 700);
  }

  function drawOrders(state) {
    const o = LAYOUT.orders;
    if (state.orders.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      rr(ctx, o.x, o.y, o.w, o.h, 12);
      ctx.fill();
      text(ctx, 'Menunggu order masuk...', o.x + 20, o.y + o.h / 2, 18, '#8a6d4b', 600);
      return;
    }
    state.orders.forEach((order, i) => {
      const x = o.x + i * (o.cardW + o.gap);
      const urgent = order.patience < 12;
      const frac = Math.max(0, order.patience / order.patienceMax);
      ctx.fillStyle = urgent && Math.floor(order.patience * 2) % 2 === 0 ? '#ffe0d6' : '#ffffff';
      rr(ctx, x, o.y, o.cardW, o.h, 12);
      ctx.fill();
      ctx.strokeStyle = urgent ? TOMATO : '#e0c9a6';
      ctx.lineWidth = urgent ? 3 : 2;
      ctx.stroke();
      text(ctx, `#${order.id}  ${order.recipe.name}`, x + 14, o.y + 20, 18, INK, 800);
      text(ctx, `${order.recipe.level} • ${order.recipe.points} pts`, x + o.cardW - 14, o.y + 20, 13, '#8a6d4b', 700, 'right');
      order.recipe.parts.forEach((partId, j) => {
        const comp = componentById(partId);
        const ix = x + 30 + j * 62;
        const done = state.plate.includes(partId);
        drawComponentIcon(ctx, comp, ix, o.y + 48, 40, 1);
        if (done) {
          ctx.fillStyle = '#2a9d8f';
          ctx.beginPath();
          ctx.arc(ix + 16, o.y + 32, 10, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, '✓', ix + 16, o.y + 33, 12, '#fff', 900, 'center');
        }
        text(ctx, stationById(comp.station).verb, ix, o.y + 72, 10, '#8a6d4b', 700, 'center');
      });
      // Bar kesabaran.
      ctx.fillStyle = '#eee0c8';
      rr(ctx, x + 14, o.y + o.h - 10, o.cardW - 28, 6, 3);
      ctx.fill();
      ctx.fillStyle = frac > 0.5 ? TEAL : frac > 0.25 ? BUTTER : TOMATO;
      rr(ctx, x + 14, o.y + o.h - 10, Math.max(6, (o.cardW - 28) * frac), 6, 3);
      ctx.fill();
      text(ctx, `${Math.ceil(order.patience)} dtk`, x + o.cardW - 16, o.y + 38, 12, urgent ? TOMATO : '#8a6d4b', 800, 'right');
    });
  }

  // labelsOnly=true melukis hanya nama + tombol keyboard stasiun, supaya label
  // selalu terbaca di atas chef yang berdiri di depan meja.
  function drawStation(state, index, t, labelsOnly) {
    const r = stationRect(index);
    const station = STATIONS[index];
    if (labelsOnly) {
      const cx = r.x + r.w / 2;
      text(ctx, `${station.name} — ${station.verb}`, cx, r.y + 168, 15, INK, 800, 'center');
      ctx.fillStyle = '#fff';
      rr(ctx, cx - 14, r.y + 178, 28, 20, 5);
      ctx.fill();
      ctx.strokeStyle = '#c9b18c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, station.key, cx, r.y + 189, 12, INK, 800, 'center');
      return;
    }
    const slot = state.stations[index];
    let ox = 0;
    if (state.shakeStation === station.id && state.shakeT > 0) {
      ox = Math.sin(state.shakeT * 40) * 8 * (state.shakeT / 0.4);
    }
    // Meja stasiun.
    ctx.fillStyle = '#8a5a33';
    rr(ctx, r.x + ox, r.y + 128, r.w, 66, 12);
    ctx.fill();
    ctx.fillStyle = '#a9713f';
    rr(ctx, r.x + ox, r.y + 128, r.w, 14, 7);
    ctx.fill();
    // Badan stasiun per jenis.
    const cx = r.x + r.w / 2 + ox;
    const cy = r.y + 88;
    ctx.save();
    if (station.id === 'talenen') {
      ctx.fillStyle = '#e8c88f';
      rr(ctx, cx - 62, cy - 26, 124, 52, 10);
      ctx.fill();
      ctx.strokeStyle = '#b98a4e';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(150,100,40,0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(cx - 44 + i * 12, cy - 12);
        ctx.lineTo(cx - 34 + i * 12, cy + 12);
        ctx.stroke();
      }
    } else if (station.id === 'wajan') {
      ctx.fillStyle = '#3d3d3d';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 58, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#555';
      ctx.fillRect(cx + 52, cy - 22, 34, 8);
      ctx.fillStyle = '#2b2b2b';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6, 58, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (station.id === 'panci') {
      ctx.fillStyle = '#b8c4cc';
      rr(ctx, cx - 56, cy - 34, 112, 62, 10);
      ctx.fill();
      ctx.strokeStyle = '#7d8b96';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#5ec8e5';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 30, 50, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7d8b96';
      ctx.fillRect(cx - 68, cy - 22, 12, 8);
      ctx.fillRect(cx + 56, cy - 22, 12, 8);
    } else if (station.id === 'oven') {
      ctx.fillStyle = '#6c757d';
      rr(ctx, cx - 62, cy - 46, 124, 92, 10);
      ctx.fill();
      ctx.fillStyle = '#ffdf8e';
      rr(ctx, cx - 48, cy - 30, 96, 46, 6);
      ctx.fill();
      ctx.strokeStyle = '#495057';
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 48, cy - 30, 96, 46);
      ctx.fillStyle = '#495057';
      ctx.beginPath();
      ctx.arc(cx - 30, cy + 32, 6, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy + 32, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // mangkuk
      ctx.fillStyle = '#9b5de5';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 54, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c77dff';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 10, 54, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#6d34b0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 58);
      ctx.lineTo(cx + 34, cy - 6);
      ctx.stroke();
    }
    ctx.restore();

    // Item yang dimasak + ring progress.
    if (slot.item) {
      const comp = componentById(slot.item.compId);
      const frac = Math.min(1, slot.item.t / comp.cook);
      const squash = slot.item.done ? 1 + 0.08 * Math.sin(t * 10) : 1;
      drawComponentIcon(ctx, comp, cx, cy - 6, 52, squash);
      if (slot.item.burnt) {
        ctx.fillStyle = 'rgba(40,40,40,0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 30, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, '💨', cx, cy - 6, 26, '#fff', 400, 'center');
        text(ctx, 'GOSONG!', cx, cy - 52, 13, TOMATO, 900, 'center');
      } else if (!slot.item.done) {
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = slot.item.t > comp.cook * 0.7 ? '#ff9f1c' : TEAL;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 40, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        text(ctx, `${Math.ceil(comp.cook - slot.item.t)}`, cx, cy - 6, 15, '#fff', 900, 'center');
      } else {
        // Matang: ring hijau berdenyut + "AMBIL!".
        const pulse = 1 + 0.06 * Math.sin(t * 8);
        ctx.strokeStyle = '#2a9d8f';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 40 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        text(ctx, 'AMBIL!', cx, cy - 56, 13, '#1d6f66', 900, 'center');
      }
    }
  }

  function drawChef(state, t) {
    const chef = state.chef;
    const bob = Math.sin(t * 3) * 3;
    const x = chef.x;
    const y = chef.y + bob;
    // Bayangan (secondary layer).
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y + 34, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Badan.
    ctx.fillStyle = '#ffffff';
    rr(ctx, x - 24, y - 6, 48, 40, 14);
    ctx.fill();
    ctx.strokeStyle = '#d8c9b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Celemek + kancing.
    ctx.fillStyle = TEAL;
    rr(ctx, x - 16, y + 8, 32, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 7, y + 16, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 7, y + 16, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Kepala + topi chef.
    ctx.fillStyle = '#ffcf9e';
    ctx.beginPath();
    ctx.arc(x, y - 18, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 10, y - 32, 10, 0, Math.PI * 2);
    ctx.arc(x, y - 36, 12, 0, Math.PI * 2);
    ctx.arc(x + 10, y - 32, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 14, y - 34, 28, 8);
    // Mata + senyum.
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(x - 6, y - 18, 2, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 12, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Wajan kecil di tangan kalau membawa sesuatu.
    if (state.carried) {
      const comp = componentById(state.carried.compId);
      drawComponentIcon(ctx, comp, x + 34, y + 6, 34, 1);
    }
  }

  function drawPlate(state, kitchen) {
    const p = LAYOUT.plate;
    ctx.fillStyle = '#fff';
    rr(ctx, p.x, p.y, p.w, p.h, 14);
    ctx.fill();
    ctx.strokeStyle = '#e0c9a6';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, '🍽️ PIRING SAJI', p.x + 16, p.y + 20, 16, INK, 900);
    const pr = plateRect();
    // Piring bundar.
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h / 2 + 8, 120, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h / 2 + 8, 88, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    // Komponen yang sudah di piring.
    state.plate.forEach((partId, i) => {
      const comp = componentById(partId);
      const total = state.plate.length;
      const px = pr.x + pr.w / 2 + (i - (total - 1) / 2) * 62;
      drawComponentIcon(ctx, comp, px, pr.y + pr.h / 2 + 8, 46, 1);
    });
    if (state.plate.length === 0) {
      text(ctx, 'Piring kosong — taruh masakan matang di sini', pr.x + pr.w / 2, pr.y + pr.h / 2 + 8, 12, '#9a8a76', 600, 'center');
    }
    // Tombol sajikan + tong sampah.
    const sr = serveRect();
    const ready = kitchen ? kitchen.matchingOrder() !== null : false;
    ctx.fillStyle = ready ? '#2a9d8f' : '#94a3b8';
    rr(ctx, sr.x, sr.y, sr.w, sr.h, 10);
    ctx.fill();
    text(ctx, ready ? '✅ SAJIKAN! (Spasi)' : 'SAJIKAN (Spasi)', sr.x + sr.w / 2, sr.y + sr.h / 2 + 1, 16, '#fff', 900, 'center');
    const tr = trashRect();
    ctx.fillStyle = '#64748b';
    rr(ctx, tr.x, tr.y, tr.w, tr.h, 10);
    ctx.fill();
    text(ctx, '🗑️ Buang', tr.x + tr.w / 2, tr.y + tr.h / 2 + 1, 14, '#fff', 800, 'center');
  }

  function drawCounter(state) {
    const c = LAYOUT.counter;
    text(ctx, '🧺 COUNTER BAHAN — klik komponen, lalu klik stasiunnya  (1–8 pilih, Q/W/E/R/T masak)', c.x, c.y - 12, 15, INK, 900);
    COMPONENTS.forEach((comp, i) => {
      const r = ingredientRect(i);
      const selected = state.selected === comp.id;
      ctx.fillStyle = selected ? '#fff3c4' : '#ffffff';
      rr(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.strokeStyle = selected ? TOMATO : '#e0c9a6';
      ctx.lineWidth = selected ? 3 : 2;
      ctx.stroke();
      drawComponentIcon(ctx, comp, r.x + r.w / 2, r.y + 42, 54, selected ? 1.08 : 1);
      text(ctx, comp.name, r.x + r.w / 2, r.y + 84, 15, INK, 800, 'center');
      const st = stationById(comp.station);
      text(ctx, `${st.verb} → ${st.name}`, r.x + r.w / 2, r.y + 102, 11, '#8a6d4b', 700, 'center');
      ctx.fillStyle = '#fff';
      rr(ctx, r.x + 6, r.y + 6, 20, 18, 4);
      ctx.fill();
      text(ctx, String(i + 1), r.x + 16, r.y + 16, 11, INK, 800, 'center');
    });
  }

  function drawFooter(state) {
    const f = LAYOUT.footer;
    // Bar pesan.
    ctx.fillStyle = '#2b2118';
    rr(ctx, f.x, f.y, f.w, 44, 10);
    ctx.fill();
    text(ctx, `💬 ${state.message}`, f.x + 16, f.y + 23, 16, '#ffe8c2', 700);
    // Kartu resep (cheat-sheet) + kontrol.
    const recipes = [
      'PC Kantor: RAM Rebus + SSD Panggang + Monitor Potong',
      'PC Gaming: GPU Tumis + RAM Rebus + SSD Panggang + Kipas Aduk',
      'PC Editing: CPU Tumis + Motherboard Panggang + RAM Rebus + Monitor Potong',
      'PC Sultan: GPU + CPU Tumis + SSD Panggang + RAM Rebus + Kabel Potong',
      'PC Server: Motherboard Panggang + CPU Tumis + RAM Rebus + SSD Panggang + Kipas Aduk',
    ];
    text(ctx, '📖 RESEP', f.x, f.y + 66, 13, INK, 900);
    recipes.forEach((line, i) => {
      text(ctx, line, f.x + 90, f.y + 66 + i * 17, 12.5, '#5c4632', 600);
    });
    text(ctx, 'Kontrol: klik • 1–8 bahan • Q W E R T stasiun • Spasi sajikan • M suara • P jeda', f.x, f.y + 66 + 5 * 17 + 6, 12.5, '#8a6d4b', 700);
  }

  function drawParticles(state) {
    for (const p of state.particles) {
      const frac = p.t / p.life;
      if (p.kind === 'steam') {
        ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - frac)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.6 + frac), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255,180,60,${0.9 * (1 - frac)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4 * (1 - frac) + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (const p of state.pops) {
      const frac = p.t / p.life;
      ctx.save();
      ctx.globalAlpha = 1 - frac * frac;
      const scale = 1 + 0.25 * (1 - frac);
      ctx.translate(p.x, p.y);
      ctx.scale(scale, scale);
      text(ctx, p.text, 0, 0, 26, p.color, 900, 'center');
      ctx.restore();
    }
  }

  function drawServedBanner(state) {
    if (!state.served || state.servedT <= 0) return;
    const a = Math.min(1, state.servedT);
    ctx.save();
    ctx.globalAlpha = a;
    const cx = W / 2;
    const cy = 300;
    ctx.fillStyle = 'rgba(42,157,143,0.95)';
    rr(ctx, cx - 260, cy - 70, 520, 120, 18);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 4;
    ctx.stroke();
    text(ctx, `🎉 ${state.served.name} TERSAJI!`, cx, cy - 28, 30, '#fff', 900, 'center');
    text(ctx, `+${state.served.points} poin`, cx, cy + 18, 24, BUTTER, 900, 'center');
    ctx.restore();
  }

  function drawTitle(state, t) {
    ctx.fillStyle = 'rgba(43,33,24,0.55)';
    ctx.fillRect(0, 0, W, H);
    const bob = Math.sin(t * 2) * 6;
    ctx.fillStyle = '#fff6e5';
    rr(ctx, 290, 120 + bob, 700, 300, 20);
    ctx.fill();
    ctx.strokeStyle = TOMATO;
    ctx.lineWidth = 4;
    ctx.stroke();
    text(ctx, '🍳 SILICON CHEF', 640, 178 + bob, 52, TOMATO, 900, 'center');
    text(ctx, 'Masak komponen PC kecil jadi PC utuh!', 640, 228 + bob, 22, INK, 700, 'center');
    text(ctx, 'GPU ditumis, RAM direbus, SSD dipanggang —', 640, 262 + bob, 17, '#5c4632', 600, 'center');
    text(ctx, 'sajikan PC-nya sebelum pelanggan keburu pergi!', 640, 288 + bob, 17, '#5c4632', 600, 'center');
    text(ctx, '1–8 pilih bahan  •  Q/W/E/R/T masak  •  Spasi sajikan  •  M suara  •  P jeda', 640, 330 + bob, 15, '#8a6d4b', 700, 'center');
    const sr = startRect();
    const pulse = 1 + 0.03 * Math.sin(t * 4);
    ctx.save();
    ctx.translate(sr.x + sr.w / 2, sr.y + sr.h / 2 + bob);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = TOMATO;
    rr(ctx, -sr.w / 2, -sr.h / 2, sr.w, sr.h, 14);
    ctx.fill();
    text(ctx, '▶  MULAI MASAK', 0, 1, 26, '#fff', 900, 'center');
    ctx.restore();
    text(ctx, 'Shift 3 menit • 3 hati • 5 resep PC • combo = bonus poin', 640, 580, 15, '#fff', 700, 'center');
  }

  function drawOver(state, t) {
    ctx.fillStyle = 'rgba(43,33,24,0.62)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff6e5';
    rr(ctx, 340, 130, 600, 380, 20);
    ctx.fill();
    ctx.strokeStyle = TOMATO;
    ctx.lineWidth = 4;
    ctx.stroke();
    text(ctx, state.stars >= 2 ? '🏆 SHIFT SELESAI!' : '🍳 GAME OVER', 640, 180, 40, TOMATO, 900, 'center');
    text(ctx, state.overReason, 640, 226, 18, INK, 700, 'center');
    // Bintang.
    for (let i = 0; i < 3; i += 1) {
      const x = 640 + (i - 1) * 70;
      const y = 280;
      const lit = i < state.stars;
      const scale = lit ? 1 + 0.1 * Math.sin(t * 4 + i) : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.font = '52px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lit ? '⭐' : '☆', 0, 0);
      ctx.restore();
    }
    text(ctx, `SKOR AKHIR: ${state.score}`, 640, 348, 30, INK, 900, 'center');
    text(ctx, `PC tersaji: ${state.servedCount}   •   Gosong: ${state.burntCount}   •   Order kedaluwarsa: ${state.expiredCount}`, 640, 392, 15, '#5c4632', 700, 'center');
    if (state.score >= state.best && state.score > 0) text(ctx, '🎉 Skor terbaik baru!', 640, 424, 16, TEAL, 800, 'center');
    const rr2 = restartRect();
    ctx.fillStyle = TOMATO;
    rr(ctx, rr2.x, rr2.y, rr2.w, rr2.h, 14);
    ctx.fill();
    text(ctx, '↻  MAIN LAGI', rr2.x + rr2.w / 2, rr2.y + rr2.h / 2 + 1, 24, '#fff', 900, 'center');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(43,33,24,0.55)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, '⏸  JEDA', 640, 330, 48, '#fff', 900, 'center');
    text(ctx, 'Tekan P atau klik untuk lanjut', 640, 384, 18, '#ffe8c2', 700, 'center');
  }

  function draw(state, screen, best, t, kitchen) {
    ctx.clearRect(0, 0, W, H);
    drawBackground(t);
    if (screen === SCREEN_TITLE) {
      // Dapur contoh di belakang layar judul (stasiun kosong + chef).
      drawHud({ ...state, score: 0, combo: 0, hearts: TUNING.maxHearts, shiftLeft: TUNING.shiftSeconds, best }, t);
      STATIONS.forEach((_, i) => drawStation(state, i, t, false));
      STATIONS.forEach((_, i) => drawStation(state, i, t, true));
      drawPlate(state, kitchen);
      drawCounter(state);
      drawTitle(state, t);
      return;
    }
    drawHud(state, t);
    drawOrders(state);
    STATIONS.forEach((_, i) => drawStation(state, i, t, false));
    drawChef(state, t);
    STATIONS.forEach((_, i) => drawStation(state, i, t, true));
    drawPlate(state, kitchen);
    drawCounter(state);
    drawFooter(state);
    drawParticles(state);
    drawServedBanner(state);
    if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawOver(state, t);
  }

  return { draw, drawComponentIcon };
}
