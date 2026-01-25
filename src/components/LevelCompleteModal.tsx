import { Modal } from './Modal';
import type { LevelCompleteData } from '@/types';
import { formatTime } from '@/hooks/useGame';

interface LevelCompleteModalProps {
  data: LevelCompleteData;
  hasNextLevel: boolean;
  onReplay: () => void;
  onNext: () => void;
  onClose: () => void;
}

const MESSAGES = [
  'Keep practicing!',
  'Good effort!',
  'Nice work!',
  'Great job!',
  'Excellent!',
  'Perfect!',
];

export function LevelCompleteModal({
  data,
  hasNextLevel,
  onReplay,
  onNext,
  onClose,
}: LevelCompleteModalProps) {
  const message = MESSAGES[Math.min(data.stars, 5)];

  return (
    <Modal title="Level Complete!" onClose={onClose}>
      <div class="completion-stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} class={`star ${i <= data.stars ? 'filled' : 'empty'}`}>
            {i <= data.stars ? '★' : '☆'}
          </span>
        ))}
      </div>

      <p class="completion-message">{message}</p>

      <div class="completion-stats">
        <div class="stat">
          <span class="stat-label">Moves</span>
          <span class="stat-value">{data.moves}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Time</span>
          <span class="stat-value">{formatTime(data.time)}</span>
        </div>
      </div>

      <div class="completion-actions">
        <button class="btn btn-secondary" onClick={onReplay}>
          Replay
        </button>
        {hasNextLevel && (
          <button class="btn btn-primary" onClick={onNext}>
            Next Level
          </button>
        )}
      </div>
    </Modal>
  );
}
