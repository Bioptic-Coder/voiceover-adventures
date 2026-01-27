import type { ElementsListState } from '@/types';

interface ElementsListProps {
  state: ElementsListState;
}

export function ElementsList({ state }: ElementsListProps) {
  if (!state.open) return null;

  return (
    <div class="elements-list-overlay">
      <div class="elements-list-container">
        <div class="elements-list-header">
          <h3 class="elements-list-title">Elements List</h3>
        </div>

        <div class="elements-list-tabs">
          <button
            class={`elements-list-tab ${state.category === 'Headings' ? 'active' : ''}`}
            aria-selected={state.category === 'Headings'}
          >
            Headings
          </button>
          <button
            class={`elements-list-tab ${state.category === 'Links' ? 'active' : ''}`}
            aria-selected={state.category === 'Links'}
          >
            Links
          </button>
          <button
            class={`elements-list-tab ${state.category === 'Form Controls' ? 'active' : ''}`}
            aria-selected={state.category === 'Form Controls'}
          >
            Form Controls
          </button>
          <button
            class={`elements-list-tab ${state.category === 'Tables' ? 'active' : ''}`}
            aria-selected={state.category === 'Tables'}
          >
            Tables
          </button>
          <button
            class={`elements-list-tab ${state.category === 'Lists' ? 'active' : ''}`}
            aria-selected={state.category === 'Lists'}
          >
            Lists
          </button>
        </div>

        <ul class="elements-list-items">
          {(!state.items || state.items.length === 0) ? (
            <li class="elements-list-item empty">
              <span class="elements-list-item-label">No {state.category?.toLowerCase() || 'items'} found</span>
            </li>
          ) : (
            state.items.map((item, index) => (
              <li
                key={index}
                class={`elements-list-item ${index === state.selectedIndex ? 'selected' : ''}`}
              >
                <span class="elements-list-item-label">{item.label}</span>
                <span class="elements-list-item-type">{item.type}</span>
              </li>
            ))
          )}
        </ul>

        <div class="elements-list-footer">
          <span>Tab: Categories</span>
          <span>{'\u2191\u2193'}: Navigate</span>
          <span>Enter: Activate</span>
          <span>Esc: Close</span>
        </div>
      </div>
    </div>
  );
}
