import type { DialogConfig, DialogState } from "./types";

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
