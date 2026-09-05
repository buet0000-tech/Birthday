/* ————————————————————————————————————————————————
   CHAPTER 25 — SOUND ENGINE (pure Web Audio)
   Synthesized on-device: no audio files required.
   • SFX: ticks, flips, unlock chime, fanfare, pops
   • MusicBox: generative ambient loop (background)
   • MelodyPlayer: sequenced "voice note" melodies
———————————————————————————————————————————————— */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/* ——— tiny helpers ——— */
function env(g: GainNode, t: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
}

function tone(
  freq: number,
  t: number,
  dur: number,
  type: OscillatorType,
  peak: number,
  dest: AudioNode,
  detune = 0
) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.detune.setValueAtTime(detune, t);
  env(g, t, peak, dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noiseBurst(t: number, dur: number, peak: number, dest: AudioNode, fFrom = 600, fTo = 3200) {
  const c = ctx!;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(fFrom, t);
  bp.frequency.exponentialRampToValueAtTime(fTo, t + dur);
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(dest);
  src.start(t);
}

/* ————————————————— SFX ————————————————— */
export const sfx = {
  tick() {
    const c = ac(); if (!c) return;
    tone(1560, c.currentTime, 0.045, "square", 0.035, c.destination);
    tone(3120, c.currentTime, 0.03, "sine", 0.02, c.destination);
  },
  flip() {
    const c = ac(); if (!c) return;
    noiseBurst(c.currentTime, 0.16, 0.05, c.destination, 500, 2600);
  },
  hover() {
    const c = ac(); if (!c) return;
    tone(2200, c.currentTime, 0.04, "sine", 0.012, c.destination);
  },
  wrong() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    tone(196, t, 0.22, "sine", 0.09, c.destination);
    tone(185, t + 0.02, 0.26, "triangle", 0.07, c.destination);
  },
  correct() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    tone(midi(76), t, 0.5, "triangle", 0.1, c.destination);
    tone(midi(81), t + 0.09, 0.7, "sine", 0.09, c.destination);
    tone(midi(88), t + 0.18, 0.9, "sine", 0.06, c.destination);
  },
  unlock() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    // dreamy echo line
    const delay = c.createDelay();
    delay.delayTime.value = 0.27;
    const fb = c.createGain(); fb.gain.value = 0.38;
    const wet = c.createGain(); wet.gain.value = 0.5;
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(c.destination);
    const notes = [72, 76, 79, 84, 88, 91];
    notes.forEach((n, i) => {
      const tt = t + i * 0.105;
      tone(midi(n), tt, 1.1, "triangle", 0.11, c.destination);
      tone(midi(n) * 2, tt, 0.5, "sine", 0.035, c.destination);
      tone(midi(n), tt, 1.0, "sine", 0.07, delay);
    });
    // warm pad swell
    pad(c, t, [48, 55, 64], 2.2, 0.028);
  },
  pop() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    noiseBurst(t, 0.09, 0.12, c.destination, 1200, 5200);
    tone(880, t, 0.1, "sine", 0.06, c.destination);
    tone(440, t, 0.14, "triangle", 0.05, c.destination);
  },
  puff() {
    const c = ac(); if (!c) return;
    noiseBurst(c.currentTime, 0.24, 0.075, c.destination, 900, 240);
  },
  fanfare() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const line = [72, 76, 79, 84, 83, 84];
    line.forEach((n, i) => {
      const tt = t + i * 0.13;
      tone(midi(n), tt, 0.7, "triangle", 0.11, c.destination);
      tone(midi(n) * 2, tt, 0.35, "sine", 0.03, c.destination);
    });
    pad(c, t + 0.1, [60, 64, 67, 72], 2.8, 0.034);
  },
  whooshBlow() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    noiseBurst(t, 0.9, 0.1, c.destination, 2500, 300);
    tone(520, t, 0.5, "sine", 0.03, c.destination);
  },
};

function pad(c: AudioContext, t: number, notes: number[], dur: number, peak: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + dur * 0.3);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 1500;
  g.connect(lp).connect(c.destination);
  notes.forEach((n) => {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = midi(n);
    o.detune.value = (Math.random() - 0.5) * 10;
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.1);
  });
}

/* ————————————————— MUSIC BOX ————————————————— */
class MusicBoxEngine {
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private master: GainNode | null = null;
  private wetSend: GainNode | null = null;
  playing = false;
  muted = false;

  /* dreamy progression: Cmaj9 – Am9 – Fmaj9 – G6, music-box pluck */
  private bars: number[][] = [
    [48, 55, 59, 64], [45, 52, 59, 64], [41, 48, 57, 64], [43, 50, 59, 64],
  ];
  private melody: (number | null)[][] = [
    [76, null, 79, null, 83, null, 79, null],
    [76, null, null, 72, 76, null, 71, null],
    [77, null, 81, null, 84, null, 81, null],
    [79, null, 76, null, 74, null, 71, null],
  ];

