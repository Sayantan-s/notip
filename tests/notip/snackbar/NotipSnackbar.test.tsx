import { expect, test, beforeEach, vi } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { page } from "vitest/browser";
import { NotipSnackbar, useSnackbar, snackbarStore } from "../../../src/notip";
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
  (snackbarStore as any).state = {
    snackbars: [],
    previousSnackbarQueue: [],
  };
  (snackbarStore as any).listeners.forEach((l: any) => l());

  // Clear timers
  (snackbarStore as any).timers.forEach((t: any) => clearTimeout(t));
  (snackbarStore as any).timers.clear();
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
