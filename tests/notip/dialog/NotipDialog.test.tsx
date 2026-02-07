import { expect, test, beforeEach, vi } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { NotipDialog, useDialog, dialogStore } from "../../../src/notip";
import React from "react";

// Helper component
const Trigger = ({ onConfirmSpy, onCancelSpy }: { onConfirmSpy?: any; onCancelSpy?: any }) => {
  const { show } = useDialog();
  return (
    <div>
      <button
        onClick={() =>
          show({
            title: "Confirm Action",
            description: "Are you sure?",
            variant: "warning",
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: onConfirmSpy,
            onCancel: onCancelSpy,
          })
        }
      >
        Open Dialog
      </button>
    </div>
  );
};

beforeEach(() => {
  cleanup();
  // Reset dialog store
  (dialogStore as any).state = { dialog: null };
  (dialogStore as any).listeners.forEach((l: any) => l());
});

test("renders nothing initially", async () => {
  render(
    <>
      <NotipDialog />
      <Trigger />
    </>,
  );

  const dialog = page.getByRole("dialog");
  await expect.element(dialog).not.toBeInTheDocument();
});

test("opens dialog when triggered", async () => {
  render(
    <>
      <NotipDialog />
      <Trigger />
    </>,
  );

  await page.getByText("Open Dialog").click();

  const dialog = page.getByRole("dialog");
  await expect.element(dialog).toBeInTheDocument();
  await expect.element(page.getByText("Confirm Action")).toBeInTheDocument();
  await expect.element(page.getByText("Are you sure?")).toBeInTheDocument();
});

test("calls onConfirm and closes on confirm click", async () => {
  const onConfirm = vi.fn();
  render(
    <>
      <NotipDialog />
      <Trigger onConfirmSpy={onConfirm} />
    </>,
  );

  await page.getByText("Open Dialog").click();
  const dialog = page.getByRole("dialog");
  await expect.element(dialog).toBeInTheDocument();

  await page.getByText("Yes").click();

  expect(onConfirm).toHaveBeenCalled();
  await expect.element(dialog).not.toBeInTheDocument();
});

test("calls onCancel and closes on cancel click", async () => {
  const onCancel = vi.fn();
  render(
    <>
      <NotipDialog />
      <Trigger onCancelSpy={onCancel} />
    </>,
  );

  await page.getByText("Open Dialog").click();

  await page.getByText("No").click();

  expect(onCancel).toHaveBeenCalled();
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});

test("closes on Escape key", async () => {
  render(
    <>
      <NotipDialog />
      <Trigger />
    </>,
  );

  await page.getByText("Open Dialog").click();
  const dialog = page.getByRole("dialog");
  await expect.element(dialog).toBeInTheDocument();

  // Press Escape
  await userEvent.keyboard("{Escape}");

  await expect.element(dialog).not.toBeInTheDocument();
});
