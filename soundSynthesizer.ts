/**
 * NEUROCALM SOUND SYNTHESIZER
 * Pure Web Audio API ambient audio generator.
 * Zero external audio files or brittle URLs.
 * Evidence framing: Comfort sound only (strictly NO claims of "healing frequencies" or "vagus tones").
 */

export type AmbientSoundType = 'NONE' | 'RAIN' | 'OCEAN' | 'SOFT_AMBIENT';

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private activeSound: AmbientSoundType = 'NONE';

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'NONE') return;

    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    if (type === 'RAIN') {
      this.playRain(ctx, this.gainNode);
    } else if (type === 'OCEAN') {
      this.playOcean(ctx, this.gainNode);
    } else if (type === 'SOFT_AMBIENT') {
      this.playSoftAmbient(ctx, this.gainNode);
    }

    this.activeSound = type;
  }

  private playRain(ctx: AudioContext, destination: GainNode) {
    // Generate pink noise buffer for rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();
    this.currentSource = whiteNoise;
  }

  private playOcean(ctx: AudioContext, destination: GainNode) {
    // Ocean: brown noise with cyclic LFO volume sweep
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const oceanGain = ctx.createGain();
    oceanGain.gain.setValueAtTime(0.5, ctx.currentTime);

    // LFO for wave swelling
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave period
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc.connect(lfoGain);
    lfoGain.connect(oceanGain.gain);
    osc.start();

    noise.connect(oceanGain);
    oceanGain.connect(destination);
    noise.start();
    this.currentSource = noise;
  }

  private playSoftAmbient(ctx: AudioContext, destination: GainNode) {
    // Gentle dual-frequency harmonic drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(196, ctx.currentTime); // G3
    osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.04, ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(destination);

    osc1.start();
    osc2.start();
    this.currentSource = subGain;
  }

  public stop() {
    if (this.currentSource) {
      try {
        (this.currentSource as any).stop?.();
      } catch {
        // ignore
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    this.activeSound = 'NONE';
  }

  public getActiveSound(): AmbientSoundType {
    return this.activeSound;
  }
}

export const soundSynthesizer = new SoundSynthesizer();
