interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  return (
    <div class="announcement-bar" aria-live="polite">
      <span class="announcement-icon">📢</span>
      <span class="announcement-text">"{text}"</span>
    </div>
  );
}
