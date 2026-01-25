import type { LevelDef } from '@/types';

interface LevelBarProps {
  level: LevelDef;
  stars?: number;
}

export function LevelBar({ level, stars = 0 }: LevelBarProps) {
  return (
    <div class="level-bar">
      <div class="level-info">
        <span class="level-number">Level {level.id}</span>
        <span class="level-title">{level.title}</span>
      </div>
      <div class="level-stars" aria-label={`Rating: ${stars} of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} class={`star ${i <= stars ? 'filled' : 'empty'}`}>
            {i <= stars ? '★' : '☆'}
          </span>
        ))}
      </div>
    </div>
  );
}