  start() {
    const c = ac(); if (!c || this.playing) return;
    this.playing = true;
    if (!this.master) {
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      const lp = c.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 4200;
      const delay = c.createDelay(1);
      delay.delayTime.value = 0.34;
      const fb = c.createGain(); fb.gain.value = 0.42;
      const wet = c.createGain(); wet.gain.value = 0.36;
      delay.connect(fb).connect(delay);
      delay.connect(wet).connect(lp);
      this.wetSend = c.createGain(); this.wetSend.gain.value = 0.8;
      this.wetSend.connect(delay);
      this.master.connect(lp).connect(c.destination);
      this.wetSend.connect(this.master);
    }
    this.master.gain.cancelScheduledValues(c.currentTime);
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, c.currentTime, 0.8);
    this.nextNote = c.currentTime + 0.1;
    this.step = 0;
    this.timer = setInterval(() => this.schedule(), 120);
  }

  private schedule() {
    const c = ctx; if (!c || !this.master) return;
    const BEAT = 0.42; // ~143bpm eighths → slow lullaby pulse
    while (this.nextNote < c.currentTime + 0.5) {
      const bar = Math.floor(this.step / 8) % 4;
      const beat = this.step % 8;
      // chord pluck at beat 0 and rolling arpeggio
      if (beat === 0) {
        this.bars[bar].forEach((n, i) => {
          this.pluck(midi(n), this.nextNote + i * 0.09, 0.09);
        });
      }
      if (beat === 4) {
        this.bars[bar].slice(1).forEach((n, i) => {
          this.pluck(midi(n + 12), this.nextNote + i * 0.11, 0.045);
        });
      }
      const m = this.melody[bar][beat];
      if (m) this.pluck(midi(m), this.nextNote, 0.085);
      this.nextNote += BEAT;
      this.step = (this.step + 1) % 32;
    }
  }

  private pluck(freq: number, t: number, peak: number) {
    const c = ctx!; if (!this.master || !this.wetSend) return;
    const g = c.createGain();
    env(g, t, peak, 1.4);
    const o1 = c.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    const o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2;
    const g2 = c.createGain(); g2.gain.value = 0.4;
    o1.connect(g); o2.connect(g2).connect(g);
    g.connect(this.master);
    g.connect(this.wetSend);
    o1.start(t); o1.stop(t + 1.6);
    o2.start(t); o2.stop(t + 1.6);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.25);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.master && ctx) this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    this.playing = false;
  }
}

export const music = new MusicBoxEngine();

/* ————————————————— MELODY PLAYER (voice notes) ————————————————— */
type NoteEvt = [midi: number, beats: number];

const BIRTHDAY_MELODY: NoteEvt[] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2.5],
];

const LULLABY_MELODY: NoteEvt[] = [
  [72, 1], [76, 1], [79, 1.5], [76, 0.5], [81, 1], [79, 1], [76, 1.5], [74, 0.5],
  [72, 2], [69, 1], [72, 1], [76, 1.5], [74, 0.5], [69, 1], [67, 1], [72, 3],
];

export class MelodyPlayer {
  private c: AudioContext | null = null;
  private startAt = 0;
  private seq: NoteEvt[];
  private beatSec: number;
  readonly duration: number;
  isPlaying = false;
  onEnded?: () => void;
  private endTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(kind: "birthday" | "lullaby") {
    this.seq = kind === "birthday" ? BIRTHDAY_MELODY : LULLABY_MELODY;
    this.beatSec = kind === "birthday" ? 0.46 : 0.5;
    const totalBeats = this.seq.reduce((s, n) => s + n[1], 0);
    this.duration = totalBeats * this.beatSec + 1.2;
  }

  get elapsed() {
    if (!this.c || !this.isPlaying) return 0;
    return Math.min(this.duration, this.c.currentTime - this.startAt);
  }

  play() {
    try {
      if (!this.c) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.c = new AC();
        this.scheduleAll();
      } else if (this.c.state === "suspended") {
        void this.c.resume();
      }
      this.isPlaying = true;
      this.armEndTimer();
    } catch { /* audio unavailable */ }
  }

  private armEndTimer() {
    if (this.endTimer) clearTimeout(this.endTimer);
    const remaining = (this.duration - this.elapsed) * 1000;
    this.endTimer = setTimeout(() => this.finish(), remaining);
  }

  private scheduleAll() {
    const c = this.c!;
    this.startAt = c.currentTime + 0.08;
    let t = this.startAt;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2600;
    lp.connect(c.destination);
    this.seq.forEach(([n, b]) => {
      const dur = b * this.beatSec;
      // humming voice: sine + soft third harmonic + vibrato
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.16, t + 0.06);
      g.gain.setValueAtTime(0.16, t + Math.max(0.06, dur - 0.12));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      const o = c.createOscillator();
      o.type = "sine"; o.frequency.value = midi(n);
      const h = c.createOscillator();
      h.type = "triangle"; h.frequency.value = midi(n) * 2;
      const hg = c.createGain(); hg.gain.value = 0.18;
      const vib = c.createOscillator(); vib.frequency.value = 5.2;
      const vibG = c.createGain(); vibG.gain.value = 4;
      vib.connect(vibG).connect(o.frequency);
      o.connect(g); h.connect(hg).connect(g);
      g.connect(lp);
      o.start(t); o.stop(t + dur);
      h.start(t); h.stop(t + dur);
      vib.start(t); vib.stop(t + dur);
      t += dur;
    });
  }

  pause() {
    if (this.c && this.isPlaying) {
      void this.c.suspend();
      if (this.endTimer) clearTimeout(this.endTimer);
      this.isPlaying = false;
    }
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  private finish() {
    this.isPlaying = false;
    this.onEnded?.();
    void this.c?.close();
    this.c = null;
  }

  destroy() {
    if (this.endTimer) clearTimeout(this.endTimer);
    this.isPlaying = false;
    void this.c?.close();
    this.c = null;
  }
}
