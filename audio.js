/**
 * MARIO CARTER - Web Audio API Procedural Sound Engine (audio.js)
 * Pure Web Audio API procedural synthesis with zero external dependencies.
 * Provides instant real-time sound effects, dynamic engine RPM audio,
 * drift sparks, mini-turbo whoosh, items, fanfares, and an upbeat kart synth groove.
 */

(function (window) {
  'use strict';

  class CarterAudioEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.isMusicPlaying = false;
      this.masterGain = null;
      this.sfxGain = null;
      this.musicGain = null;

      // Engine oscillator node references
      this.engineOsc1 = null;
      this.engineOsc2 = null;
      this.engineFilter = null;
      this.engineGain = null;
      this.engineRunning = false;

      // Music loop timing
      this.musicInterval = null;
      this.musicStep = 0;
      this.tempo = 136; // Upbeat Mario Kart BPM

      // Auto-unlock audio on user gesture
      this.bindGestureUnlock();
    }

    bindGestureUnlock() {
      if (typeof window === 'undefined') return;
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[CarterAudio] Web Audio API not supported on this platform.');
        return;
      }

      this.ctx = new AudioCtx();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.38, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.setupEngineSound();
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        const target = this.isMuted ? 0 : 0.75;
        this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
      }
      return this.isMuted;
    }

    // =========================================================================
    // 1. DYNAMIC ENGINE SOUND (Dual detuned oscillators + lowpass sweep)
    // =========================================================================
    setupEngineSound() {
      if (!this.ctx) return;

      try {
        this.engineOsc1 = this.ctx.createOscillator();
        this.engineOsc2 = this.ctx.createOscillator();
        this.engineFilter = this.ctx.createBiquadFilter();
        this.engineGain = this.ctx.createGain();

        this.engineOsc1.type = 'sawtooth';
        this.engineOsc2.type = 'triangle';

        this.engineOsc1.frequency.setValueAtTime(46, this.ctx.currentTime);
        this.engineOsc2.frequency.setValueAtTime(46.8, this.ctx.currentTime);

        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
        this.engineFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

        this.engineGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);

        this.engineOsc1.connect(this.engineFilter);
        this.engineOsc2.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);

        this.engineOsc1.start();
        this.engineOsc2.start();
        this.engineRunning = true;
      } catch (err) {
        console.warn('[CarterAudio] Engine audio setup error:', err);
      }
    }

    startEngineSound() {
      this.init();
      if (!this.engineRunning) {
        this.setupEngineSound();
      }
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.1);
      }
    }

    updateEngineSound(speedRatio = 0, isDrifting = false, isBoosting = false) {
      if (!this.ctx || !this.engineRunning) return;

      const t = this.ctx.currentTime;
      const clampedRatio = Math.max(0, Math.min(speedRatio, 1.4));

      // Pitch: 46Hz at idle up to 185Hz at top speed
      let baseFreq = 46 + clampedRatio * 135;

      if (isBoosting) {
        baseFreq += 36;
      }
      if (isDrifting) {
        baseFreq += 22;
      }

      this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.018, t, 0.05);

      // Lowpass cutoff opens up as kart accelerates
      let filterCutoff = 190 + clampedRatio * 820;
      if (isBoosting) filterCutoff += 450;
      if (isDrifting) filterCutoff += 240;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.07);

      // Engine volume based on throttle
      let targetVol = 0.04 + clampedRatio * 0.15;
      if (isBoosting) targetVol += 0.06;
      this.engineGain.gain.setTargetAtTime(targetVol, t, 0.05);
    }

    stopEngineSound() {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
      }
    }

    // Backward compatibility aliases for engine
    updateEngine(speedRatio, isDrifting, driftLevel) {
      this.updateEngineSound(speedRatio, isDrifting, driftLevel > 0);
    }

    stopEngine() {
      this.stopEngineSound();
    }

    // =========================================================================
    // 2. COUNTDOWN BEEPS (3, 2, 1 -> 440Hz beep; 0 -> 880Hz GO chord!)
    // =========================================================================
    playCountdownBeep(stage) {
      this.init();
      this.resume();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      if (stage === 3 || stage === 2 || stage === 1) {
        // Classic 440Hz Mario Kart warning beep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t); // A4 (440Hz)
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.32);
      } else if (stage === 0) {
        // 880Hz GO Chord! (A5 880Hz fundamental + C#6 + E6 triumphant major triad)
        const chord = [880.0, 1108.73, 1318.51];

        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, t);

          const vol = idx === 0 ? 0.55 : 0.35;
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

          osc.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(t);
          osc.stop(t + 0.9);
        });
      }
    }

    playCountdown(step) {
      this.playCountdownBeep(step);
    }

    // =========================================================================
    // 3. DRIFT SPARKS & BOOST
    // =========================================================================
    playDriftSpark(level = 1) {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch tiers: Level 1 (Blue) 660Hz, Level 2 (Orange) 880Hz, Level 3 (Purple) 1175Hz
      const freqs = [660, 880, 1175];
      const f = freqs[Math.max(0, Math.min(level - 1, 2))];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.1);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.14);
    }

    playHop() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(560, t + 0.1);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.13);
    }

    playBoost() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      // 1. Noise whoosh
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, t);
        filter.frequency.exponentialRampToValueAtTime(2600, t + 0.38);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        noise.start(t);
        noise.stop(t + 0.45);
      } catch (e) {
        // Graceful buffer fallback
      }

      // 2. Ascending synth power riser (C4 -> G4 -> C5 -> E5)
      const chord = [261.63, 392.0, 523.25, 659.25];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.32);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    }

    playMiniTurbo(level = 1) {
      this.playBoost();
    }

    // =========================================================================
    // 4. ITEM ROULETTE & ITEM ACQUISITION
    // =========================================================================
    playItemRouletteTick() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(850 + Math.random() * 200, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.05);
    }

    playItemLocked() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // 4-note ascending fanfare (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);

        gain.gain.setValueAtTime(0.24, t + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.2);
      });
    }

    playItemAcquired() {
      this.playItemLocked();
    }

    // =========================================================================
    // 5. SHELLS, SPINOUTS & COIN PICKUPS
    // =========================================================================
    playShellFire() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.16);

      gain.gain.setValueAtTime(0.32, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
    }

    playShellShoot() {
      this.playShellFire();
    }

    playSpinOut() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      // Descending sawtooth screech
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.42);

      gain.gain.setValueAtTime(0.42, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.5);
    }

    playHit() {
      this.playSpinOut();
    }

    playBananaSlip() {
      this.playSpinOut();
    }

    playCoinPickup() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Classic bright Mario coin arpeggio: B5 (987Hz) -> E6 (1318Hz)
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.08);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.36);
    }

    playCoin() {
      this.playCoinPickup();
    }

    playMushroom() {
      this.playBoost();
    }

    playBlueShellExplosion() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.22));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.exponentialRampToValueAtTime(90, t + 0.65);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(t);
        noise.stop(t + 0.75);
      } catch (e) {}
    }

    // =========================================================================
    // 6. FANFARES (Lap fanfare & Victory fanfare)
    // =========================================================================
    playLapFanfare(isFinalLap = false) {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = isFinalLap
        ? [659.25, 659.25, 783.99, 1046.5, 1318.51] // High energetic final lap trumpet
        : [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.09);

        gain.gain.setValueAtTime(0.36, t + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + idx * 0.09);
        osc.stop(t + idx * 0.09 + 0.3);
      });
    }

    playVictoryFanfare() {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Majestic 6-note victory fanfare
      const melody = [
        { f: 523.25, d: 0.14 }, // C5
        { f: 659.25, d: 0.14 }, // E5
        { f: 783.99, d: 0.14 }, // G5
        { f: 1046.5, d: 0.28 }, // C6
        { f: 880.0,  d: 0.14 }, // A5
        { f: 1046.5, d: 0.65 }  // C6 hold
      ];

      let offset = 0;
      melody.forEach(note => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t + offset);

        gain.gain.setValueAtTime(0.42, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + note.d * 1.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + offset);
        osc.stop(t + offset + note.d * 1.25);
        offset += note.d;
      });
    }

    // =========================================================================
    // 7. LIGHT, BOUNCY SYNTHWAVE / CHIPTUNE BACKGROUND TRACK
    // =========================================================================
    startMusic() {
      if (this.isMusicPlaying) return;
      this.init();
      this.resume();
      this.isMusicPlaying = true;

      // Japanese Kart / City Pop Chords: F -> G -> Em -> Am
      const chords = [
        { root: 174.61, notes: [174.61, 220.0, 261.63, 329.63] }, // Fmaj7
        { root: 196.0,  notes: [196.0, 246.94, 293.66, 349.23] }, // G7
        { root: 164.81, notes: [164.81, 196.0, 246.94, 293.66] }, // Em7
        { root: 220.0,  notes: [220.0, 261.63, 329.63, 392.0]  }  // Am7
      ];

      const stepTimeMs = (60 / this.tempo / 4) * 1000; // 16th note timing
      this.musicStep = 0;

      this.musicInterval = setInterval(() => {
        if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;

        const chordIdx = Math.floor((this.musicStep % 64) / 16);
        const beatInMeasure = this.musicStep % 16;
        const currentChord = chords[chordIdx];
        const t = this.ctx.currentTime;

        // Bass drum kick on beats 0, 8 (or four-on-the-floor: 0, 4, 8, 12)
        if (beatInMeasure === 0 || beatInMeasure === 8) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
          kickGain.gain.setValueAtTime(0.28, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          kickOsc.connect(kickGain);
          kickGain.connect(this.musicGain);
          kickOsc.start(t);
          kickOsc.stop(t + 0.13);
        }

        // Snare on beats 4, 12
        if (beatInMeasure === 4 || beatInMeasure === 12) {
          const snareOsc = this.ctx.createOscillator();
          const snareGain = this.ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(220, t);
          snareGain.gain.setValueAtTime(0.12, t);
          snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
          snareOsc.connect(snareGain);
          snareGain.connect(this.musicGain);
          snareOsc.start(t);
          snareOsc.stop(t + 0.1);
        }

        // Bouncy hi-hat on every 8th note
        if (beatInMeasure % 2 === 1) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(3600 + (beatInMeasure % 4) * 200, t);
          hatGain.gain.setValueAtTime(0.035, t);
          hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
          hatOsc.connect(hatGain);
          hatGain.connect(this.musicGain);
          hatOsc.start(t);
          hatOsc.stop(t + 0.04);
        }

        // Funk/Synth Bassline (warm lowpass sawtooth)
        if (beatInMeasure % 2 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFilter = this.ctx.createBiquadFilter();

          bassOsc.type = 'sawtooth';
          const freq = (beatInMeasure === 2 || beatInMeasure === 10)
            ? currentChord.root * 1.5
            : currentChord.root;

          bassOsc.frequency.setValueAtTime(freq / 2, t);
          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(360, t);

          bassGain.gain.setValueAtTime(0.16, t);
          bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.musicGain);

          bassOsc.start(t);
          bassOsc.stop(t + 0.15);
        }

        // Sparkling synth bell arpeggio (light and joyful)
        if (beatInMeasure % 4 === 1 || beatInMeasure % 4 === 3) {
          const noteIdx = (beatInMeasure + Math.floor(this.musicStep / 4)) % currentChord.notes.length;
          const arpOsc = this.ctx.createOscillator();
          const arpGain = this.ctx.createGain();

          arpOsc.type = 'sine';
          arpOsc.frequency.setValueAtTime(currentChord.notes[noteIdx] * 2, t);

          arpGain.gain.setValueAtTime(0.07, t);
          arpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

          arpOsc.connect(arpGain);
          arpGain.connect(this.musicGain);

          arpOsc.start(t);
          arpOsc.stop(t + 0.18);
        }

        this.musicStep++;
      }, stepTimeMs);
    }

    stopMusic() {
      this.isMusicPlaying = false;
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    }
  }

  // Create singleton instance
  const audioInstance = new CarterAudioEngine();

  // Expose both as CarterAudio and SoundEngine
  window.CarterAudio = audioInstance;
  window.SoundEngine = audioInstance;

})(window);
