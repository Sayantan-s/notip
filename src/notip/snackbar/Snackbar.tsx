import { createPortal } from "react-dom";
import { type FC, type ReactNode } from "react";
import { useSnackbarStore } from "./useSnackbar";
import { snackbarStore } from "./store";
import type { NotipSnackbarProps, Placement, SnackbarItem } from "./types";
import "./snackbar.css";
import { trackMountCountToBlock } from "../utils/mountDetector";
import { clsx } from "../utils/clsx";

import { CloseIcon } from "../icons/Close";
import { SuccessIcon } from "../icons/Success";
import { ErrorIcon } from "../icons/Error";
import { WarningIcon } from "../icons/Warning";
import { InfoIcon } from "../icons/Info";
import { LoadingIcon } from "../icons/Loading";

// Individual Snackbar Component handles its own timer
const SnackbarItemComponent = ({
  item,
  index,
  total,
  placement,
  classNames,
  icons,
}: {
  item: SnackbarItem;
  index: number;
  total: number;
  placement: Placement;
  classNames?: NotipSnackbarProps["classNames"];
  icons: Required<NonNullable<NotipSnackbarProps["icons"]>>;
}) => {
  let variantIcon = null;
  if (item.variant && item.variant !== "default") {
    variantIcon = icons[item.variant as keyof typeof icons];
  }

  return (
    <div
      className={clsx(
        `notip-snackbar notip-snackbar-${item.variant || "default"}`,
        classNames?.toast,
      )}
      role="alert"
      style={
        {
          "--index": index,
          "--total": total,
          zIndex: total - index,
        } as React.CSSProperties
      }
      data-placement={placement}
    >
      <div className="notip-snackbar-content">
        {variantIcon && <div className="notip-snackbar-icon">{variantIcon}</div>}
        <div className="notip-snackbar-text">
          {item.title && (
            <h4 className={clsx("notip-snackbar-title", classNames?.title)}>{item.title}</h4>
          )}
          {item.description && (
            <p className={clsx("notip-snackbar-description", classNames?.description)}>
              {item.description}
            </p>
          )}
        </div>
        <button
          onClick={() => snackbarStore.dismiss(item.id)}
          className={clsx("notip-close-btn", classNames?.closeButton)}
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

const useTrackMountCount = trackMountCountToBlock();

export const NotipSnackbar: FC<NotipSnackbarProps> = ({ limit = 3, classNames, icons }) => {
  const { snackbars } = useSnackbarStore(limit);

  useTrackMountCount();

  const mergedIcons = {
    success: icons?.success ?? <SuccessIcon />,
    info: icons?.info ?? <InfoIcon />,
    warning: icons?.warning ?? <WarningIcon />,
    error: icons?.error ?? <ErrorIcon />,
    loading: icons?.loading ?? <LoadingIcon />,
  };

  const groupedSnackbars = snackbars.reduce(
    (acc, snackbar) => {
      const p = snackbar.placement || "bottom-right";
      if (!acc[p]) acc[p] = [];
      acc[p].push(snackbar);
      return acc;
    },
    {} as Record<Placement, SnackbarItem[]>,
  );

  return createPortal(
    (Object.keys(groupedSnackbars) as Placement[]).map((placement) => {
      const items = groupedSnackbars[placement];
      const total = items.length;

      return (
        <div
          key={placement}
          className={`notip-snackbar-container notip-snackbar-container-${placement}`}
        >
          {items.map((snackbar, idx) => {
            // Items are ordered Newest First.
            // We want Newest to be at index 0 (Front).
            // So stackIndex is simply idx.

            return (
              <SnackbarItemComponent
                key={snackbar.id}
                item={snackbar}
                index={idx}
                total={total}
                placement={placement}
                classNames={classNames}
                icons={mergedIcons}
              />
            );
          })}
        </div>
      );
    }),
    document.body,
  );
};
