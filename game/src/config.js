// Silicon Chef — config.js
// Satu sumber kebenaran untuk semua tuning game: komponen PC, stasiun masak,
// resep, layout layar 1280x720, dan angka-angka kesulitan. Tidak ada logika di sini,
// hanya data, supaya balance bisa diubah tanpa menyentuh mesin game.

// ---- Layar ----
export const VIEW = { width: 1280, height: 720 };

// ---- Stasiun masak (5) ----
export const STATIONS = [
  { id: 'talenen', name: 'Talenen', verb: 'Potong', key: 'Q', color: '#e8a34c', dark: '#b97a2e' },
  { id: 'wajan', name: 'Wajan', verb: 'Tumis', key: 'W', color: '#e4572e', dark: '#b23a1d' },
  { id: 'panci', name: 'Panci', verb: 'Rebus', key: 'E', color: '#2a9d8f', dark: '#1d6f66' },
  { id: 'oven', name: 'Oven', verb: 'Panggang', key: 'R', color: '#e9c46a', dark: '#b8933a' },
  { id: 'mangkuk', name: 'Mangkuk', verb: 'Aduk', key: 'T', color: '#9b5de5', dark: '#6d34b0' },
];

// ---- Komponen PC (8): masing-masing punya SATU langkah masak wajib ----
export const COMPONENTS = [
  { id: 'ssd', name: 'SSD', station: 'oven', cook: 4, color: '#c0c8d0', dark: '#8a94a0', shape: 'slab' },
  { id: 'ram', name: 'RAM', station: 'panci', cook: 3, color: '#43aa5b', dark: '#2c7a3e', shape: 'stick' },
  { id: 'gpu', name: 'GPU', station: 'wajan', cook: 5, color: '#3a86ff', dark: '#2456b3', shape: 'card' },
  { id: 'monitor', name: 'Monitor', station: 'talenen', cook: 3, color: '#5ec8e5', dark: '#2f8aa8', shape: 'screen' },
  { id: 'cpu', name: 'CPU', station: 'wajan', cook: 4, color: '#f4b942', dark: '#b98a1d', shape: 'chip' },
  { id: 'kipas', name: 'Kipas', station: 'mangkuk', cook: 3, color: '#ef476f', dark: '#b32a4d', shape: 'fan' },
  { id: 'mobo', name: 'Motherboard', station: 'oven', cook: 5, color: '#4361ee', dark: '#2c3fa3', shape: 'board' },
  { id: 'kabel', name: 'Kabel', station: 'talenen', cook: 3, color: '#ff7b00', dark: '#b35600', shape: 'cable' },
];

export function componentById(id) {
  return COMPONENTS.find((c) => c.id === id);
}
export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

// ---- Resep (5): nama PC + komponen yang harus dimasak + poin ----
// Urutan komponen di sini adalah urutan yang ditampilkan di kartu order.
export const RECIPES = [
  { id: 'kantor', name: 'PC Kantor', level: 'Mudah', points: 100, parts: ['ram', 'ssd', 'monitor'] },
  { id: 'gaming', name: 'PC Gaming', level: 'Sedang', points: 220, parts: ['gpu', 'ram', 'ssd', 'kipas'] },
  { id: 'editing', name: 'PC Editing', level: 'Sedang', points: 260, parts: ['cpu', 'mobo', 'ram', 'monitor'] },
  { id: 'sultan', name: 'PC Sultan', level: 'Sulit', points: 350, parts: ['gpu', 'cpu', 'ssd', 'ram', 'kabel'] },
  { id: 'server', name: 'PC Server', level: 'Sulit', points: 380, parts: ['mobo', 'cpu', 'ram', 'ssd', 'kipas'] },
];

// ---- Tuning kesulitan ----
export const TUNING = {
  shiftSeconds: 180, // satu shift = 3 menit
  maxHearts: 3,
  orderIntervalStart: 18, // detik antar order di awal shift
  orderIntervalEnd: 10, // detik antar order di akhir shift
  patienceMin: 45, // detik kesabaran order (mudah)
  patienceMax: 60, // detik kesabaran order (sulit)
  burnWindow: 4, // detik setelah matang sebelum gosong
  maxOrders: 3, // order bersamaan di papan
  timeBonusPerSecond: 2, // bonus poin per detik kesabaran tersisa saat sajikan
  comboBonus: 25, // bonus per tingkat combo
  starScore1: 400, // skor untuk 1 bintang
  starScore2: 900, // skor untuk 2 bintang
  starScore3: 1500, // skor untuk 3 bintang
};

// ---- Layout (koordinat piksel di canvas 1280x720) ----
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 58 },
  orders: { x: 24, y: 68, w: 1232, h: 96, cardW: 396, gap: 20 },
  stations: { x: 24, y: 182, w: 880, h: 210, gap: 12 },
  plate: { x: 928, y: 182, w: 328, h: 210 },
  counter: { x: 24, y: 412, w: 1232, h: 118 },
  footer: { x: 24, y: 548, w: 1232, h: 148 },
};

export const BEST_KEY = 'silicon-chef-best';
export const STEP = 1 / 60;
