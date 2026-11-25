// Silicon Chef — main.js
// Boot + satu game loop. Input dibaca tiap frame, dapur maju dalam langkah tetap
// 1/60 detik (beberapa langkah bila frame lambat, nol bila frame cepat), renderer
// melukis apa yang ada. Layar: judul, main, jeda, game over.
//
// ?seed=N menetapkan urutan order. ?shot=cover|cook|rush|serve (dengan &seed=N)
// menata adegan itu, melukisnya dua kali, lalu menyalakan window.__shotReady
// untuk screenshot. window.__chef diekspos untuk play-test otomatis.

import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createKitchen } from './kitchen.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_SERVE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

// Frame terpanjang yang dikejar loop; jeda yang lebih lama (tab tersembunyi) dibuang.
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const kitchen = createKitchen(audio, createRandom(seed));
const renderer = createRenderer(canvas);

// Hook play-test: state + kitchen + audio bisa dibaca/diklik dari luar halaman.
window.__chef = { kitchen, audio, state: kitchen.state };

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage bisa mati (jendela privat): skor terbaik lalu hanya bertahan kunjungan ini.
  }
}

// Adegan screenshot: lukis dua frame dengan waktu beku supaya hasilnya deterministik.
function runShot(name) {
  const scene = stageShot(name, kitchen);
  let painted = 0;
  function paint() {
    renderer.draw(kitchen.state, scene.screen, kitchen.state.best, 1.25, kitchen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, kitchen);
  let screen = SCREEN_TITLE;
  let best = readBest();
  kitchen.state.best = best;
  let accumulator = 0;
  let last = performance.now();

  // Pembaca layar (dan siapa pun yang membaca teks halaman) mendengar pergantian layar.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    kitchen.startGame();
    kitchen.state.best = best;
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Bermain. 3 hati. Masak PC pertama!');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (kitchen.state.score > best) {
      best = kitchen.state.score;
      kitchen.state.best = best;
      saveBest(best);
    }
    announce(`Game over. Skor ${kitchen.state.score}. Terbaik ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    const click = input.takeClick();
    if (click) {
      if (kitchen.state.screen === SCREEN_TITLE && screen === SCREEN_TITLE) {
        kitchen.click(click.x, click.y);
        if (kitchen.state.screen === SCREEN_PLAY) startGame();
        return;
      }
      if (kitchen.state.screen === SCREEN_OVER && screen === SCREEN_OVER) {
        kitchen.click(click.x, click.y);
        if (kitchen.state.screen === SCREEN_PLAY) startGame();
        return;
      }
      kitchen.click(click.x, click.y);
      // Selaraskan layar main dengan layar dapur (klik saat jeda = lanjut main).
      if (kitchen.state.screen === 'play' && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      if (kitchen.state.screen === 'over' && screen === SCREEN_PLAY) endGame();
    }
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Suara mati.' : 'Suara hidup.');
    }
    if (actions & ACTION_SERVE && screen === SCREEN_PLAY) kitchen.serve();
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        kitchen.state.screen = SCREEN_PAUSED;
        announce('Jeda.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        kitchen.state.screen = SCREEN_PLAY;
        announce('Bermain.');
      }
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      startGame();
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      kitchen.step(STEP);
      return;
    }
    kitchen.step(STEP);
    if (kitchen.state.screen === 'over' && screen === SCREEN_PLAY) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(kitchen.state, screen, best, now / 1000, kitchen);
  }

  // Meninggalkan tab menjeda game yang sedang berjalan, bukan membiarkan order hangus tak terlihat.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      kitchen.state.screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Silicon Chef. Tekan Spasi atau klik untuk mulai masak.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
