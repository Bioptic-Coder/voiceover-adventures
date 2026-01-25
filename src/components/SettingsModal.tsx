import { useState, useEffect } from 'preact/hooks';
import { Modal } from './Modal';
import * as storage from '@/lib/storage';
import * as speech from '@/lib/speech';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState(storage.getSettings());

  useEffect(() => {
    document.body.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  const handleSpeechEnabledChange = (e: Event) => {
    const enabled = (e.target as HTMLInputElement).checked;
    speech.setEnabled(enabled);
    setSettings((s) => ({ ...s, speechEnabled: enabled }));
  };

  const handleSpeechRateChange = (e: Event) => {
    const rate = parseFloat((e.target as HTMLInputElement).value);
    speech.setRate(rate);
    setSettings((s) => ({ ...s, speechRate: rate }));
  };

  const handleHighContrastChange = (e: Event) => {
    const highContrast = (e.target as HTMLInputElement).checked;
    storage.saveSettings({ highContrast });
    setSettings((s) => ({ ...s, highContrast }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      storage.reset();
      location.reload();
    }
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div class="setting-group">
        <label for="speech-enabled">Enable Speech</label>
        <input
          type="checkbox"
          id="speech-enabled"
          checked={settings.speechEnabled}
          onChange={handleSpeechEnabledChange}
        />
      </div>

      <div class="setting-group">
        <label for="speech-rate">Speech Rate</label>
        <input
          type="range"
          id="speech-rate"
          min="0.5"
          max="2"
          step="0.1"
          value={settings.speechRate}
          onInput={handleSpeechRateChange}
        />
        <span>{settings.speechRate.toFixed(1)}</span>
      </div>

      <div class="setting-group">
        <label for="high-contrast">High Contrast Mode</label>
        <input
          type="checkbox"
          id="high-contrast"
          checked={settings.highContrast}
          onChange={handleHighContrastChange}
        />
      </div>

      <div class="setting-group">
        <button class="btn btn-danger" onClick={handleReset}>
          Reset All Progress
        </button>
      </div>
    </Modal>
  );
}
