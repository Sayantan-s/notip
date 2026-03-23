import { expect, test, beforeEach, vi } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { page } from "vitest/browser";
import { NotipSnackbar, useSnackbar, snackbarStore } from "../../../src/notip";
import type { SnackbarConfig } from "../../../src/notip";
import React from "react";

// Helper component to trigger snackbars
const Trigger = () => {
  const { show } = useSnackbar();
  return (
    <div>
      <button onClick={() => show({ title: "Test Snackbar", variant: "success", time: 5000 })}>
        Show Snackbar
      </button>
      <button onClick={() => show({ title: "Short Snackbar", time: 100 })}>Show Short</button>
      <button
        onClick={() => {
          for (let i = 0; i < 5; i++) {
            show({ title: `Snackbar ${i}`, time: 5000 });
          }
        }}
      >
        Show Many
      </button>
    </div>
  );
};

beforeEach(() => {
  cleanup();
  // Reset store state (accessing private state for testing)
  const store = snackbarStore as any;
  store.state = {
    snackbars: [],
  };
  store.nodes.clear();
  store.head = null;
  store.tail = null;

  store.listeners.forEach((l: any) => l());

  // Clear timers and pause state
  store.timers.forEach((t: any) => clearTimeout(t));
  store.timers.clear();
  store.pausedAt.clear();
  store.remaining.clear();
  store.startedAt.clear();
});

test("renders nothing initially", async () => {
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  const alert = page.getByRole("alert");
  await expect.element(alert).not.toBeInTheDocument();
});

test("shows snackbar when triggered", async () => {
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  const button = page.getByText("Show Snackbar");
  await button.click();

  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();
  await expect.element(alert).toHaveTextContent("Test Snackbar");
});

test("limits visible snackbars to 3", async () => {
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  const button = page.getByText("Show Many");
  await button.click();

  const alerts = page.getByRole("alert").all();
  // Expect 3 elements
  await expect(alerts).toHaveLength(3);

  // Note: page.getAllByRole is not standard in vitest browser context page.
  // page.getByRole returns a Locator. .all() returns Promise<Locator[]>.
  // But wait, Locator.all() returns Promise<Locator[]> in Playwright.
  // vitest-browser uses similar API.

  // Let's verify expectations.
  const elements = await alerts;
  expect(elements.length).toBe(3);

  await expect.element(elements[0]).toHaveTextContent("Snackbar 4");
  await expect.element(elements[1]).toHaveTextContent("Snackbar 3");
  await expect.element(elements[2]).toHaveTextContent("Snackbar 2");
});

test("updates visible limit when prop changes", async () => {
  const TestComponent = () => {
    const [limit, setLimit] = React.useState(2);
    return (
      <>
        <button onClick={() => setLimit(4)}>Change Limit</button>
        <NotipSnackbar limit={limit} />
        <Trigger />
      </>
    );
  };

  render(<TestComponent />);

  const button = page.getByText("Show Many");
  await button.click(); // Shows 5 items

  let alerts = await page.getByRole("alert").all();
  await expect(alerts).toHaveLength(2);
  await expect.element(alerts[0]).toHaveTextContent("Snackbar 4");
  await expect.element(alerts[1]).toHaveTextContent("Snackbar 3");

  // Change limit
  await page.getByText("Change Limit").click();

  alerts = await page.getByRole("alert").all();
  await expect(alerts).toHaveLength(4);
  await expect.element(alerts[0]).toHaveTextContent("Snackbar 4");
  await expect.element(alerts[1]).toHaveTextContent("Snackbar 3");
  await expect.element(alerts[2]).toHaveTextContent("Snackbar 2");
  await expect.element(alerts[3]).toHaveTextContent("Snackbar 1");
});

test("dismisses snackbar on close button click", async () => {
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  await page.getByText("Show Snackbar").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  const closeBtn = page.getByLabelText("Close");
  await closeBtn.click();

  await expect.element(alert).not.toBeInTheDocument();
});

test("auto dismisses after timeout", async () => {
  vi.useFakeTimers();
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  await page.getByText("Show Short").click(); // 100ms
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  // Advance time
  vi.advanceTimersByTime(200);

  await expect.element(alert).not.toBeInTheDocument();

  vi.useRealTimers();
});

