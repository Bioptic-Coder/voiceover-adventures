import * as storage from './storage';

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let masterVolume = 1.0;

export function init(): void {
  const settings = storage.getSettings();
  // Assume speechEnabled controls overall sound, or add soundEnabled to settings if desired.
  // Using volume from settings
  masterVolume = settings.volume ?? 1.0;
  
  // We don't initialize AudioContext immediately because browsers require a user interaction
  // We'll initialize it lazily on the first sound play.
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setVolume(v: number): void {
  masterVolume = v;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1, sweep = 0) {
  if (!soundEnabled || masterVolume <= 0) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    
    // Frequency sweep if specified
    osc.frequency.setValueAtTime(freq, now);
    if (sweep !== 0) {
      osc.frequency.exponentialRampToValueAtTime(freq * sweep, now + duration);
    }

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol * masterVolume, now + duration * 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Failed to play tone', e);
  }
}

export function playMove(): void {
  // Short subtle tick
  playTone(800, 'sine', 0.05, 0.05);
}

export function playBoundary(): void {
  // Dull bonk
  playTone(150, 'square', 0.15, 0.08, 0.5);
}

export function playInteractIn(): void {
  // Descending thunk
  playTone(400, 'triangle', 0.15, 0.1, 0.5);
}

export function playInteractOut(): void {
  // Ascending thunk
  playTone(200, 'triangle', 0.15, 0.1, 2.0);
}

export function playActivate(): void {
  // Sharp pop
  playTone(1200, 'square', 0.08, 0.06);
}

export function playSuccess(): void {
  if (!soundEnabled || masterVolume <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const playNote = (freq: number, timeOffset: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0, now + timeOffset);
      gainNode.gain.linearRampToValueAtTime(0.1 * masterVolume, now + timeOffset + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.4);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.4);
    };

    // Major arpeggio
    playNote(440.00, 0);      // A4
    playNote(554.37, 0.1);    // C#5
    playNote(659.25, 0.2);    // E5
    playNote(880.00, 0.3);    // A5
  } catch (e) {
    console.warn('Failed to play success sound', e);
  }
}
