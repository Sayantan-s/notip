import type { ReactNode } from "react";

interface NotipSnackbarClassNames {
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

export interface NotipSnackbarProps {
  limit?: number;
  classNames?: NotipSnackbarClassNames;
  icons?: NotipSnackbarIcons;
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
}

export interface SnackbarItem extends SnackbarConfig {
  id: string;
  createdAt: number;
  time: number;
}

export interface SnackbarState {
  snackbars: SnackbarItem[];
}
