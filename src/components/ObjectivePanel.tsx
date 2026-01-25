import type { VOCommand } from '@/types';
import { getCommandInfo } from '@/lib/keyboard';

interface ObjectivePanelProps {
  objective: string;
  commands: VOCommand[];
}

export function ObjectivePanel({ objective, commands }: ObjectivePanelProps) {
  return (
    <div class="objective-panel">
      <div class="objective-section">
        <h2>Objective</h2>
        <p>{objective}</p>
      </div>
      <div class="commands-section">
        <h2>Commands for this level</h2>
        <ul class="commands-list">
          {commands.map((cmd) => {
            const info = getCommandInfo(cmd);
            return (
              <li key={cmd}>
                <kbd>{info.key}</kbd> {info.description}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
