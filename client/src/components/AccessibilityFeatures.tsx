import React, { useState, useEffect } from 'react';
import { Eye, Volume2, Type, MousePointer } from 'lucide-react';

/**
 * Accessibility Hook: Provides keyboard navigation shortcuts
 * - Space/Enter to activate buttons
 * - Tab/Shift+Tab to navigate
 * - Escape to close modals
 */
export function useKeyboardNavigation(onEscape?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
      // Additional keyboard shortcuts can be added here
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);
}

/**
 * Accessibility Hook: Focus management for modals and sheets
 */
export function useFocusTrap(ref: React.RefObject<HTMLDivElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, ref]);
}

/**
 * Accessibility Control Panel for users
 * Provides options for: text size, high contrast, text-to-speech, etc.
 */
export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [dyslexiaMode, setDyslexiaMode] = useState(false);

  useEffect(() => {
    // Apply text size to document
    const sizes = {
      small: '0.875rem',
      normal: '1rem',
      large: '1.125rem',
      xlarge: '1.25rem',
    };

    document.documentElement.style.fontSize = sizes[textSize as keyof typeof sizes];

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply dyslexia mode
    if (dyslexiaMode) {
      document.documentElement.classList.add('dyslexia-mode');
    } else {
      document.documentElement.classList.remove('dyslexia-mode');
    }
  }, [textSize, highContrast, dyslexiaMode]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
        aria-label="Accessibility options"
        title="Accessibility"
      >
        <Eye className="w-6 h-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 fade-in-up"
          role="region"
          aria-label="Accessibility settings"
        >
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Accessibility</h3>

          {/* Text Size */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Size
            </label>
            <div className="space-y-2">
              {['small', 'normal', 'large', 'xlarge'].map((size) => (
                <label key={size} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="text-size"
                    value={size}
                    checked={textSize === size}
                    onChange={(e) => setTextSize(e.target.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm capitalize text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="mb-5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              High Contrast
            </label>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={highContrast}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dyslexia Mode */}
          <div className="mb-5 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Dyslexia Mode</label>
            <button
              onClick={() => setDyslexiaMode(!dyslexiaMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                dyslexiaMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={dyslexiaMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  dyslexiaMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Text to Speech */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Text to Speech
            </label>
            <button
              onClick={() => setTextToSpeech(!textToSpeech)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                textToSpeech ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={textToSpeech}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  textToSpeech ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Accessible Button Component with proper ARIA labels
 */
export function A11yButton({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaPressed,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Accessible Input Component with labels and error messages
 */
export function A11yInput({
  id,
  label,
  error,
  required,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={id}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {error && (
        <p id={`${id}-error`} className="text-red-600 text-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Screen Reader Only Text
 * Visible only to screen readers, useful for additional context
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only" role="doc-subtitle">
      {children}
    </span>
  );
}

/**
 * Skip to Main Content Link
 * Appears on focus, allows keyboard users to skip navigation
 */
export function SkipToMainContent({ target = '#main-content' }: { target?: string }) {
  return (
    <a
      href={target}
      className="absolute -top-12 left-0 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg focus:top-0 transition-all focus:outline-none focus:ring-2 focus:ring-white"
    >
      Skip to main content
    </a>
  );
}

/**
 * Live Region for dynamic content updates
 * Announces changes to screen readers
 */
export function LiveRegion({ message, politeness = 'polite' }: { message: string; politeness?: 'polite' | 'assertive' }) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}

/**
 * Accessible Modal Dialog
 */
export function A11yModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useFocusTrap(ref, isOpen);
  useKeyboardNavigation(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        role="presentation"
      ></div>

      {/* Dialog */}
      <div
        ref={ref}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        className="relative bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 slide-in-up"
      >
        <h2 id="modal-title" className="text-2xl font-bold mb-4">
          {title}
        </h2>
        <div className="mb-6">{children}</div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