// --- Composable API tests ---

const CustomTrigger = ({ config }: { config: SnackbarConfig }) => {
  const { show } = useSnackbar();
  return <button onClick={() => show(config)}>Trigger</button>;
};

test("renders custom JSX in styled shell via per-toast jsx", async () => {
  render(
    <>
      <NotipSnackbar />
      <CustomTrigger
        config={{
          variant: "success",
          time: 5000,
          jsx: ({ dismiss }) => (
            <div>
              <span>Custom Content</span>
              <button onClick={dismiss}>Custom Close</button>
            </div>
          ),
        }}
      />
    </>,
  );

  await page.getByText("Trigger").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();
  await expect.element(page.getByText("Custom Content")).toBeInTheDocument();
});

test("renders fully headless via children render prop", async () => {
  render(
    <>
      <NotipSnackbar>
        {({ item, dismiss }) => (
          <div role="alert">
            <span data-testid="custom-title">{item.title}</span>
            <button onClick={dismiss}>X</button>
          </div>
        )}
      </NotipSnackbar>
      <CustomTrigger config={{ title: "Headless Toast", variant: "error", time: 5000 }} />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByTestId("custom-title")).toHaveTextContent("Headless Toast");
});

test("dismiss works via children render prop", async () => {
  render(
    <>
      <NotipSnackbar>
        {({ item, dismiss }) => (
          <div role="alert">
            <span>{item.title}</span>
            <button onClick={dismiss}>X</button>
          </div>
        )}
      </NotipSnackbar>
      <CustomTrigger config={{ title: "Dismiss Me", time: 5000 }} />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByRole("alert")).toBeInTheDocument();

  await page.getByText("X").click();
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});

test("action and cancel buttons render and work", async () => {
  const actionFn = vi.fn();
  const cancelFn = vi.fn();

  const ActionTrigger = () => {
    const { show } = useSnackbar();
    return (
      <button
        onClick={() =>
          show({
            title: "With Actions",
            time: 5000,
            action: { label: "Confirm", onClick: actionFn },
            cancel: { label: "Cancel", onClick: cancelFn },
          })
        }
      >
        Trigger
      </button>
    );
  };

  render(
    <>
      <NotipSnackbar />
      <ActionTrigger />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByText("Confirm")).toBeInTheDocument();
  await expect.element(page.getByText("Cancel")).toBeInTheDocument();

  await page.getByText("Confirm").click();
  expect(actionFn).toHaveBeenCalledOnce();
  // Action dismisses the toast
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});

test("dismissible: false hides close button", async () => {
  render(
    <>
      <NotipSnackbar />
      <CustomTrigger config={{ title: "No Close", time: 5000, dismissible: false }} />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByRole("alert")).toBeInTheDocument();
  await expect.element(page.getByLabelText("Close")).not.toBeInTheDocument();
});

test("per-toast custom icon renders", async () => {
  render(
    <>
      <NotipSnackbar />
      <CustomTrigger
        config={{
          title: "Custom Icon",
          variant: "success",
          time: 5000,
          icon: <span data-testid="custom-icon">★</span>,
        }}
      />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByTestId("custom-icon")).toBeInTheDocument();
});

test("onDismiss callback fires on manual dismiss", async () => {
  const onDismissFn = vi.fn();

  const DismissTrigger = () => {
    const { show } = useSnackbar();
    return (
      <button onClick={() => show({ title: "Callback Test", time: 5000, onDismiss: onDismissFn })}>
        Trigger
      </button>
    );
  };

  render(
    <>
      <NotipSnackbar />
      <DismissTrigger />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByRole("alert")).toBeInTheDocument();
  await page.getByLabelText("Close").click();
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  expect(onDismissFn).toHaveBeenCalledOnce();
});

