// Web Audio implementation mirroring District Fury's C++ AudioSystem.cpp
export type SfxType =
  | 'Punch'
  | 'Kick'
  | 'Hit'
  | 'HeavyHit'
  | 'EnergyCharge'
  | 'EnergyShot'
  | 'EnergyImpact'
  | 'EnemyDeath'
  | 'BossAttack'
  | 'BossPhase'
  | 'Dash'
  | 'Rage'
  | 'Ui'
  | 'StageClear'
  | 'GameOver';

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundBuffers: Map<SfxType, AudioBuffer> = new Map();
  private muted: boolean = false;
  private musicPlaying: boolean = false;
  private musicNodes: { osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode; filter?: BiquadFilterNode } = {};
  private beatInterval: number | null = null;
  private currentStep: number = 0;

  constructor() {
    // Will be lazily initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.generateAllSounds();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private generateSound(
    frequency: number,
    duration: number,
    volume: number,
    noise: boolean = false
  ): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const sampleRate = 44100;
    const frames = Math.max(1, Math.floor(duration * sampleRate));
    const buffer = this.ctx.createBuffer(1, frames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i++) {
      const t = i / sampleRate;
      const envelope = Math.min(1.0, t * 55.0) * Math.max(0.0, 1.0 - t / duration);
      const carrier = Math.sin(2.0 * Math.PI * frequency * t);
      const grit = Math.sin(2.0 * Math.PI * (frequency * 2.73) * t) * 0.35;
      const sample = noise ? carrier * 0.55 + grit : carrier;
      data[i] = sample * envelope * volume;
    }

    return buffer;
  }

  private generateAllSounds() {
    if (!this.ctx) return;
    this.soundBuffers.set('Punch', this.generateSound(190.0, 0.075, 0.26));
    this.soundBuffers.set('Kick', this.generateSound(120.0, 0.105, 0.32));
    this.soundBuffers.set('Hit', this.generateSound(155.0, 0.07, 0.28, true));
    this.soundBuffers.set('HeavyHit', this.generateSound(82.0, 0.14, 0.38, true));
    this.soundBuffers.set('EnergyCharge', this.generateSound(330.0, 0.22, 0.20));
    this.soundBuffers.set('EnergyShot', this.generateSound(520.0, 0.13, 0.25));
    this.soundBuffers.set('EnergyImpact', this.generateSound(250.0, 0.18, 0.34, true));
    this.soundBuffers.set('EnemyDeath', this.generateSound(92.0, 0.16, 0.30, true));
    this.soundBuffers.set('BossAttack', this.generateSound(68.0, 0.22, 0.36, true));
    this.soundBuffers.set('BossPhase', this.generateSound(440.0, 0.42, 0.30));
    this.soundBuffers.set('Dash', this.generateSound(720.0, 0.10, 0.18));
    this.soundBuffers.set('Rage', this.generateSound(180.0, 0.40, 0.32));
    this.soundBuffers.set('Ui', this.generateSound(620.0, 0.06, 0.16));
    this.soundBuffers.set('StageClear', this.generateSound(520.0, 0.35, 0.24));
    this.soundBuffers.set('GameOver', this.generateSound(105.0, 0.42, 0.26));
  }

  public play(sfx: SfxType) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const buffer = this.soundBuffers.get(sfx);
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Synthesized dark synthwave pulse for beat'em up background atmosphere
  public startBGM() {
    if (this.musicPlaying || this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      this.musicPlaying = true;
      const bpm = 124;
      const stepTime = (60 / bpm) / 4; // 16th notes

      // Bass notes progression (Am - F - C - G arcade progression)
      const bassNotes = [
        110, 110, 110, 110,  110, 110, 164.81, 146.83,
        87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 130.81, 110,
        130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 164.81, 146.83,
        98.00, 98.00, 98.00, 98.00, 98.00, 98.00, 146.83, 123.47
      ];

      this.currentStep = 0;
      this.beatInterval = window.setInterval(() => {
        if (!this.ctx || this.muted || !this.musicPlaying) return;
        const now = this.ctx.currentTime;
        const freq = bassNotes[this.currentStep % bassNotes.length];

        // Bass synth
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq / 2, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + stepTime * 0.9);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + stepTime * 0.85);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + stepTime);

        // Hi-hat noise on off-beats
        if (this.currentStep % 2 === 1) {
          const hatBuffer = this.generateSound(1200, 0.03, 0.015, true);
          const hatSource = this.ctx.createBufferSource();
          hatSource.buffer = hatBuffer;
          hatSource.connect(this.ctx.destination);
          hatSource.start(now);
        }

        // Snare pulse on beats 4 and 12
        if (this.currentStep % 8 === 4) {
          const snareBuffer = this.generateSound(220, 0.08, 0.03, true);
          const snareSource = this.ctx.createBufferSource();
          snareSource.buffer = snareBuffer;
          snareSource.connect(this.ctx.destination);
          snareSource.start(now);
        }

        this.currentStep++;
      }, stepTime * 1000);
    } catch {
      // Audio context may require click
    }
  }

  public stopBGM() {
    this.musicPlaying = false;
    if (this.beatInterval !== null) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  public setMuted(val: boolean) {
    this.muted = val;
    if (val) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

export const audioSystem = new AudioManager();
