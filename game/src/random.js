// Silicon Chef — random.js
// RNG berseed (mulberry32): urutan order dan variasi visual sama untuk seed yang
// sama, jadi screenshot deterministik dan play-test bisa diulang.

// Mengubah satu bilangan bulat 32-bit menjadi generator angka 0..1.
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ambil bilangan bulat acak dalam [min, max] dari generator `rng`.
export function randomInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Ambil satu elemen acak dari `list` memakai generator `rng`.
export function randomPick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// Acak urutan salinan `list` (Fisher-Yates) memakai generator `rng`.
export function shuffle(rng, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
