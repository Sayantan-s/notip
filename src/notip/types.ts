export type Placement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export type Variant = "default" | "success" | "error" | "warning" | "info";

export interface SnackbarConfig {
  title?: string;
  description?: string;
  variant?: Variant;
  placement?: Placement;
  time?: number; // duration in ms, defaults to 3000
}

export interface SnackbarItem extends SnackbarConfig {
  id: string;
  createdAt: number;
  time: number;
}

export interface DialogConfig {
  title?: string;
  description?: string;
  variant?: Variant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface DialogItem extends DialogConfig {
  id: string;
}

export interface SnackbarState {
  snackbars: SnackbarItem[];
}

export interface DialogState {
  dialog: DialogItem | null;
}
