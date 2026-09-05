/* ————————————————————————————————————————————————
   MUSIC CONTROLLER — synth loop othoba nijer upload kora gaan
———————————————————————————————————————————————— */

import { music as synth } from "./audio";
import { getMedia } from "./media";

export type MusicMode = "synth" | "file" | "off";

type Listener = (playing: boolean) => void;

class MusicController {
  private audio: HTMLAudioElement | null = null;
  private url: string | null = null;
  private listeners = new Set<Listener>();
  mode: MusicMode = "synth";
  fileKey: string | undefined;
  playing = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private emit() { this.listeners.forEach((l) => l(this.playing)); }

  configure(mode: MusicMode, fileKey?: string) {
    const changed = mode !== this.mode || fileKey !== this.fileKey;
    this.mode = mode;
    this.fileKey = fileKey;
    if (changed && this.playing) { this.stop(); void this.start(); }
    if (mode === "off") this.stop();
  }

  async start() {
    if (this.mode === "off") return;
    if (this.mode === "synth") {
      synth.start();
      this.playing = true;
      this.emit();
      return;
    }
    // file mode
    if (!this.fileKey) return;
    try {
      if (!this.audio) {
        const blob = await getMedia(this.fileKey);
        if (!blob) return;
        this.url = URL.createObjectURL(blob);
        this.audio = new Audio(this.url);
        this.audio.loop = true;
        this.audio.volume = 0.55;
      }
      await this.audio.play();
      this.playing = true;
      this.emit();
    } catch { /* autoplay blocked */ }
  }

  stop() {
    synth.stop();
    this.audio?.pause();
    this.playing = false;
    this.emit();
  }

  toggle() {
    if (this.playing) this.stop();
    else void this.start();
  }

  /** upload change hole cached audio element reset kora dorkar */
  reset() {
    this.stop();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null;
    this.audio = null;
  }
}

export const musicCtl = new MusicController();
