import type { ComponentChildren } from 'preact';

interface ModalProps {
  title: string;
  children: ComponentChildren;
  onClose: () => void;
  large?: boolean;
}

export function Modal({ title, children, onClose, large }: ModalProps) {
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div class="modal" onClick={handleBackdropClick}>
      <div class={`modal-content ${large ? 'modal-large' : ''}`}>
        <div class="modal-header">
          <h2>{title}</h2>
          <button class="modal-close" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div class="modal-body">{children}</div>
      </div>
    </div>
  );
}
