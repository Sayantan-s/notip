import { createPortal } from "react-dom";
import type { FC } from "react";
import { useSnackbarStore } from "./useSnackbar";
import { snackbarStore } from "./store";
import type {
  NotipSnackbarProps,
  Placement,
  SnackbarClassNames,
  SnackbarItem,
  SnackbarItemRenderProps,
} from "./types";
import { VARIANT_STYLES } from "./types";
import "./snackbar.css";
import { trackMountCountToBlock } from "../utils/mountDetector";
import { clsx } from "../utils/clsx";

import { CloseIcon } from "../icons/Close";
import { SuccessIcon } from "../icons/Success";
import { ErrorIcon } from "../icons/Error";
import { WarningIcon } from "../icons/Warning";
import { InfoIcon } from "../icons/Info";
import { LoadingIcon } from "../icons/Loading";

const DefaultSnackbarItem = ({
  renderProps,
  classNames,
  icons,
  unstyled,
}: {
  renderProps: SnackbarItemRenderProps;
  classNames?: SnackbarClassNames | undefined;
  icons: Required<NonNullable<NotipSnackbarProps["icons"]>>;
  unstyled?: boolean | undefined;
}) => {
  const { item, index, total, placement, dismiss } = renderProps;
  const variant = item.variant || "default";

  let variantIcon = null;
  if (item.icon) {
    variantIcon = item.icon;
  } else if (variant !== "default") {
    variantIcon = icons[variant as keyof typeof icons];
  }

  const rootClass = unstyled
    ? clsx(classNames?.toast)
    : clsx(`notip-snackbar notip-snackbar-${variant}`, classNames?.toast);

  return (
    <div
      className={rootClass}
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
      <div className={unstyled ? undefined : "notip-snackbar-content"}>
        {variantIcon && (
          <div className={unstyled ? undefined : "notip-snackbar-icon"}>{variantIcon}</div>
        )}
        <div className={unstyled ? undefined : "notip-snackbar-text"}>
          {item.title && (
            <h4 className={clsx(!unstyled && "notip-snackbar-title", classNames?.title)}>
              {item.title}
            </h4>
          )}
          {item.description && (
            <p className={clsx(!unstyled && "notip-snackbar-description", classNames?.description)}>
              {item.description}
            </p>
          )}
        </div>
        {item.dismissible && (
          <button
            onClick={dismiss}
            className={clsx(!unstyled && "notip-close-btn", classNames?.closeButton)}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {(item.action || item.cancel) && (
        <div className={unstyled ? undefined : "notip-snackbar-actions"}>
          {item.cancel && (
            <button
              className={clsx(!unstyled && "notip-snackbar-cancel-btn", classNames?.cancelButton)}
              onClick={() => {
                item.cancel!.onClick();
                dismiss();
              }}
            >
              {item.cancel.label}
            </button>
          )}
          {item.action && (
            <button
              className={clsx(!unstyled && "notip-snackbar-action-btn", classNames?.actionButton)}
              onClick={() => {
                item.action!.onClick();
                dismiss();
              }}
            >
              {item.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const buildRenderProps = (
  snackbar: SnackbarItem,
  idx: number,
  total: number,
  placement: Placement,
): SnackbarItemRenderProps => ({
  item: snackbar,
  index: idx,
  total,
  placement,
  dismiss: () => snackbarStore.dismiss(snackbar.id),
  variantClassName: `notip-snackbar-${snackbar.variant || "default"}`,
  variantStyle: VARIANT_STYLES[snackbar.variant || "default"],
});

const useTrackMountCount = trackMountCountToBlock();

export const NotipSnackbar: FC<NotipSnackbarProps> = ({
  limit = 3,
  classNames,
  icons,
  unstyled,
  children,
}) => {
  const { snackbars } = useSnackbarStore(limit);

  useTrackMountCount();

  const mergedIcons = children
    ? null
    : {
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
    <>
      {(Object.keys(groupedSnackbars) as Placement[]).map((placement) => {
        const items = groupedSnackbars[placement];
        const total = items.length;

        return (
          <div
            key={placement}
            className={`notip-snackbar-container notip-snackbar-container-${placement}`}
          >
            {items.map((snackbar, idx) => {
              const renderProps = buildRenderProps(snackbar, idx, total, placement);

              // PATH 1: Fully headless (children render prop)
              if (children) {
                return (
                  <div
                    key={snackbar.id}
                    style={
                      {
                        "--index": idx,
                        "--total": total,
                        zIndex: total - idx,
                      } as React.CSSProperties
                    }
                  >
                    {children(renderProps)}
                  </div>
                );
              }

              // PATH 2: Per-toast custom JSX in styled shell
              if (snackbar.jsx) {
                const isUnstyled = snackbar.unstyled ?? unstyled;
                const variant = snackbar.variant || "default";
                return (
                  <div
                    key={snackbar.id}
                    className={
                      isUnstyled
                        ? clsx(snackbar.classNames?.toast)
                        : clsx(
                            `notip-snackbar notip-snackbar-${variant}`,
                            snackbar.classNames?.toast,
                          )
                    }
                    role="alert"
                    style={
                      {
                        "--index": idx,
                        "--total": total,
                        zIndex: total - idx,
                      } as React.CSSProperties
                    }
                    data-placement={placement}
                  >
                    {snackbar.jsx(renderProps)}
                  </div>
                );
              }

              // PATH 3: Default fully-styled renderer
              return (
                <DefaultSnackbarItem
                  key={snackbar.id}
                  renderProps={renderProps}
                  classNames={snackbar.classNames ?? classNames}
                  icons={mergedIcons!}
                  unstyled={snackbar.unstyled ?? unstyled}
                />
              );
            })}
          </div>
        );
      })}
    </>,
    document.body,
  );
};
