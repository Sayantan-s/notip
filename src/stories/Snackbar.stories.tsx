import type { Meta, StoryObj } from "@storybook/react";
import { Notip, useSnackbar, NotipSnackbar } from "../notip";

const SnackbarDemo = () => {
  const { show: showSnackbar } = useSnackbar();

  const handleShowSnackbar = (variant: "default" | "success" | "error" | "warning" | "info") => {
    showSnackbar({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Notification`,
      description: "This is a description for the notification.",
      variant,
      placement: "bottom-right",
    });
  };

  const handleShowPlacement = (
    placement:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "top-center"
      | "bottom-center",
  ) => {
    showSnackbar({
      title: `Placement: ${placement}`,
      description: `This notification is positioned at ${placement}.`,
      placement,
      variant: "info",
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "1rem",
      }}
    >
      <section>
        <h3>Snackbar Variants</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => handleShowSnackbar("default")}>Default</button>
          <button onClick={() => handleShowSnackbar("success")}>Success</button>
          <button onClick={() => handleShowSnackbar("error")}>Error</button>
          <button onClick={() => handleShowSnackbar("warning")}>Warning</button>
          <button onClick={() => handleShowSnackbar("info")}>Info</button>
        </div>
      </section>

      <section>
        <h3>Snackbar Placements</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => handleShowPlacement("top-left")}>Top Left</button>
          <button onClick={() => handleShowPlacement("top-center")}>Top Center</button>
          <button onClick={() => handleShowPlacement("top-right")}>Top Right</button>
          <button onClick={() => handleShowPlacement("bottom-left")}>Bottom Left</button>
          <button onClick={() => handleShowPlacement("bottom-center")}>Bottom Center</button>
          <button onClick={() => handleShowPlacement("bottom-right")}>Bottom Right</button>
        </div>
      </section>

      <NotipSnackbar />
    </div>
  );
};

const meta = {
  title: "Library/Snackbar",
  component: SnackbarDemo,
  decorators: [
    (Story) => (
      <Notip>
        <Story />
      </Notip>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SnackbarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {};

// --- Composable API demos ---

const ComposableDemo = () => {
  const { show: showSnackbar } = useSnackbar();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "1rem",
      }}
    >
      <section>
        <h3>Custom JSX in Styled Shell</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Per-toast <code>jsx</code> renders custom content inside the variant-colored shell.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() =>
              showSnackbar({
                variant: "success",
                jsx: ({ dismiss }) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🎉</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block" }}>Deploy successful</strong>
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        v2.4.1 is now live in production
                      </span>
                    </div>
                    <button
                      onClick={dismiss}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "inherit",
                        opacity: 0.6,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ),
              })
            }
          >
            Custom Deploy Toast
          </button>
          <button
            onClick={() =>
              showSnackbar({
                variant: "error",
                jsx: ({ dismiss }) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block" }}>Build failed</strong>
                      <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        3 type errors in src/api/
                      </span>
                    </div>
                    <button
                      onClick={dismiss}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "inherit",
                        opacity: 0.6,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ),
              })
            }
          >
            Custom Error Toast
          </button>
        </div>
      </section>

      <section>
        <h3>Action &amp; Cancel Buttons</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Per-toast <code>action</code> and <code>cancel</code> add buttons that auto-dismiss on
          click.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() =>
              showSnackbar({
                title: "Message sent",
                description: "Your message was delivered successfully.",
                variant: "success",
                action: { label: "Undo", onClick: () => console.log("Undo clicked") },
              })
            }
          >
            With Action
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "Delete 3 items?",
                description: "This action cannot be undone.",
                variant: "warning",
                action: { label: "Delete", onClick: () => console.log("Deleted") },
                cancel: { label: "Cancel", onClick: () => console.log("Cancelled") },
              })
            }
          >
            Action + Cancel
          </button>
        </div>
      </section>

      <section>
        <h3>Per-Toast Options</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Custom icon, non-dismissible, and lifecycle callbacks.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() =>
              showSnackbar({
                title: "Custom Icon",
                description: "This toast has a custom emoji icon.",
                variant: "info",
                icon: <span style={{ fontSize: 18 }}>🚀</span>,
              })
            }
          >
            Custom Icon
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "Processing...",
                description: "This toast cannot be manually dismissed.",
                variant: "default",
                dismissible: false,
                time: 2000,
              })
            }
          >
            Non-Dismissible
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "With Callbacks",
                variant: "info",
                time: 3000,
                onDismiss: (item) => console.log("Dismissed:", item.id),
                onAutoClose: (item) => console.log("Auto-closed:", item.id),
              })
            }
          >
            Lifecycle Callbacks
          </button>
        </div>
      </section>

      <NotipSnackbar />
    </div>
  );
};

export const Composable: StoryObj<typeof ComposableDemo> = {
  render: () => <ComposableDemo />,
};

// --- Headless demo ---

const HeadlessDemo = () => {
  const { show: showSnackbar } = useSnackbar();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "1rem",
      }}
    >
      <section>
        <h3>Fully Headless (Children Render Prop)</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          The library handles stacking and portaling. You render the entire toast using{" "}
          <code>variantStyle</code> for variant color fallback.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() =>
              showSnackbar({
                title: "Headless Success",
                description: "Fully custom render with variant fallback.",
                variant: "success",
              })
            }
          >
            Success
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "Headless Error",
                description: "Custom layout, library colors.",
                variant: "error",
              })
            }
          >
            Error
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "Headless Warning",
                variant: "warning",
              })
            }
          >
            Warning
          </button>
          <button
            onClick={() =>
              showSnackbar({
                title: "Headless Info",
                description: "With description text.",
                variant: "info",
              })
            }
          >
            Info
          </button>
        </div>
      </section>

      <NotipSnackbar>
        {({ item, dismiss, variantStyle }) => (
          <div
            role="alert"
            style={{
              ...variantStyle,
              padding: 16,
              borderRadius: 10,
              border: `1px solid ${variantStyle.borderColor}`,
              boxShadow: "0 8px 24px rgb(0 0 0 / 12%)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              {item.title && (
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.title}</div>
              )}
              {item.description && (
                <div style={{ fontSize: "0.8rem", opacity: 0.85, marginTop: 2 }}>
                  {item.description}
                </div>
              )}
            </div>
            <button
              onClick={dismiss}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "inherit",
                opacity: 0.5,
                padding: 2,
              }}
            >
              ×
            </button>
          </div>
        )}
      </NotipSnackbar>
    </div>
  );
};

export const Headless: StoryObj<typeof HeadlessDemo> = {
  render: () => <HeadlessDemo />,
};