test("onAutoClose callback fires on timer dismiss", async () => {
  vi.useFakeTimers();
  const onAutoCloseFn = vi.fn();

  const AutoCloseTrigger = () => {
    const { show } = useSnackbar();
    return (
      <button onClick={() => show({ title: "Auto Close", time: 100, onAutoClose: onAutoCloseFn })}>
        Trigger
      </button>
    );
  };

  render(
    <>
      <NotipSnackbar />
      <AutoCloseTrigger />
    </>,
  );

  await page.getByText("Trigger").click();
  await expect.element(page.getByRole("alert")).toBeInTheDocument();

  vi.advanceTimersByTime(200);

  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  expect(onAutoCloseFn).toHaveBeenCalledOnce();

  vi.useRealTimers();
});

// --- Hover pause/resume tests ---

test("snackbar is not dismissed while hovered", async () => {
  vi.useFakeTimers();
  render(
    <>
      <NotipSnackbar />
      <Trigger />
    </>,
  );

  await page.getByText("Show Short").click(); // 100ms timer
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  // Hover on the snackbar
  await alert.hover();

  // Advance well past the timer
  vi.advanceTimersByTime(500);

  // Should still be visible because it's hovered
  await expect.element(alert).toBeInTheDocument();

  vi.useRealTimers();
});

test("snackbar dismisses after mouse leaves with remaining time", async () => {
  vi.useFakeTimers();

  const HoverTrigger = () => {
    const { show } = useSnackbar();
    return <button onClick={() => show({ title: "Hover Test", time: 3000 })}>Show Hover</button>;
  };

  render(
    <>
      <NotipSnackbar />
      <HoverTrigger />
    </>,
  );

  await page.getByText("Show Hover").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  // Advance 300ms, then hover
  vi.advanceTimersByTime(300);
  await alert.hover();

  // Advance well past original timer — should still be visible
  vi.advanceTimersByTime(5000);
  await expect.element(alert).toBeInTheDocument();

  // Move mouse away (unhover)
  await page.getByText("Show Hover").hover();

  // Should still be visible — 2700ms remaining
  vi.advanceTimersByTime(2600);
  await expect.element(alert).toBeInTheDocument();

  // Now advance past remaining time
  vi.advanceTimersByTime(200);
  await expect.element(alert).not.toBeInTheDocument();

  vi.useRealTimers();
});

test("hover works with children render prop", async () => {
  vi.useFakeTimers();
  render(
    <>
      <NotipSnackbar>
        {({ item, dismiss }) => (
          <div role="alert">
            <span>{item.title}</span>
            <button onClick={dismiss}>X</button>
          </div>
        )}
      </NotipSnackbar>
      <CustomTrigger config={{ title: "Headless Hover", time: 200 }} />
    </>,
  );

  await page.getByText("Trigger").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  // Hover
  await alert.hover();

  // Advance past timer
  vi.advanceTimersByTime(500);

  // Still visible
  await expect.element(alert).toBeInTheDocument();

  vi.useRealTimers();
});

test("onAutoClose fires after unhover remaining time elapses", async () => {
  vi.useFakeTimers();
  const onAutoCloseFn = vi.fn();

  const AutoHoverTrigger = () => {
    const { show } = useSnackbar();
    return (
      <button onClick={() => show({ title: "Auto Hover", time: 1000, onAutoClose: onAutoCloseFn })}>
        Trigger
      </button>
    );
  };

  render(
    <>
      <NotipSnackbar />
      <AutoHoverTrigger />
    </>,
  );

  await page.getByText("Trigger").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();

  // Hover immediately
  await alert.hover();

  // Advance well past timer
  vi.advanceTimersByTime(2000);
  expect(onAutoCloseFn).not.toHaveBeenCalled();

  // Unhover
  await page.getByText("Trigger").hover();

  // Advance past remaining time (full 1000ms since we hovered at ~0)
  vi.advanceTimersByTime(1100);

  await expect.element(alert).not.toBeInTheDocument();
  expect(onAutoCloseFn).toHaveBeenCalledOnce();

  vi.useRealTimers();
});

test("global unstyled prop strips default CSS classes", async () => {
  render(
    <>
      <NotipSnackbar unstyled />
      <CustomTrigger config={{ title: "Unstyled", variant: "success", time: 5000 }} />
    </>,
  );

  await page.getByText("Trigger").click();
  const alert = page.getByRole("alert");
  await expect.element(alert).toBeInTheDocument();
  // Should NOT have the default styled class
  await expect.element(alert).not.toHaveClass("notip-snackbar");
});
