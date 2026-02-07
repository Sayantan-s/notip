import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDialogStore } from "./useDialog";
import { dialogStore } from "./store";
import "./dialog.css";
import { trackMountCountToBlock } from "../utils/mountDetector";

const useTrackMountCount = trackMountCountToBlock();

export const NotipDialog = () => {
  const { dialog } = useDialogStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  useTrackMountCount();

  useEffect(() => {
    if (dialog && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [dialog]);

  if (!dialog) return null;

  const confirmBtnClass = `notip-btn notip-btn-confirm notip-btn-confirm-${dialog.variant || "info"}`;

  return createPortal(
    <div className="notip-dialog-overlay">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="notip-dialog"
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === "Escape") dialogStore.dismissDialog();
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
            {dialog.cancelText || "Cancel"}
          </button>
          <button
            onClick={() => {
              dialog.onConfirm?.();
              dialogStore.dismissDialog();
            }}
            className={confirmBtnClass}
          >
            {dialog.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
