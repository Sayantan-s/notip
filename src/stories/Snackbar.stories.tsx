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
