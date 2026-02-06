import type { SnackbarConfig, DialogConfig, SnackbarItem, DialogItem, SnackbarState, DialogState } from './types';

// Singleton Guard
class NotipGuard {
  private mountCount = 0;

  mount = () => {
    this.mountCount++;
    if (this.mountCount > 1) {
      throw new Error('[Notip] Multiple NotipProviders detected. Notip should be a singleton in your app root.');
    }
  };

  unmount = () => {
    this.mountCount--;
  };
}

export const notipGuard = new NotipGuard();

// Snackbar Store
class SnackbarStore {
  private state: SnackbarState = {
    snackbars: [],
  };
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  addSnackbar = (config: SnackbarConfig): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: SnackbarItem = {
      ...config,
      id,
      createdAt: Date.now(),
      placement: config.placement || 'bottom-right',
      time: config.time ?? 3000,
      variant: config.variant || 'default',
    };

    this.state = {
      snackbars: [...this.state.snackbars, newItem],
    };
    this.emitChange();

    if (newItem.time > 0) {
      setTimeout(() => {
        this.removeSnackbar(id);
      }, newItem.time);
    }

    return id;
  };

  removeSnackbar = (id: string) => {
    this.state = {
      snackbars: this.state.snackbars.filter((s) => s.id !== id),
    };
    this.emitChange();
  };

  private emitChange() {
    this.listeners.forEach((l) => l());
  }
}

export const snackbarStore = new SnackbarStore();

// Dialog Store
class DialogStore {
  private state: DialogState = {
    dialog: null,
  };
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  showDialog = (config: DialogConfig) => {
    const id = Math.random().toString(36).substring(2, 9);
    this.state = {
      dialog: { ...config, id },
    };
    this.emitChange();
  };

  dismissDialog = () => {
    this.state = {
      dialog: null,
    };
    this.emitChange();
  };

  private emitChange() {
    this.listeners.forEach((l) => l());
  }
}

export const dialogStore = new DialogStore();
