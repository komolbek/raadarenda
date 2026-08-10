'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Rendered in a sticky footer with a top border. */
  footer?: ReactNode;
  size?: ModalSize;
  /** Click on the dimmed backdrop closes the modal. Default: true. */
  closeOnBackdrop?: boolean;
  /** Hide the header (title + close button). */
  hideHeader?: boolean;
}

/**
 * Accessible, portalled modal used across the admin panel.
 * - Translucent, blurred backdrop (fixes the Tailwind v4 `bg-opacity-*` removal).
 * - Escape + backdrop click to close, body scroll lock, restores focus.
 * - Renders into <body> so it can never be clipped/covered by parent stacking.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'sm',
  closeOnBackdrop = true,
  hideHeader = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Keep the latest onClose in a ref so the open/close effect below can depend
  // ONLY on `open`. If `onClose` (usually a fresh inline arrow) were in the
  // deps, the effect would re-run on every parent re-render — i.e. every
  // keystroke — and re-focus the panel, stealing focus from the field being
  // typed into.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog once, when it opens (accessibility).
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center"
      style={{ animation: 'modal-backdrop-in 0.15s ease-out' }}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`my-auto flex max-h-[calc(100vh-2rem)] w-full ${SIZE[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 outline-none`}
        style={{ animation: 'modal-panel-in 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* Shared button styles for modal footers and actions. */
export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50',
};
