import { useEffect, useRef } from 'preact/hooks';
import type { LevelDef, GameElementDef } from '@/types';

interface GameAreaProps {
  level: LevelDef;
  onElementsReady: (elements: HTMLElement[]) => void;
}

export function GameArea({ level, onElementsReady }: GameAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Collect all game elements after render
    const elements = Array.from(
      containerRef.current.querySelectorAll('.game-element')
    ) as HTMLElement[];

    onElementsReady(elements);
  }, [level.id, onElementsReady]);

  const gridStyle = level.gridColumns
    ? { gridTemplateColumns: `repeat(${level.gridColumns}, 1fr)` }
    : undefined;

  return (
    <main class="game-container">
      <div
        ref={containerRef}
        class={`game-area layout-${level.layout}`}
        style={gridStyle}
        role="application"
        aria-label="VoiceOver training game area"
      >
        {level.elements.map((element) => (
          <GameElement key={element.id} element={element} />
        ))}
      </div>
    </main>
  );
}

interface GameElementProps {
  element: GameElementDef;
}

function GameElement({ element }: GameElementProps) {
  if (element.type === 'table' && element.rows) {
    return <TableElement element={element} />;
  }

  if (element.type === 'group' && element.children) {
    return (
      <div
        class={`game-element ${element.isStart ? 'start' : ''} ${element.isGoal ? 'goal' : ''}`}
        data-id={element.id}
        data-type={element.type}
        data-label={element.label}
      >
        <span class="group-label">{element.label}</span>
        {element.children.map((child) => (
          <GameElement key={child.id} element={child} />
        ))}
      </div>
    );
  }

  return (
    <div
      class={`game-element ${element.isStart ? 'start' : ''} ${element.isGoal ? 'goal' : ''}`}
      data-id={element.id}
      data-type={element.type}
      data-label={element.label}
    >
      {element.label}
    </div>
  );
}

function TableElement({ element }: { element: GameElementDef }) {
  if (!element.rows) return null;

  return (
    <div
      class={`game-element ${element.isStart ? 'start' : ''}`}
      data-id={element.id}
      data-type={element.type}
      data-label={element.label}
    >
      <table class="game-table">
        <tbody>
          {element.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const CellTag = rowIndex === 0 ? 'th' : 'td';
                const isGoal =
                  element.goalCell &&
                  element.goalCell[0] === rowIndex &&
                  element.goalCell[1] === colIndex;

                return (
                  <CellTag
                    key={colIndex}
                    class={`game-element table-cell ${isGoal ? 'goal' : ''}`}
                    data-id={`${element.id}-${rowIndex}-${colIndex}`}
                    data-type="cell"
                    data-label={cell}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {cell}
                  </CellTag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
