import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { t } from '../../i18n';
import './ModalShell.css';

/**
 * ModalShell - Reusable modal shell component
 * Handles backdrop, close button, focus trap, ESC key, and accessibility
 */
const ModalShell = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'large', // small, medium, large, full
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Modal açıldığında focus yönetimi
  useEffect(() => {
    if (!isOpen) return;

    // Önceki focus'u kaydet
    previousFocusRef.current = document.activeElement;

    const focusableSelectors = [
      'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
    ];
    const node = modalRef.current;
    if (!node) return;

    // İlk odaklanabilir elemana odaklan
    const focusables = node.querySelectorAll(focusableSelectors.join(','));
    if (focusables.length) focusables[0].focus();

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        // Tab navigation için focus trap
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Modal kapanırken önceki focus'a dön
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'modal-shell',
    `modal-shell--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      {...props}
    >
      <div
        ref={modalRef}
        className={modalClasses}
      >
        {(title || showCloseButton) && (
          <header className="modal-shell__header">
            {title && (
              <h2 id="modal-title" className="modal-shell__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="modal-shell__close-btn"
                onClick={onClose}
                aria-label={t('common.close')}
              >
                <svg className="modal-shell__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </header>
        )}

        <div className="modal-shell__content">
          {children}
        </div>
      </div>
    </div>
  );
};

ModalShell.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string
};

export default ModalShell;