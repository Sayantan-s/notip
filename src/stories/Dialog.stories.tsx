import type { Meta, StoryObj } from "@storybook/react";
import { Notip, useDialog, NotipDialog, useSnackbar, NotipSnackbar } from "../notip";

const DialogDemo = () => {
  const { show: showDialog } = useDialog();
  const { show: showSnackbar } = useSnackbar();

  const handleShowDialog = () => {
    showDialog({
      title: "Confirmation Required",
      description: "Are you sure you want to perform this action?",
      variant: "warning",
      confirmText: "Yes, Proceed",
      cancelText: "No, Cancel",
      onConfirm: () => {
        showSnackbar({
          title: "Confirmed",
          variant: "success",
          description: "Action confirmed!",
        });
      },
      onCancel: () => {
        showSnackbar({
          title: "Cancelled",
          variant: "info",
          description: "Action cancelled.",
        });
      },
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
        <h3>Dialogs</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleShowDialog}>Open Confirmation Dialog</button>
        </div>
      </section>

      <NotipDialog />
      <NotipSnackbar />
    </div>
  );
};

const meta = {
  title: "Library/Dialog",
  component: DialogDemo,
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
} satisfies Meta<typeof DialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {};
