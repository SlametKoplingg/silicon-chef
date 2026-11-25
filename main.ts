// Silicon Chef — main.ts (program penyerahan, Node 22 stdlib only).
//
// Game-nya adalah folder game/ di sebelah file ini: file statis biasa yang
// dibuka browser desktop secara offline (game/index.html dan modul-modul ES-nya,
// tanpa library dan tanpa satu pun network request). Program ini menyerahkan
// game tersebut: menyalin game/ dan screenshots/ dari repositori ke /output,
// lalu menulis /output/dossier.json — ringkasan yang dibaca juri — dengan
// library make.fun yang divendor di vendor/makefun-game.ts.
//
// Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Menjalankannya dua kali harus menulis byte yang sama persis.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas-batas scorer sendiri (reference/gate.json): hanya text_max_bytes yang
// membentuk byte dossier; sisanya menolak entri yang scorer sendiri akan tolak
// (lebih dari 4 screenshot atau satu di atas 256 KiB; lebih dari 993 file di
// game/ atau 48 MiB file game, atau path di bawah game/ lebih dari 1000 byte:
// game/ dihitung berdampingan dengan batas 1000 entri /output, screenshot dan
// dossier.json-nya).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
