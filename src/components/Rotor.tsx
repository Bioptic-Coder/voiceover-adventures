import type { RotorState } from '@/types';

interface RotorProps {
  state: RotorState;
}

export function Rotor({ state }: RotorProps) {
  if (!state.open) return null;

  return (
    <div class="rotor-overlay">
      <div class="rotor-container">
        <div class="rotor-header">
          <button class="rotor-nav rotor-prev" aria-label="Previous category">
            ◀
          </button>
          <h3 class="rotor-category">{state.category}</h3>
          <button class="rotor-nav rotor-next" aria-label="Next category">
            ▶
          </button>
        </div>

        <ul class="rotor-items">
          {(!state.items || state.items.length === 0) ? (
            <li class="rotor-item">
              <span class="rotor-item-label">No items found</span>
            </li>
          ) : (
            state.items.map((item, index) => (
              <li
                key={index}
                class={`rotor-item ${index === state.selectedIndex ? 'selected' : ''}`}
              >
                <span class="rotor-item-label">{item.label}</span>
                <span class="rotor-item-type">{item.type}</span>
              </li>
            ))
          )}
        </ul>

        <div class="rotor-footer">
          <span>↑↓ Navigate</span>
          <span>←→ Categories</span>
          <span>Enter Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
