interface QuickNavIndicatorProps {
  enabled: boolean;
}

export function QuickNavIndicator({ enabled }: QuickNavIndicatorProps) {
  return (
    <div class={`quick-nav-indicator ${enabled ? 'active' : ''}`}>
      Quick Nav
    </div>
  );
}
