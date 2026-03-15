import type { CSSProperties, ReactNode } from "react";

export interface SnackbarClassNames {
  toast?: string;
  title?: string;
  description?: string;
  actionButton?: string;
  cancelButton?: string;
  closeButton?: string;
}

interface NotipSnackbarIcons {
  success?: ReactNode;
  info?: ReactNode;
  warning?: ReactNode;
  error?: ReactNode;
  loading?: ReactNode;
}

export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

export interface SnackbarItemRenderProps {
  item: SnackbarItem;
  index: number;
  total: number;
  placement: Placement;
  dismiss: () => void;
  /** CSS class for variant colors (e.g. "notip-snackbar-success"). Apply to opt into library variant styles. */
  variantClassName: string;
  /** Inline styles for variant colors. Works without importing library CSS. Does not include dark mode. */
  variantStyle: CSSProperties;
}

export interface NotipSnackbarProps {
  limit?: number;
  classNames?: SnackbarClassNames;
  icons?: NotipSnackbarIcons;
  unstyled?: boolean;
  children?: (props: SnackbarItemRenderProps) => ReactNode;
}

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
  jsx?: (props: SnackbarItemRenderProps) => ReactNode;
  unstyled?: boolean;
  classNames?: SnackbarClassNames;
  icon?: ReactNode;
  action?: SnackbarAction;
  cancel?: SnackbarAction;
  dismissible?: boolean;
  onDismiss?: (item: SnackbarItem) => void;
  onAutoClose?: (item: SnackbarItem) => void;
}

export interface SnackbarItem extends SnackbarConfig {
  id: string;
  createdAt: number;
  time: number;
  dismissible: boolean;
}

export interface SnackbarState {
  snackbars: SnackbarItem[];
}

export const VARIANT_STYLES: Record<Variant, CSSProperties> = {
  default: {
    backgroundColor: "#fff",
    color: "#1f2937",
    borderColor: "#e5e7eb",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderColor: "#bbf7d0",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderColor: "#fecaca",
  },
  warning: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    borderColor: "#fde047",
  },
  info: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderColor: "#bfdbfe",
  },
};
