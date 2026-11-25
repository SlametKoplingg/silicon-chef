// Silicon Chef — kitchen.js
// Mesin game: semua state dan aturan. Tidak menggambar apa pun dan tidak menyentuh
// DOM — render.js yang melukis state ini ke canvas, input.js yang meneruskan klik.
// Aturan inti: klik bahan -> klik stasiun yang benar -> tunggu matang -> ambil ->
// taruh di piring -> sajikan saat piring cocok dengan salah satu order. Stasiun
// salah ditolak, masakan yang dibiarkan gosong (hati -1), order kedaluwarsa (hati -1).

import { COMPONENTS, LAYOUT, RECIPES, STATIONS, TUNING, componentById, stationById } from './config.js';
import { randomInt, randomPick } from './random.js';

// Easing ease-out-back (Playful, overshoot ~10-20%): dipakai chef saat melompat
// ke stasiun dan saat komponen di-squash ke piring.
export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ---- Hit rectangles (dipakai input.js dan render.js, satu sumber) ----
export function stationRect(i) {
  const s = LAYOUT.stations;
  const w = (s.w - (STATIONS.length - 1) * s.gap) / STATIONS.length;
  return { x: s.x + i * (w + s.gap), y: s.y, w, h: s.h };
}
export function ingredientRect(i) {
  const c = LAYOUT.counter;
  const w = (c.w - (COMPONENTS.length - 1) * 10) / COMPONENTS.length;
  return { x: c.x + i * (w + 10), y: c.y, w, h: c.h };
}
export function plateRect() {
  const p = LAYOUT.plate;
  return { x: p.x, y: p.y, w: p.w, h: p.h - 58 };
}
export function serveRect() {
  const p = LAYOUT.plate;
  return { x: p.x, y: p.y + p.h - 52, w: p.w - 96, h: 44 };
}
export function trashRect() {
  const p = LAYOUT.plate;
  return { x: p.x + p.w - 86, y: p.y + p.h - 52, w: 86, h: 44 };
}
export function startRect() {
  return { x: 490, y: 480, w: 300, h: 64 };
}
export function restartRect() {
  return { x: 490, y: 500, w: 300, h: 64 };
}
function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function createKitchen(audio, rng) {
  const state = {
    screen: 'title',
    score: 0,
    best: 0,
    combo: 0,
    hearts: TUNING.maxHearts,
    shiftLeft: TUNING.shiftSeconds,
    elapsed: 0,
    orders: [],
    stations: STATIONS.map((s) => ({ id: s.id, item: null })),
    plate: [],
    carried: null,
    selected: null,
    chef: { x: 640, y: 300, tx: 640, ty: 300, hop: 0 },
    particles: [],
    pops: [],
    message: 'Klik bahan di counter, lalu klik stasiunnya!',
    messageT: 0,
    shakeStation: null,
    shakeT: 0,
    served: null, // { name, points, t } — banner "tersaji!" sesaat
    servedT: 0,
    overReason: '',
    stars: 0,
    orderTimer: 6,
    nextOrderId: 1,
    servedCount: 0,
    burntCount: 0,
    expiredCount: 0,
  };

  function say(text) {
    state.message = text;
    state.messageT = 4;
  }

  // Gelembung teks skor yang melayang naik lalu hilang (score pop).
  function pop(x, y, text, color) {
    state.pops.push({ x, y, text, color: color || '#ffffff', t: 0, life: 1.1 });
    if (state.pops.length > 12) state.pops.shift();
  }

  function spawnParticle(kind, x, y) {
    state.particles.push({ kind, x, y, t: 0, life: kind === 'steam' ? 1.6 : 0.7, vx: (rng() - 0.5) * 14, vy: kind === 'steam' ? -26 - rng() * 14 : -40 - rng() * 30, size: 5 + rng() * 7 });
    if (state.particles.length > 90) state.particles.splice(0, state.particles.length - 90);
  }

  function spawnOrder() {
    if (state.orders.length >= TUNING.maxOrders) return;
    const progress = state.elapsed / TUNING.shiftSeconds;
    const pool = progress < 0.35 ? RECIPES.slice(0, 3) : progress < 0.7 ? RECIPES.slice(0, 4) : RECIPES;
    const recipe = randomPick(rng, pool);
    const patience = randomInt(rng, TUNING.patienceMin, TUNING.patienceMax);
    state.orders.push({ id: state.nextOrderId, recipe, patience, patienceMax: patience });
    state.nextOrderId += 1;
    say(`Order baru: ${recipe.name}!`);
  }

  function reset() {
    state.screen = 'title';
    state.score = 0;
    state.combo = 0;
    state.hearts = TUNING.maxHearts;
    state.shiftLeft = TUNING.shiftSeconds;
    state.elapsed = 0;
    state.orders = [];
    state.stations = STATIONS.map((s) => ({ id: s.id, item: null }));
    state.plate = [];
    state.carried = null;
    state.selected = null;
    state.chef = { x: 640, y: 300, tx: 640, ty: 300, hop: 0 };
    state.particles = [];
    state.pops = [];
    state.message = 'Klik bahan di counter, lalu klik stasiunnya!';
    state.messageT = 0;
    state.shakeStation = null;
    state.shakeT = 0;
    state.served = null;
    state.servedT = 0;
    state.overReason = '';
    state.stars = 0;
    state.orderTimer = 6;
    state.nextOrderId = 1;
    state.servedCount = 0;
    state.burntCount = 0;
    state.expiredCount = 0;
  }

  function startGame() {
    reset();
    state.screen = 'play';
    spawnOrder();
    audio.unlock();
    say('Shift dimulai! Masak PC pertama!');
  }

  function starsFor(score) {
    if (score >= TUNING.starScore3) return 3;
    if (score >= TUNING.starScore2) return 2;
    if (score >= TUNING.starScore1) return 1;
    return 0;
  }

  function gameOver(reason) {
    state.screen = 'over';
    state.overReason = reason;
    state.stars = starsFor(state.score);
    if (state.score > state.best) state.best = state.score;
    audio.stopSizzle();
  }

  function loseHeart(reason) {
    state.hearts -= 1;
    state.combo = 0;
    if (state.hearts <= 0) {
      state.hearts = 0;
      gameOver(reason);
    }
  }

  // Pindahkan chef (dengan lompatan kecil ease-out-back) ke tengah stasiun.
  function sendChefToStation(index) {
    const r = stationRect(index);
    state.chef.tx = r.x + r.w / 2;
    state.chef.ty = r.y + r.h - 8;
    state.chef.hop = 0.0001;
  }

  // Mulai memasak `comp` di stasiun `index`; stasiun salah ditolak dengan shake + buzz.
  function cookAt(index) {
    const comp = state.selected ? componentById(state.selected) : null;
    if (!comp) {
      say('Pilih dulu bahan di counter bawah!');
      return;
    }
    const slot = state.stations[index];
    const station = STATIONS[index];
    if (slot.item) {
      say(`${station.name} sedang dipakai!`);
      audio.playBuzz();
      return;
    }
    if (comp.station !== station.id) {
      const right = stationById(comp.station);
      state.shakeStation = station.id;
      state.shakeT = 0.4;
      audio.playBuzz();
      say(`Salah! ${comp.name} harus di${right.verb.toLowerCase()} di ${right.name}, bukan ${station.name}.`);
      return;
    }
    slot.item = { compId: comp.id, t: 0, done: false, burnt: false };
    state.selected = null;
    sendChefToStation(index);
    audio.playChop();
    say(`${comp.name} sedang di${station.verb.toLowerCase()}...`);
  }

  // Ambil masakan matang dari stasiun (atau buang yang gosong ke tong sampah).
  function takeFromStation(index) {
    const slot = state.stations[index];
    if (!slot.item) return;
    if (slot.item.burnt) {
      slot.item = null;
      state.burntCount += 1;
      audio.playBurn();
      say('Gosong dibuang ke tong sampah.');
      return;
    }
    if (!slot.item.done) {
      say('Belum matang! Tunggu sampai ding!');
      return;
    }
    if (state.carried) {
      say('Tanganmu sudah penuh! Taruh dulu di piring.');
      return;
    }
    state.carried = { compId: slot.item.compId };
    slot.item = null;
    sendChefToStation(index);
    audio.playPick();
  }

  // Taruh bawaan ke piring (piring menampung apa saja; kecocokan dicek saat sajikan).
  function placeOnPlate() {
    if (!state.carried) {
      say('Bawaan kosong — ambil dulu masakan matang dari stasiun.');
      return;
    }
    state.plate.push(state.carried.compId);
    state.carried = null;
    audio.playPop();
  }

  // Cek apakah isi piring sama persis dengan resep salah satu order (urutan bebas).
  function matchingOrder() {
    for (const order of state.orders) {
      const need = order.recipe.parts.slice().sort();
      const have = state.plate.slice().sort();
      if (need.length === have.length && need.every((v, i) => v === have[i])) return order;
    }
    return null;
  }

  function serve() {
    if (state.plate.length === 0) {
      say('Piring masih kosong!');
      audio.playBuzz();
      return;
    }
    const order = matchingOrder();
    if (!order) {
      audio.playBuzz();
      say('Belum cocok dengan order mana pun — cek kartu order di atas!');
      return;
    }
    const timeBonus = Math.round(order.patience) * TUNING.timeBonusPerSecond;
    const comboBonus = state.combo * TUNING.comboBonus;
    const points = order.recipe.points + timeBonus + comboBonus;
    state.score += points;
    state.combo += 1;
    state.servedCount += 1;
    state.orders = state.orders.filter((o) => o.id !== order.id);
    state.plate = [];
    state.served = { name: order.recipe.name, points, t: 0 };
    state.servedT = 1.6;
    const pr = plateRect();
    pop(pr.x + pr.w / 2, pr.y + 10, `+${points}`, '#ffd166');
    audio.playJingle();
    say(`${order.recipe.name} tersaji! +${points} poin (combo x${state.combo})`);
    if (state.orders.length === 0) spawnOrder();
  }

  function trashCarried() {
    if (state.carried) {
      state.carried = null;
      audio.playPop();
      say('Bawaan dibuang.');
      return;
    }
    if (state.plate.length > 0) {
      state.plate.pop();
      audio.playPop();
      say('Satu komponen di piring dibuang.');
    }
  }

  // Satu klik di (x, y): kembalikan true bila klik mengenai sesuatu yang bisa diklik.
  function click(x, y) {
    audio.unlock();
    if (state.screen === 'title') {
      if (inside(startRect(), x, y)) {
        startGame();
        return true;
      }
      return false;
    }
    if (state.screen === 'over') {
      if (inside(restartRect(), x, y)) {
        startGame();
        return true;
      }
      return false;
    }
    if (state.screen === 'paused') {
      state.screen = 'play';
      return true;
    }
    // Layar play.
    for (let i = 0; i < STATIONS.length; i += 1) {
      if (inside(stationRect(i), x, y)) {
        if (state.stations[i].item) takeFromStation(i);
        else cookAt(i);
        return true;
      }
    }
    if (inside(plateRect(), x, y)) {
      placeOnPlate();
      return true;
    }
    if (inside(serveRect(), x, y)) {
      serve();
      return true;
    }
    if (inside(trashRect(), x, y)) {
      trashCarried();
      return true;
    }
    for (let i = 0; i < COMPONENTS.length; i += 1) {
      if (inside(ingredientRect(i), x, y)) {
        state.selected = state.selected === COMPONENTS[i].id ? null : COMPONENTS[i].id;
        audio.playPick();
        return true;
      }
    }
    return false;
  }

  // Pilih bahan lewat keyboard (1-8) atau mulai masak di stasiun (Q/W/E/R/T).
  function keySelectComponent(index) {
    if (state.screen !== 'play') return;
    state.selected = COMPONENTS[index].id;
    audio.playPick();
  }
  function keyCookAt(index) {
    if (state.screen !== 'play') return;
    if (state.stations[index].item) takeFromStation(index);
    else cookAt(index);
  }

  function step(dt) {
    // Animasi ambient tetap jalan di title supaya dapur terasa hidup.
    if (state.screen === 'title') {
      state.chef.hop += dt;
      return;
    }
    if (state.screen !== 'play') return;
    state.elapsed += dt;
    state.shiftLeft -= dt;
    if (state.shiftLeft <= 0) {
      state.shiftLeft = 0;
      gameOver(state.score > 0 ? 'Shift selesai!' : 'Shift selesai — belum ada yang tersaji.');
      return;
    }
    if (state.messageT > 0) state.messageT -= dt;
    if (state.shakeT > 0) state.shakeT -= dt;
    if (state.servedT > 0) state.servedT -= dt;

    // Order baru makin cepat seiring shift berjalan.
    const progress = state.elapsed / TUNING.shiftSeconds;
    const interval = lerp(TUNING.orderIntervalStart, TUNING.orderIntervalEnd, progress);
    state.orderTimer -= dt;
    if (state.orderTimer <= 0) {
      spawnOrder();
      state.orderTimer = interval;
    }

    // Kesabaran order menipis; habis = hati -1.
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.expiredCount += 1;
        audio.playBuzz();
        say(`Order ${order.recipe.name} kedaluwarsa! -1 hati.`);
        loseHeart('Order kedaluwarsa.');
        if (state.screen !== 'play') return;
      }
    }

    // Masak: progress naik, matang = ding, dibiarkan = gosong (hati -1).
    let anyCooking = false;
    for (let i = 0; i < state.stations.length; i += 1) {
      const slot = state.stations[i];
      if (!slot.item || slot.item.burnt) continue;
      const comp = componentById(slot.item.compId);
      slot.item.t += dt;
      if (!slot.item.done && slot.item.t >= comp.cook) {
        slot.item.done = true;
        audio.playDing();
        const r = stationRect(i);
        pop(r.x + r.w / 2, r.y + 8, 'MATANG!', '#7bf1a8');
        spawnParticle('steam', r.x + r.w / 2, r.y + 30);
      }
      if (slot.item.done) {
        anyCooking = true;
        if (rng() < dt * 6) {
          const r = stationRect(i);
          spawnParticle('steam', r.x + r.w / 2 + (rng() - 0.5) * 50, r.y + 46);
        }
        if (slot.item.t >= comp.cook + TUNING.burnWindow) {
          slot.item.burnt = true;
          audio.playBurn();
          say(`${comp.name} gosong! -1 hati. Buang ke tong sampah.`);
          loseHeart('Masakan gosong.');
          if (state.screen !== 'play') return;
        }
      } else {
        anyCooking = true;
        if (rng() < dt * 4) {
          const r = stationRect(i);
          spawnParticle(slot.id === 'wajan' ? 'spark' : 'steam', r.x + r.w / 2 + (rng() - 0.5) * 60, r.y + 50);
        }
        if (slot.id === 'panci' && rng() < dt * 2) audio.playBubble();
      }
    }
    if (anyCooking) audio.startSizzle();
    else audio.stopSizzle();

    // Chef melompat (ease-out-back) menuju target, lalu diam.
    const chef = state.chef;
    if (chef.hop > 0 && chef.hop < 1) {
      chef.hop = Math.min(1, chef.hop + dt / 0.28);
      const e = easeOutBack(chef.hop);
      chef.x = lerp(chef.x, chef.tx, 0.25 * e);
      chef.y = lerp(chef.y, chef.ty, 0.25 * e);
    } else {
      chef.x = lerp(chef.x, chef.tx, 0.12);
      chef.y = lerp(chef.y, chef.ty, 0.12);
    }

    // Partikel dan teks melayang menua.
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.t >= p.life) state.particles.splice(i, 1);
    }
    for (let i = state.pops.length - 1; i >= 0; i -= 1) {
      const p = state.pops[i];
      p.t += dt;
      p.y -= 34 * dt;
      if (p.t >= p.life) state.pops.splice(i, 1);
    }
  }

  return {
    state,
    reset,
    startGame,
    step,
    click,
    keySelectComponent,
    keyCookAt,
    serve,
    trashCarried,
    spawnOrder,
    matchingOrder,
    starsFor,
    stationRect,
    ingredientRect,
    plateRect,
    serveRect,
    trashRect,
  };
}
