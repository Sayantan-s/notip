import type { SnackbarConfig, SnackbarItem, SnackbarState } from "./types";

class SnackbarStore {
  private state: SnackbarState = {
    snackbars: [],
    previousSnackbarQueue: [],
  };
  private listeners = new Set<() => void>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  show = (config: SnackbarConfig): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: SnackbarItem = {
      ...config,
      id,
      createdAt: Date.now(),
      placement: config.placement || "bottom-right",
      time: config.time ?? 3000,
      variant: config.variant || "default",
    };

    const allSnackbars = [newItem, ...this.state.snackbars, ...this.state.previousSnackbarQueue];

    this.state = {
      snackbars: allSnackbars.slice(0, 3),
      previousSnackbarQueue: allSnackbars.slice(3),
    };

    // Register dismiss timer
    const timer = setTimeout(() => {
      this.dismiss(id);
    }, newItem.time);
    this.timers.set(id, timer);

    this.emitChange();
    return id;
  };

  dismiss = (id: string) => {
    // Clear timer if it exists
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const allSnackbars = [...this.state.snackbars, ...this.state.previousSnackbarQueue].filter(
      (s) => s.id !== id,
    );

    this.state = {
      snackbars: allSnackbars.slice(0, 3),
      previousSnackbarQueue: allSnackbars.slice(3),
    };
    this.emitChange();
  };

  private emitChange() {
    this.listeners.forEach((l) => l());
  }
}

export const snackbarStore = new SnackbarStore();
