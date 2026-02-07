export type DialogVariant = "default" | "success" | "error" | "warning" | "info";

export interface DialogConfig {
  title?: string;
  description?: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface DialogItem extends DialogConfig {
  id: string;
}

export interface DialogState {
  dialog: DialogItem | null;
}
