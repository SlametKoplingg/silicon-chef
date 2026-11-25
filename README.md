# silicon-chef

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/SlametKoplingg/silicon-chef/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/SlametKoplingg/silicon-chef/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Silicon Chef** — game masak Overcooked-lite di mana bahannya bukan sayuran,
melainkan **komponen PC kecil**: SSD, RAM, GPU, Monitor, CPU, Kipas,
Motherboard, dan Kabel. Komponennya **dimasak, bukan dirakit** — GPU ditumis di
wajan, RAM direbus di panci, SSD dipanggang di oven, Monitor dipotong di
talenen, Kipas diaduk di mangkuk — sampai jadi PC utuh yang disajikan ke
pelanggan sebelum ordernya kedaluwarsa.

Order masuk di order board, pemain merencanakan rute lewat lima stasiun dapur,
memasak tiap komponen tepat waktu, merakitnya di piring, dan menyajikan sebelum
kesabaran pelanggan habis. Masakan yang dibiarkan terlalu lama akan gosong,
order yang kedaluwarsa mengurangi hati, dan combo sajian beruntun menambah
bonus poin. Shift berlangsung 3 menit dengan 5 resep PC, dari PC Kantor sampai
PC Server.

## Cara main

1. **Order masuk** di order board (atas layar): pelanggan memesan sebuah PC,
   mis. PC Gaming atau PC Sultan.
2. **Klik komponen** di counter bahan (bawah layar), lalu **klik stasiun yang
   benar** — stasiun salah ditolak (shake + buzz).
3. **Tunggu sampai matang** (ding!), **klik stasiun untuk ambil**, lalu
   **klik piring** untuk menaruhnya.
4. Kalau semua komponen resep sudah di piring, klik **SAJIKAN**. Poin +
   bonus waktu + bonus combo.
5. Masakan yang dibiarkan terlalu lama setelah matang akan **gosong**
   (hati −1). Order yang kedaluwarsa juga mengurangi hati. **3 hati** — habis
   berarti game over. Shift berlangsung **3 menit**; skor akhir menentukan
   bintang (1–3).

### Resep

| PC | Komponen | Poin |
|----|----------|------|
| PC Kantor | RAM rebus + SSD panggang + Monitor potong | 100 |
| PC Gaming | GPU tumis + RAM rebus + SSD panggang + Kipas aduk | 220 |
| PC Editing | CPU tumis + Motherboard panggang + RAM rebus + Monitor potong | 260 |
| PC Sultan | GPU tumis + CPU tumis + SSD panggang + RAM rebus + Kabel potong | 350 |
| PC Server | Motherboard panggang + CPU tumis + RAM rebus + SSD panggang + Kipas aduk | 380 |

### Kontrol

- Mouse: klik bahan → klik stasiun → klik ambil → klik piring → klik Sajikan / Buang
- Keyboard: `1–8` pilih bahan, `Q/W/E/R/T` pilih stasiun, `Spasi` sajikan,
  `M` mute, `P` jeda

## Run it

```sh
node serve.ts
```

Buka http://localhost:8080. Tidak ada build step dan tidak ada network
request: semua gambar digambar prosedural di canvas dan semua suara dibuat
prosedural dengan WebAudio.

### Struktur

```
silicon-chef/
  main.ts                  # program penyerahan (Node 22 stdlib only)
  serve.ts                 # server statis dev
  shots.json               # definisi 4 screenshot
  LICENSE                  # MIT
  vendor/makefun-game.ts   # library kit make.fun (tidak diubah)
  game/
    index.html
    src/config.js          # komponen, stasiun, resep, tuning, layout
    src/audio.js           # suara prosedural (WebAudio)
    src/render.js          # gambar dapur, komponen, chef, partikel (canvas)
    src/input.js           # mouse + keyboard
    src/kitchen.js         # state game: order, masak, skor, hati, combo
    src/random.js          # RNG berseed (deterministik)
    src/shots.js           # adegan deterministik untuk screenshot
    src/main.js            # boot + game loop
  screenshots/
    1-cover.jpg  2-cook.jpg  3-rush.jpg  4-serve.jpg
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=8herqm24&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
