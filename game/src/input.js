// Silicon Chef — input.js
// Mouse + keyboard. Klik diterjemahkan dari piksel layar ke koordinat canvas
// 1280x720 (canvas diskalakan CSS supaya muat jendela, jadi perlu skala).
// Keyboard: 1-8 pilih bahan, Q/W/E/R/T masak di stasiun, Spasi sajikan,
// M mute, P jeda. Semua aksi dikumpulkan lalu diambil main.js tiap frame.

import { COMPONENTS, STATIONS, VIEW } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_MUTE = 8;

export function createInput(canvas, kitchen) {
  let actions = 0;
  let clickPoint = null;

  // Ubah koordinat klik (piksel layar) menjadi koordinat canvas 1280x720.
  function toCanvas(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const p = toCanvas(event.clientX, event.clientY);
    clickPoint = p;
    actions |= ACTION_CONFIRM;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const digit = Number.parseInt(key, 10);
    if (digit >= 1 && digit <= COMPONENTS.length) {
      kitchen.keySelectComponent(digit - 1);
      return;
    }
    const stationIndex = STATIONS.findIndex((s) => s.key.toLowerCase() === key);
    if (stationIndex !== -1) {
      kitchen.keyCookAt(stationIndex);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      actions |= ACTION_SERVE;
    } else if (key === 'm') {
      actions |= ACTION_MUTE;
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'enter') {
      actions |= ACTION_CONFIRM;
    }
  });

  return {
    // Ambil dan kosongkan aksi yang terkumpul sejak frame sebelumnya.
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
    // Ambil dan kosongkan titik klik terakhir (null bila tidak ada klik).
    takeClick() {
      const out = clickPoint;
      clickPoint = null;
      return out;
    },
  };
}
