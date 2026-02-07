import { createPortal } from "react-dom";
import { useSnackbarStore } from "./useSnackbar";
import { snackbarStore } from "./store";
import type { Placement, SnackbarItem } from "./types";
import "./snackbar.css";
import { trackMountCountToBlock } from "../utils/mountDetector";

// Icons
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Individual Snackbar Component handles its own timer
const SnackbarItemComponent = ({ item }: { item: SnackbarItem }) => {
  return (
    <div className={`notip-snackbar notip-snackbar-${item.variant || "default"}`} role="alert">
      <div className="notip-snackbar-content">
        <div className="notip-snackbar-text">
          {item.title && <h4 className="notip-snackbar-title">{item.title}</h4>}
          {item.description && <p className="notip-snackbar-description">{item.description}</p>}
        </div>
        <button
          onClick={() => snackbarStore.dismiss(item.id)}
          className="notip-close-btn"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

const useTrackMountCount = trackMountCountToBlock();

export const NotipSnackbar = () => {
  const { snackbars } = useSnackbarStore();

  useTrackMountCount();

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

      return (
        <div
          key={placement}
          className={`notip-snackbar-container notip-snackbar-container-${placement}`}
        >
          {items.map((snackbar) => (
            <SnackbarItemComponent key={snackbar.id} item={snackbar} />
          ))}
        </div>
      );
    }),
    document.body,
  );
};
