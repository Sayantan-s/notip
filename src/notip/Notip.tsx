import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSnackbarStore, useDialogStore } from './hooks';
import { snackbarStore, dialogStore, notipGuard } from './store';
import type { Placement, Variant } from './types';
import './notip.css';

// Icons
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Helper to get variant classes
const getVariantClass = (variant: Variant) => `notip-snackbar--${variant}`;

// Helper to get placement classes
const getPlacementClass = (placement: Placement) => `notip-snackbar-container--${placement}`;

// --- Components ---

const Snackbar = () => {
  const { snackbars } = useSnackbarStore();

  // Group snackbars by placement to render in correct containers
  const groupedSnackbars = snackbars.reduce((acc, snackbar) => {
    const p = snackbar.placement || 'bottom-right';
    if (!acc[p]) acc[p] = [];
    acc[p].push(snackbar);
    return acc;
  }, {} as Record<Placement, typeof snackbars>);

  return createPortal(
    <>
      {(Object.keys(groupedSnackbars) as Placement[]).map((placement) => (
        <div
          key={placement}
          className={`notip-snackbar-container ${getPlacementClass(placement)}`}
        >
          {groupedSnackbars[placement].map((snackbar) => (
            <div
              key={snackbar.id}
              className={`notip-snackbar ${getVariantClass(snackbar.variant || 'default')}`}
              role="alert"
            >
              <div className="notip-snackbar-content">
                <div className="notip-snackbar-text">
                  {snackbar.title && <h4 className="notip-snackbar-title">{snackbar.title}</h4>}
                  {snackbar.description && <p className="notip-snackbar-description">{snackbar.description}</p>}
                </div>
                <button
                  onClick={() => snackbarStore.removeSnackbar(snackbar.id)}
                  className="notip-close-btn"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>,
    document.body
  );
};

const Dialog = () => {
  const { dialog } = useDialogStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialog && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [dialog]);

  if (!dialog) return null;

  const confirmBtnClass = `notip-btn notip-btn-confirm notip-btn-confirm--${dialog.variant || 'info'}`;

  return createPortal(
    <div className="notip-dialog-overlay">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="notip-dialog"
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === 'Escape') dialogStore.dismissDialog();
        }}
      >
        <div className="notip-dialog-header">
           {dialog.title && <h3 className="notip-dialog-title">{dialog.title}</h3>}
           {dialog.description && <p className="notip-dialog-description">{dialog.description}</p>}
        </div>
        
        <div className="notip-dialog-actions">
          <button
            onClick={() => {
               dialog.onCancel?.();
               dialogStore.dismissDialog();
            }}
            className="notip-btn notip-btn-cancel"
          >
            {dialog.cancelText || 'Cancel'}
          </button>
          <button
            onClick={() => {
              dialog.onConfirm?.();
              dialogStore.dismissDialog();
            }}
            className={confirmBtnClass}
          >
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const NotipMain = ({ children }: { children?: React.ReactNode }) => {
  useEffect(() => {
    try {
        notipGuard.mount();
    } catch (e) {
        console.error(e);
        throw e;
    }
    return () => {
      notipGuard.unmount();
    };
  }, []);

  return <>{children}</>;
};

// Compound Component Composition
export const Notip = Object.assign(NotipMain, {
  Snackbar,
  Dialog,
});