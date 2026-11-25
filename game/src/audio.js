// Silicon Chef — audio.js
// Semua suara dibuat prosedural dengan WebAudio: tanpa file audio sama sekali.
// Sizzle = noise yang difilter, gelembung = blip sinus naik-turun, ding/jingle =
// nada-nada pendek, buzz = gergaji rendah, gosong = desis turun. AudioContext
// dibuat malas (saat interaksi pertama) supaya tidak kena autoplay policy.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let sizzleNodes = null;

  // Buat (atau kembalikan) AudioContext; gagal diam-diam di lingkungan tanpa audio.
  function context() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  // Satu nada osilator: frekuensi, durasi, jenis gelombang, volume, dan kapan mulai.
  function tone(freq, dur, type, vol, when, slideTo) {
    const ac = context();
    if (!ac || muted) return;
    try {
      if (ac.state === 'suspended') void ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const t0 = ac.currentTime + (when || 0);
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // Audio tidak boleh mematikan game.
    }
  }

  // Desis noise putih lewat bandpass: dipakai untuk sizzle dan gosong.
  function noise(dur, freq, vol, when) {
    const ac = context();
    if (!ac || muted) return;
    try {
      if (ac.state === 'suspended') void ac.resume();
      const len = Math.max(1, Math.floor(ac.sampleRate * dur));
      const buffer = ac.createBuffer(1, len, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = 0.8;
      const gain = ac.createGain();
      const t0 = ac.currentTime + (when || 0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch {
      // Audio tidak boleh mematikan game.
    }
  }

  return {
    get muted() {
      return muted;
    },
    // Nyalakan/matikan semua suara; mematikan juga menghentikan sizzle yang jalan.
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    // "Buka" AudioContext dari gestur pengguna (klik/tombol) supaya bunyi berikutnya jalan.
    unlock() {
      context();
    },
    playPop() {
      tone(520, 0.09, 'sine', 0.1, 0, 760);
    },
    playPick() {
      tone(660, 0.08, 'triangle', 0.1, 0, 880);
    },
    playDing() {
      tone(880, 0.28, 'sine', 0.14);
      tone(1318, 0.32, 'sine', 0.09, 0.07);
    },
    playJingle() {
      tone(523, 0.14, 'triangle', 0.13);
      tone(659, 0.14, 'triangle', 0.13, 0.11);
      tone(784, 0.2, 'triangle', 0.14, 0.22);
      tone(1046, 0.32, 'triangle', 0.13, 0.33);
    },
    playBuzz() {
      tone(140, 0.22, 'sawtooth', 0.1, 0, 90);
      tone(110, 0.22, 'sawtooth', 0.08, 0.05, 70);
    },
    playBurn() {
      noise(0.6, 900, 0.12);
      tone(220, 0.5, 'sawtooth', 0.07, 0, 60);
    },
    playBubble() {
      tone(300 + Math.random() * 300, 0.1, 'sine', 0.05, 0, 520);
    },
    playChop() {
      noise(0.08, 2400, 0.14);
      tone(180, 0.07, 'square', 0.06, 0, 120);
    },
    // Desis masak yang terus berbunyi selama ada yang dimasak; dipanggil tiap frame.
    startSizzle() {
      const ac = context();
      if (!ac || muted || sizzleNodes) return;
      try {
        if (ac.state === 'suspended') void ac.resume();
        const len = ac.sampleRate;
        const buffer = ac.createBuffer(1, len, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 4200;
        filter.Q.value = 0.6;
        const gain = ac.createGain();
        gain.gain.value = 0.035;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        src.start();
        sizzleNodes = { src, gain };
      } catch {
        sizzleNodes = null;
      }
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.src.stop();
      } catch {
        // Sudah berhenti.
      }
      sizzleNodes = null;
    },
  };
}
