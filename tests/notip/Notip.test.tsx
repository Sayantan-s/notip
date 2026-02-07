import { expect, test, afterEach } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { page } from "vitest/browser";
import { Notip } from "../../src/notip";

afterEach(() => {
  cleanup();
});

test("Notip renders children correctly", async () => {
  render(
    <Notip>
      <div data-testid="child">Child Content</div>
    </Notip>,
  );

  const element = page.getByTestId("child");
  await expect.element(element).toBeInTheDocument();
  await expect.element(element).toHaveTextContent("Child Content");
});
