import { useSyncExternalStore } from "react";
import { snackbarStore } from "./store";
import type { SnackbarConfig } from "./types";

export const useSnackbarStore = () => {
  return useSyncExternalStore(snackbarStore.subscribe, snackbarStore.getSnapshot);
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
