import type { SnackbarConfig, SnackbarItem, SnackbarState } from "./types";

interface Node {
  item: SnackbarItem;
  next: Node | null;
  prev: Node | null;
}

interface ISubscriptionConfig {
  limit?: number;
}

class SnackbarStore {
  private state: SnackbarState = {
    snackbars: [],
  };

  // Internal data structures for O(1) access and stable ordering
  private nodes = new Map<string, Node>();
  private head: Node | null = null;
  private tail: Node | null = null;
  private limit = 3;

  private listeners = new Set<() => void>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  subscribe = (config: ISubscriptionConfig) => (listener: () => void) => {
    const newLimit = config?.limit || 3;
    if (this.limit !== newLimit) {
      this.limit = newLimit;
      this.updateVisibleState();
    }
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

    // Create Node and Prepend to Head (Newest First)
    const node: Node = { item: newItem, next: null, prev: null };

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.nodes.set(id, node);

    // Register dismiss timer
    const timer = setTimeout(() => {
      this.dismiss(id);
    }, newItem.time);
    this.timers.set(id, timer);

    this.updateVisibleState();
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

    const node = this.nodes.get(id);
    if (!node) return;

    // Unlink from List
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.nodes.delete(id);

    this.updateVisibleState();
    this.emitChange();
  };

  private updateVisibleState() {
    // Traverse top 'limit' items to form visible set
    const visible: SnackbarItem[] = [];
    let current = this.head;
    let count = 0;

    while (current && count < this.limit) {
      visible.push(current.item);
      current = current.next;
      count++;
    }

    this.state = {
      snackbars: visible,
    };
  }

  private emitChange() {
    this.listeners.forEach((l) => l());
  }
}

export const snackbarStore = new SnackbarStore();
