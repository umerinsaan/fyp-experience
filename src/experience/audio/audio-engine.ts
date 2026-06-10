/**
 * FypAudio — a tiny synthesized sound bed for the briefing. No audio assets:
 * everything is generated with the Web Audio API so the bundle stays light and
 * there's nothing to load. Off by default (autoplay policies + presenter
 * control); the first enable happens on a user gesture.
 *
 * Layers:
 *  - ambient drone: two detuned oscillators through a lowpass, slow gain LFO.
 *  - act transition: a short filtered-noise "whoosh".
 *  - chime: a soft major chord for landmark moments (impact / vision).
 */

const ACT_BASE_HZ = [
  98, // hero
  92, // problem (darker)
  87, // cost (darkest, tension)
  110, // objective (lifts)
  116, // architecture
  123, // workflow
  130, // agent
  127, // jobs
  134, // pipeline
  131, // mitre
  138, // smart
  146, // impact (bright)
  155, // vision (brightest)
];

let sharedEngine: FypAudio | null = null;

/** Shared engine — SoundToggle and scroll-driven stingers use the same instance. */
export function getFypAudio(): FypAudio {
  if (!sharedEngine) sharedEngine = new FypAudio();
  return sharedEngine;
}

export class FypAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private started = false;

  get isRunning(): boolean {
    return this.started;
  }

  /** Lazily build the graph + start the ambient bed. Call from a user gesture. */
  start(): void {
    if (this.started) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.06;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 520;
    droneFilter.Q.value = 0.7;
    droneGain.connect(droneFilter);
    droneFilter.connect(master);
    this.droneFilter = droneFilter;

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = ACT_BASE_HZ[0];
    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = ACT_BASE_HZ[0] * 1.5;
    oscB.detune.value = 4;
    oscA.connect(droneGain);
    oscB.connect(droneGain);
    oscA.start();
    oscB.start();
    this.oscA = oscA;
    this.oscB = oscB;

    // Slow breathing of the drone level.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);
    lfo.start();
    this.lfo = lfo;

    // Pre-render a noise buffer for whooshes.
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    // Fade master up.
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.9, now + 0.6);

    void ctx.resume();
    this.started = true;
  }

  /** Fade out and tear down. */
  stop(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) {
      this.started = false;
      return;
    }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.4);
    window.setTimeout(() => {
      try {
        this.oscA?.stop();
        this.oscB?.stop();
        this.lfo?.stop();
        void ctx.close();
      } catch {
        /* already closed */
      }
      this.ctx = null;
      this.started = false;
    }, 500);
  }

  /** Shift the ambient tone + fire a whoosh when the act changes. */
  transition(actIndex: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.oscA || !this.oscB || !this.droneFilter) return;
    const base = ACT_BASE_HZ[Math.max(0, Math.min(ACT_BASE_HZ.length - 1, actIndex))];
    const now = ctx.currentTime;
    this.oscA.frequency.linearRampToValueAtTime(base, now + 1.2);
    this.oscB.frequency.linearRampToValueAtTime(base * 1.5, now + 1.2);
    // Brighter filter as the story lifts.
    const cutoff = 380 + actIndex * 90;
    this.droneFilter.frequency.linearRampToValueAtTime(cutoff, now + 1.2);
    this.whoosh();
  }

  private whoosh(
    peakGain = 0.12,
    lowHz = 300,
    highHz = 1800,
    duration = 0.6,
  ): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || !this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 0.8;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    band.frequency.setValueAtTime(lowHz, now);
    band.frequency.exponentialRampToValueAtTime(highHz, now + duration * 0.85);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(peakGain, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(band);
    band.connect(g);
    g.connect(master);
    src.start(now);
    src.stop(now + duration + 0.1);
  }

  /** Deep swell when the architecture ecosystem pulls back into view (Pass 2). */
  revealPullback(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || !this.oscA || !this.droneFilter) return;
    const now = ctx.currentTime;
    this.oscA.frequency.cancelScheduledValues(now);
    this.oscA.frequency.setValueAtTime(this.oscA.frequency.value, now);
    this.oscA.frequency.exponentialRampToValueAtTime(72, now + 0.08);
    this.oscA.frequency.exponentialRampToValueAtTime(116, now + 1.8);
    this.droneFilter.frequency.cancelScheduledValues(now);
    this.droneFilter.frequency.setValueAtTime(this.droneFilter.frequency.value, now);
    this.droneFilter.frequency.exponentialRampToValueAtTime(280, now + 0.1);
    this.droneFilter.frequency.exponentialRampToValueAtTime(680, now + 2.2);
    this.whoosh(0.16, 220, 2400, 0.9);
  }

  /** Soft ripple when packets cross the membrane — throttled (Pass 2.5). */
  boundaryRipple(strength = 1): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const gain = 0.035 + strength * 0.025;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620 + strength * 120, now);
    osc.frequency.exponentialRampToValueAtTime(940 + strength * 80, now + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Short ping when the trust boundary first activates (Pass 2). */
  boundaryPing(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** Pass 5 — architecture finale: purple intelligence chord. */
  correlationFinale(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const notes = [349.23, 440.0, 523.25]; // F4 · A4 · C5 — warm purple lift
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t0 = now + i * 0.05;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 1.7);
    });
    this.whoosh(0.1, 400, 1600, 0.75);
  }

  /** Pass 5 — workflow ring alive: mint flow undertone. */
  workflowFlow(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || !this.oscB) return;
    const now = ctx.currentTime;
    this.oscB.frequency.cancelScheduledValues(now);
    this.oscB.frequency.setValueAtTime(this.oscB.frequency.value, now);
    this.oscB.frequency.exponentialRampToValueAtTime(185, now + 0.5);
    this.oscB.frequency.exponentialRampToValueAtTime(123 * 1.5, now + 2.0);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now);
    osc.frequency.exponentialRampToValueAtTime(523, now + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.055, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  /** Pass 5 — Agent act entry: mint + purple bridge stinger. */
  agentHandoff(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const pairs: [number, number][] = [
      [523.25, 0.065],
      [659.25, 0.05],
      [783.99, 0.04],
    ];
    pairs.forEach(([freq, peak], i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t0 = now + i * 0.07;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.5);
    });
    this.boundaryPing();
  }

  /** Pass 6 — Impact act opening (amber resolution). */
  impactChime(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    [392.0, 493.88, 587.33].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t0 = now + i * 0.055;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.085, t0 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.5);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 1.55);
    });
    this.whoosh(0.09, 500, 2000, 0.65);
  }

  /** Pass 6 — Vision finale (bright resolve). */
  visionResolve(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 987.77].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 3 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t0 = now + i * 0.045;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 1.85);
    });
  }

  /** A soft chord for landmark beats (legacy / manual). */
  chime(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 · E5 · G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      const t0 = now + i * 0.06;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + 1.5);
    });
  }
}
