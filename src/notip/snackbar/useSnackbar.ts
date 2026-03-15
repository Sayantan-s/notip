import { useMemo, useSyncExternalStore } from "react";
import { snackbarStore } from "./store";
import type { Placement, SnackbarConfig, SnackbarItem } from "./types";

export const useSnackbarStore = (limit?: number) => {
  return useSyncExternalStore(
    snackbarStore.subscribe({ limit: limit || 3 }),
    snackbarStore.getSnapshot,
  );
};

export const useSnackbar = () => {
  const show = (config: SnackbarConfig) => {
    return snackbarStore.show(config);
  };

  const dismiss = (id: string) => {
    snackbarStore.dismiss(id);
  };

  return { show, dismiss };
};

export interface SnackbarGroup {
  placement: Placement;
  items: SnackbarItem[];
}

export const useSnackbarGroups = (
  limit?: number,
): { groups: SnackbarGroup[]; dismiss: (id: string) => void } => {
  const { snackbars } = useSnackbarStore(limit);

  const groups = useMemo(() => {
    const grouped = new Map<Placement, SnackbarItem[]>();
    for (const snackbar of snackbars) {
      const p = snackbar.placement || "bottom-right";
      let list = grouped.get(p);
      if (!list) {
        list = [];
        grouped.set(p, list);
      }
      list.push(snackbar);
    }
    return Array.from(grouped.entries()).map(([placement, items]) => ({
      placement,
      items,
    }));
  }, [snackbars]);

  return { groups, dismiss: snackbarStore.dismiss };
};
