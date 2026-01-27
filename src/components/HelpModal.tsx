import { Modal } from './Modal';
import { getAdapterByType } from '@/lib/screenreaders';
import type { ScreenReaderType } from '@/types';

interface HelpModalProps {
  onClose: () => void;
  screenReader?: ScreenReaderType;
}

export function HelpModal({ onClose, screenReader = 'voiceover' }: HelpModalProps) {
  const adapter = getAdapterByType(screenReader);
  const isVoiceOver = screenReader === 'voiceover';

  return (
    <Modal title="How to Play" onClose={onClose} large>
      <section>
        <h3>Welcome to Screen Reader Adventures!</h3>
        <p>
          Learn {adapter.name} keyboard shortcuts through interactive challenges.
          This game simulates {adapter.name} behavior without requiring it to be enabled.
        </p>
        <p class="help-platform">
          Currently using: <strong>{adapter.name}</strong> ({adapter.platform})
        </p>
      </section>

      <section>
        <h3>The {adapter.modifierName} Modifier</h3>
        {isVoiceOver ? (
          <>
            <p>
              In this game, <strong>VO</strong> means pressing <kbd>Control</kbd> +{' '}
              <kbd>Option</kbd> together. Most VoiceOver commands start with this modifier.
            </p>
            <p>
              For example: <kbd>VO + {'\u2192'}</kbd> means press Control + Option + Right Arrow
            </p>
          </>
        ) : (
          <>
            <p>
              In this game, <strong>{adapter.modifierName}</strong> means pressing{' '}
              <kbd>{adapter.modifierDisplay}</kbd>. In a browser, we use the backtick key (`) as
              an alternative since Insert can be difficult to capture.
            </p>
            <p>
              For example: <kbd>{adapter.modifierName} + {'\u2192'}</kbd> means press{' '}
              {adapter.modifierDisplay} + Right Arrow
            </p>
          </>
        )}
      </section>

      {isVoiceOver ? (
        <section>
          <h3>Quick Nav Mode</h3>
          <p>
            Quick Nav allows single-key navigation. Press <kbd>VO + Q</kbd> to toggle it.
          </p>
          <p>When Quick Nav is enabled:</p>
          <ul>
            <li><kbd>H</kbd> - Jump to next heading</li>
            <li><kbd>L</kbd> - Jump to next link</li>
            <li><kbd>F</kbd> - Jump to next form control</li>
            <li><kbd>{'\u2190'} {'\u2192'}</kbd> - Move between items</li>
          </ul>
        </section>
      ) : (
        <section>
          <h3>Browse Mode</h3>
          <p>
            Browse Mode allows single-key navigation (enabled by default). Press{' '}
            <kbd>{adapter.modifierName} + Space</kbd> to toggle between Browse Mode and Focus Mode.
          </p>
          <p>When Browse Mode is enabled:</p>
          <ul>
            <li><kbd>H</kbd> - Jump to next heading</li>
            <li><kbd>{screenReader === 'nvda' ? 'K' : 'L'}</kbd> - Jump to next link</li>
            <li><kbd>F</kbd> - Jump to next form control</li>
            <li><kbd>{'\u2191'} {'\u2193'}</kbd> - Move between items</li>
            <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Activate</li>
          </ul>
        </section>
      )}

      {isVoiceOver ? (
        <section>
          <h3>The Rotor</h3>
          <p>
            The Rotor (<kbd>VO + U</kbd>) lets you quickly navigate by element type.
          </p>
          <ul>
            <li><kbd>{'\u2190'} {'\u2192'}</kbd> - Change category (Headings, Links, etc.)</li>
            <li><kbd>{'\u2191'} {'\u2193'}</kbd> - Navigate items</li>
            <li><kbd>Enter</kbd> - Jump to selected item</li>
            <li><kbd>Escape</kbd> - Close rotor</li>
          </ul>
        </section>
      ) : (
        <section>
          <h3>Elements List</h3>
          <p>
            The Elements List (<kbd>{adapter.modifierName} + F7</kbd>) lets you quickly navigate
            by element type.
          </p>
          <ul>
            <li><kbd>Tab</kbd> - Change category (Headings, Links, etc.)</li>
            <li><kbd>{'\u2191'} {'\u2193'}</kbd> - Navigate items</li>
            <li><kbd>Enter</kbd> - Jump to selected item</li>
            <li><kbd>Escape</kbd> - Close list</li>
          </ul>
        </section>
      )}

      <section>
        <h3>Game Mechanics</h3>
        <ul>
          <li>
            The <span class="vo-cursor-demo"></span> outline shows your current
            cursor position
          </li>
          <li>Use {adapter.name} commands to navigate between elements</li>
          <li>Complete objectives to advance to the next level</li>
          <li>Earn stars based on your efficiency</li>
        </ul>
      </section>

      <section>
        <h3>Tips</h3>
        <ul>
          <li>Listen to (or read) the announcements to understand what's focused</li>
          <li>Use the commands shown at the bottom of the screen</li>
          <li>You can change screen reader mode in Settings</li>
          <li>Practice makes perfect!</li>
        </ul>
      </section>
    </Modal>
  );
}
