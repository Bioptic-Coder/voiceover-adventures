interface HeaderProps {
  onSettingsClick: () => void;
  onHelpClick: () => void;
}

export function Header({ onSettingsClick, onHelpClick }: HeaderProps) {
  return (
    <header class="header">
      <h1 class="logo">VoiceOver Adventures</h1>
      <nav class="header-nav">
        <button
          class="header-btn"
          aria-label="Settings"
          onClick={onSettingsClick}
        >
          <span class="icon">⚙️</span>
        </button>
        <button
          class="header-btn"
          aria-label="Help"
          onClick={onHelpClick}
        >
          <span class="icon">?</span>
        </button>
      </nav>
    </header>
  );
}
