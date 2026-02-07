import { useSyncExternalStore } from "react";
import { dialogStore } from "./store";
import type { DialogConfig } from "./types";

export const useDialogStore = () => {
  return useSyncExternalStore(dialogStore.subscribe, dialogStore.getSnapshot);
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
