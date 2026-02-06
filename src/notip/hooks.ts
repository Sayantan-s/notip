import { useSyncExternalStore } from 'react';
import { snackbarStore, dialogStore } from './store';
import type { SnackbarConfig, DialogConfig } from './types';

export const useSnackbarStore = () => {
  return useSyncExternalStore(snackbarStore.subscribe, snackbarStore.getSnapshot);
};

export const useDialogStore = () => {
  return useSyncExternalStore(dialogStore.subscribe, dialogStore.getSnapshot);
};

export const useSnackbar = () => {
  const show = (config: SnackbarConfig) => {
    return snackbarStore.addSnackbar(config);
  };

  const dismiss = (id: string) => {
    snackbarStore.removeSnackbar(id);
  };

  return { show, dismiss };
};

export const useDialog = () => {
  const show = (config: DialogConfig) => {
    dialogStore.showDialog(config);
  };

  const dismiss = () => {
    dialogStore.dismissDialog();
  };

  return { show, dismiss };
};
