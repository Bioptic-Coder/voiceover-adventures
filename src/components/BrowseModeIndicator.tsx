interface BrowseModeIndicatorProps {
  enabled: boolean;
}

export function BrowseModeIndicator({ enabled }: BrowseModeIndicatorProps) {
  return (
    <div class={`browse-mode-indicator ${enabled ? 'active' : ''}`}>
      {enabled ? 'Browse Mode' : 'Focus Mode'}
    </div>
  );
}
