// Silicon Chef — shots.js
// Adegan deterministik untuk 4 screenshot: setiap adegan membangun state dapur
// yang sama persis dari seed yang sama — order, posisi masakan, skor, dan timer
// ditulis langsung ke state, tanpa memainkan game secara acak. Jadi screenshot
// selalu menunjukkan momen yang dirancang, dan selalu sama tiap dijalankan.
//
// cover: dapur lengkap — 2 order, counter penuh, piring setengah jadi, 1 masakan matang.
// cook:  tengah masak — GPU ditumis (sizzle), RAM direbus, chef di wajan.
// rush:  service rush — 3 order, 1 hampir kedaluwarsa (merah), piring siap sajikan.
// serve: momen sajikan — PC tersaji, score pop, banner +poin, bintang di HUD.

import { RECIPES, TUNING } from './config.js';

function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

function setOrder(kitchen, id, recipeId, patience, patienceMax) {
  const recipe = recipeById(recipeId);
  kitchen.state.orders.push({ id, recipe, patience, patienceMax });
  kitchen.state.nextOrderId = id + 1;
}

function setStation(kitchen, index, compId, t, done, burnt) {
  kitchen.state.stations[index] = { id: kitchen.state.stations[index].id, item: { compId, t, done, burnt } };
}

export function stageShot(name, kitchen) {
  const s = kitchen.state;
  kitchen.reset();
  s.screen = 'play';
  s.best = 0;

  if (name === 'cook') {
    // GPU tumis 60% jalan di wajan, RAM rebus 40% di panci, chef di wajan.
    setOrder(kitchen, 1, 'gaming', 52, 58);
    setStation(kitchen, 1, 'gpu', 3.0, false, false);
    setStation(kitchen, 2, 'ram', 1.2, false, false);
    s.chef.tx = 285;
    s.chef.ty = 384;
    s.chef.x = 285;
    s.chef.y = 384;
    s.score = 120;
    s.combo = 1;
    s.shiftLeft = 148;
    s.elapsed = 32;
    s.selected = 'cpu';
    s.message = 'GPU sedang ditumis... RAM direbus di panci!';
    s.messageT = 99;
    s.particles.push(
      { kind: 'steam', x: 340, y: 250, t: 0.4, life: 1.6, vx: 2, vy: -30, size: 10 },
      { kind: 'spark', x: 330, y: 260, t: 0.2, life: 0.7, vx: -6, vy: -50, size: 8 },
      { kind: 'steam', x: 520, y: 250, t: 0.8, life: 1.6, vx: -3, vy: -26, size: 9 },
    );
    return { screen: 'play' };
  }

  if (name === 'rush') {
    // 3 order; PC Editing hampir kedaluwarsa (6 dtk, merah); piring lengkap siap sajikan.
    setOrder(kitchen, 1, 'editing', 6, 55);
    setOrder(kitchen, 2, 'gaming', 28, 58);
    setOrder(kitchen, 3, 'sultan', 44, 60);
    s.plate = ['cpu', 'mobo', 'ram', 'monitor'];
    s.score = 480;
    s.combo = 3;
    s.shiftLeft = 74;
    s.elapsed = 106;
    s.message = 'Piring lengkap! Sajikan PC Editing sebelum order hangus!';
    s.messageT = 99;
    return { screen: 'play' };
  }

  if (name === 'serve') {
    // Baru saja menyajikan PC Gaming: banner +poin, score pop, 2 order tersisa.
    setOrder(kitchen, 2, 'kantor', 40, 55);
    setOrder(kitchen, 3, 'editing', 50, 58);
    s.served = { name: 'PC Gaming', points: 262, t: 0 };
    s.servedT = 1.6;
    s.score = 862;
    s.best = 862;
    s.combo = 2;
    s.shiftLeft = 121;
    s.elapsed = 59;
    s.servedCount = 3;
    s.message = 'PC Gaming tersaji! +262 poin (combo x2)';
    s.messageT = 99;
    return { screen: 'play' };
  }

  // cover (default): dapur lengkap.
  setOrder(kitchen, 1, 'kantor', 38, 55);
  setOrder(kitchen, 2, 'gaming', 47, 58);
  setStation(kitchen, 1, 'gpu', 2.4, false, false);
  setStation(kitchen, 3, 'ssd', 4.0, true, false);
  s.plate = ['ram', 'monitor'];
  s.carried = null;
  s.score = 120;
  s.combo = 1;
  s.shiftLeft = 152;
  s.elapsed = 28;
  s.selected = 'ram';
  s.chef.tx = 285;
  s.chef.ty = 384;
  s.chef.x = 285;
  s.chef.y = 384;
  s.message = 'SSD sudah matang — ambil, taruh di piring, lalu sajikan!';
  s.messageT = 99;
  return { screen: 'play' };
}

// Bintang yang ditampilkan di layar game-over untuk adegan serve/cover (tidak dipakai di play).
export function starsForScore(score) {
  if (score >= TUNING.starScore3) return 3;
  if (score >= TUNING.starScore2) return 2;
  if (score >= TUNING.starScore1) return 1;
  return 0;
}
