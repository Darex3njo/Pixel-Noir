// Simple Procedural Audio Engine for Pixel Noir
// Uses Web Audio API to generate retro-style synthwave/noir ambience and SFX

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  
  // Music Nodes
  private musicNodes: AudioNode[] = [];
  private currentPhase: string = 'NONE';
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {}

  // Initialize Audio Context (must be called after user interaction)
  public init() {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.4; // Music volume
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.3; // SFX volume
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.error("Audio init failed", e);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx!.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public getMuteState() {
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  public playSFX(type: 'CLICK' | 'HOVER' | 'TYPE' | 'SUCCESS' | 'FAIL' | 'ALERT' | 'START') {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);

    switch (type) {
      case 'HOVER':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
        
      case 'CLICK':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'START':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(880, t + 0.5);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;

      case 'TYPE':
        // Mechanical tick
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        // Random pitch variation for realism
        osc.detune.value = Math.random() * 100 - 50; 
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.start(t);
        osc.stop(t + 0.03);
        break;

      case 'ALERT':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
        
      case 'SUCCESS':
        // Arpeggio
        this.playNote(523.25, t, 0.1, 'triangle'); // C5
        this.playNote(659.25, t + 0.1, 0.1, 'triangle'); // E5
        this.playNote(783.99, t + 0.2, 0.4, 'square'); // G5
        return; // notes handled separately
        
      case 'FAIL':
        this.playNote(196.00, t, 0.4, 'sawtooth'); // G3
        this.playNote(185.00, t + 0.4, 0.8, 'sawtooth'); // F#3
        return;
    }
  }

  private playNote(freq: number, time: number, duration: number, type: OscillatorType) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.start(time);
    osc.stop(time + duration);
  }

  // --- DYNAMIC MUSIC ---
  
  public stopMusic() {
    this.musicNodes.forEach(n => {
        try { (n as any).stop(); } catch(e) {}
        n.disconnect();
    });
    this.musicNodes = [];
  }

  public setMusicPhase(phase: 'MENU' | 'INVESTIGATION' | 'INTERROGATION' | 'CONCLUSION_WIN' | 'CONCLUSION_LOSS') {
    if (!this.ctx || this.currentPhase === phase) return;
    this.currentPhase = phase;
    
    // Crossfade / Stop old music
    this.stopMusic();
    
    const t = this.ctx.currentTime;

    if (phase === 'MENU') {
        // Deep Drone (Noir/Synthwave Intro)
        this.createDrone(55, 'sawtooth', 0.15); // A1
        this.createDrone(110, 'triangle', 0.1); // A2
        this.createLFOFilter(0.2); // Slow breathing filter
    } 
    else if (phase === 'INVESTIGATION') {
        // Mysterious Arp + Bass
        this.createDrone(36.71, 'sawtooth', 0.2); // D1
        this.createDrone(73.42, 'sine', 0.2); // D2
        this.createPulse(2); // Slow rhythmic pulse
        this.createRandomBleeps(0.05); // Occasional high mystery notes
    }
    else if (phase === 'INTERROGATION') {
        // Tension (Faster pulse, higher pitch drone)
        this.createDrone(73.42, 'sawtooth', 0.15); // D2
        this.createDrone(77.78, 'sawtooth', 0.15); // D#2 (Dissonance)
        this.createPulse(6); // Fast pulse
    }
    else if (phase === 'CONCLUSION_WIN') {
        // Bright major drone
        this.createDrone(130.81, 'triangle', 0.2); // C3
        this.createDrone(164.81, 'triangle', 0.2); // E3
        this.createDrone(196.00, 'triangle', 0.2); // G3
    }
    else if (phase === 'CONCLUSION_LOSS') {
        // Dark dissonant drone
        this.createDrone(55.00, 'sawtooth', 0.3); // A1
        this.createDrone(82.41, 'sawtooth', 0.3); // E2
        this.createDrone(87.31, 'sawtooth', 0.2); // F2 (Minor 6th tension)
    }
  }

  // Generators
  private createDrone(freq: number, type: OscillatorType, vol: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      // Slight detune for analog feel
      osc.detune.value = Math.random() * 10 - 5;

      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 2); // Slow attack

      osc.start();
      this.musicNodes.push(osc, gain);
  }

  private createLFOFilter(rate: number) {
      // Logic to sweep a filter would go here
      // Simplified for reliability: LFO on volume of a sub-node
  }

  private createPulse(rate: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.value = 55; // Bass note
      osc.connect(gain);
      
      // LFO controls volume of bass note
      lfo.frequency.value = rate;
      lfo.connect(lfoGain);
      lfoGain.gain.value = 0.1; // Depth
      lfoGain.connect(gain.gain);
      
      gain.connect(this.musicGain!);
      gain.gain.value = 0.1;

      osc.start();
      lfo.start();
      this.musicNodes.push(osc, gain, lfo, lfoGain);
  }

  private createRandomBleeps(probability: number) {
      if (!this.ctx) return;
      // In a real app, use AudioWorklet or setInterval. 
      // Here we set a simple interval for "random" background noises
      const interval = setInterval(() => {
          if (this.currentPhase !== 'INVESTIGATION') {
              clearInterval(interval);
              return;
          }
          if (Math.random() < probability) {
              this.playSFX('TYPE'); // Reuse type sound as distant echo
          }
      }, 1000);
  }
}

export const soundManager = new SoundManager();