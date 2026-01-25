import type { SpeakOptions, ElementType } from '@/types';
import * as storage from './storage';

let synth: SpeechSynthesis | null = null;
let voice: SpeechSynthesisVoice | null = null;
let enabled = true;
let rate = 1.0;
let volume = 1.0;
let onAnnounce: ((text: string) => void) | null = null;

const TYPE_ANNOUNCEMENTS: Record<string, string> = {
  button: 'button',
  link: 'link',
  heading: 'heading',
  h1: 'heading level 1',
  h2: 'heading level 2',
  h3: 'heading level 3',
  text: 'text',
  input: 'text field',
  checkbox: 'checkbox',
  group: 'group',
  table: 'table',
  list: 'list',
  listitem: 'list item',
  cell: '',
  image: 'image',
  menu: 'menu',
};

const ACTION_ANNOUNCEMENTS: Record<string, string> = {
  interact: 'In interaction mode',
  stopInteract: 'Out of interaction mode',
  activate: 'Activated',
  toggle: 'Toggled',
  'rotor-open': 'Rotor',
  'rotor-close': 'Rotor closed',
  'quicknav-on': 'Quick Nav On',
  'quicknav-off': 'Quick Nav Off',
  boundary: 'Edge of content',
  'no-item': 'No next item',
  'level-complete': 'Level complete!',
};

function loadVoices(): void {
  if (!synth) return;

  const voices = synth.getVoices();
  voice =
    voices.find((v) => v.name === 'Samantha') ||
    voices.find((v) => v.name.includes('English') && v.name.includes('United States')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0] ||
    null;
}

export function init(announceCallback?: (text: string) => void): void {
  onAnnounce = announceCallback || null;

  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  } else {
    console.warn('Speech synthesis not supported');
  }

  const settings = storage.getSettings();
  enabled = settings.speechEnabled;
  rate = settings.speechRate;
  volume = settings.volume;
}

export function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  // Always trigger visual announcement
  onAnnounce?.(text);

  if (!enabled || !synth) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (options.interrupt) {
      synth!.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = options.rate ?? rate;
    utterance.volume = options.volume ?? volume;
    utterance.pitch = options.pitch ?? 1;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    synth!.speak(utterance);
  });
}

export function cancel(): void {
  synth?.cancel();
}

function getElementType(element: HTMLElement): string {
  const type = element.getAttribute('data-type') as ElementType | null;
  return type ? TYPE_ANNOUNCEMENTS[type] || '' : '';
}

function getElementState(element: HTMLElement): string {
  const states: string[] = [];

  if (element.classList.contains('checked')) states.push('checked');
  if (element.classList.contains('selected')) states.push('selected');
  if (element.classList.contains('expanded')) states.push('expanded');
  else if (element.getAttribute('aria-expanded') === 'true') states.push('expanded');
  else if (element.getAttribute('aria-expanded') === 'false') states.push('collapsed');
  if (element.classList.contains('disabled') || element.hasAttribute('disabled')) {
    states.push('dimmed');
  }

  return states.join(', ');
}

function getPositionInfo(element: HTMLElement): string {
  const parent = element.parentElement;
  if (!parent) return '';

  const siblings = Array.from(parent.querySelectorAll(':scope > .game-element'));
  const index = siblings.indexOf(element);

  if (index >= 0 && siblings.length > 1) {
    return `${index + 1} of ${siblings.length}`;
  }

  return '';
}

export function announceElement(element: HTMLElement | null): string {
  if (!element) return '';

  const parts: string[] = [];

  const label =
    element.getAttribute('aria-label') ||
    element.getAttribute('data-label') ||
    element.textContent?.trim() ||
    '';

  if (label) parts.push(label);

  const type = getElementType(element);
  if (type) parts.push(type);

  const state = getElementState(element);
  if (state) parts.push(state);

  const position = getPositionInfo(element);
  if (position) parts.push(position);

  const announcement = parts.join(', ');
  speak(announcement, { interrupt: true });

  return announcement;
}

export function announceAction(action: string): void {
  const text = ACTION_ANNOUNCEMENTS[action] || action;
  speak(text, { interrupt: true });
}

export function announceReading(elements: HTMLElement[]): void {
  const texts = elements.map((el) => {
    const label = el.getAttribute('data-label') || el.textContent?.trim() || '';
    const type = getElementType(el);
    return `${label}${type ? ', ' + type : ''}`;
  });

  speak(texts.join('. '), { interrupt: true });
}

export function setEnabled(value: boolean): void {
  enabled = value;
  storage.saveSettings({ speechEnabled: value });
}

export function setRate(value: number): void {
  rate = value;
  storage.saveSettings({ speechRate: value });
}

export function setVolume(value: number): void {
  volume = value;
  storage.saveSettings({ volume: value });
}

export function isEnabled(): boolean {
  return enabled;
}

export function getRate(): number {
  return rate;
}
