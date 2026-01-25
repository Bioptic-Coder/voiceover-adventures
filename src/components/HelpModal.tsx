import { Modal } from './Modal';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <Modal title="How to Play" onClose={onClose} large>
      <section>
        <h3>Welcome to VoiceOver Adventures!</h3>
        <p>
          Learn macOS VoiceOver keyboard shortcuts through interactive challenges.
          This game simulates VoiceOver behavior without requiring it to be enabled.
        </p>
      </section>

      <section>
        <h3>The VoiceOver Modifier (VO)</h3>
        <p>
          In this game, <strong>VO</strong> means pressing <kbd>Control</kbd> +{' '}
          <kbd>Option</kbd> together. Most VoiceOver commands start with this modifier.
        </p>
        <p>
          For example: <kbd>VO + →</kbd> means press Control + Option + Right Arrow
        </p>
      </section>

      <section>
        <h3>Game Mechanics</h3>
        <ul>
          <li>
            The <span class="vo-cursor-demo"></span> outline shows your current
            VoiceOver cursor position
          </li>
          <li>Use VoiceOver commands to navigate between elements</li>
          <li>Complete objectives to advance to the next level</li>
          <li>Earn stars based on your efficiency</li>
        </ul>
      </section>

      <section>
        <h3>Tips</h3>
        <ul>
          <li>Listen to (or read) the announcements to understand what's focused</li>
          <li>Use the commands shown at the bottom of the screen</li>
          <li>Practice makes perfect!</li>
        </ul>
      </section>
    </Modal>
  );
}
