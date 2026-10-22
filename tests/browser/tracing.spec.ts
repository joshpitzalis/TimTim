import { test, expect } from "./fixtures";
import type { Locator } from "@playwright/test";

async function inkPixels(pad: Locator): Promise<number> {
  const png = (await pad.screenshot()).toString("base64");
  return pad.evaluate(async (_element, encoded) => {
    const response = await fetch(`data:image/png;base64,${encoded}`);
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No screenshot decoder");
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index] ?? 255;
      const green = pixels[index + 1] ?? 255;
      const blue = pixels[index + 2] ?? 0;
      if (blue > red * 1.5 && blue > green * 1.5) count++;
    }
    return count;
  }, png);
}

test.use({ viewport: { width: 1200, height: 1200 } });

test("shows live local ink, separate gestures, and a clear tracing-only reset", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Development lesson — review pending", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Ready to trace");
  const pad = page.getByRole("img", { name: "Hindi writing practice area" });
  const bounds = await pad.boundingBox();
  if (!bounds) throw new Error("No writing pad");
  expect(await inkPixels(pad)).toBe(0);
  await page.mouse.move(bounds.x + bounds.width * 0.25, bounds.y + bounds.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.65, { steps: 8 });
  await expect(page.getByRole("status")).toContainText("Drawing…");
  expect(await inkPixels(pad)).toBeGreaterThan(100);
  await page.mouse.up();
  await expect(page.getByRole("status")).toContainText("1 stroke drawn");
  await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.7, { steps: 6 });
  await page.mouse.up();
  await expect(page.getByRole("status")).toContainText("2 strokes drawn");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Ready to trace");
  expect(await inkPixels(pad)).toBe(0);
});

test("Reveal exposes ordered direction hints without checking or completing, and repeated Retry resets it", async ({ page }) => {
  await page.goto("/");
  const reveal = page.getByRole("button", { name: "Reveal", exact: true });
  await reveal.click();
  await expect(reveal).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("listitem")).toHaveCount(3);
  await expect(page.getByText("Tracing only. Your writing is not checked or scored.", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Ready to trace");
  for (let repeat = 0; repeat < 2; repeat++) {
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(reveal).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("status")).toContainText("Ready to trace");
    await reveal.click();
  }
});

for (const interruption of ["cancel", "capture loss", "blur", "resize", "layout shift", "Clear", "Retry"] as const) {
  test(`${interruption} discards unfinished ink and permits the next gesture`, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toContainText("Ready to trace");
    const pad = page.getByRole("img", { name: "Hindi writing practice area" });
    const bounds = await pad.boundingBox();
    if (!bounds) throw new Error("No pad");
    const start = { x: bounds.x + bounds.width * .2, y: bounds.y + bounds.height * .4 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 70, start.y + 50, { steps: 5 });
    await page.mouse.up();
    await expect(page.getByRole("status")).toContainText("1 stroke drawn");
    const finished = await inkPixels(pad);
    expect(finished).toBeGreaterThan(100);
    await pad.evaluate((element) => element.addEventListener("pointerdown", (event) => {
      if (event instanceof PointerEvent) element.setAttribute("data-test-pointer", String(event.pointerId));
    }, { once: true }));
    await page.mouse.move(start.x + 120, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 170, start.y + 60, { steps: 4 });
    await expect(page.getByRole("status")).toContainText("Drawing…");
    const id = Number(await pad.getAttribute("data-test-pointer"));
    if (interruption === "cancel") await pad.dispatchEvent("pointercancel", { pointerId: id });
    if (interruption === "capture loss") {
      await pad.evaluate((element, pointerId) => element.releasePointerCapture(pointerId), id);
      await page.mouse.move(start.x + 180, start.y + 60);
    }
    if (interruption === "blur") await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    if (interruption === "resize") await page.setViewportSize({ width: 1000, height: 1200 });
    if (interruption === "layout shift") {
      await pad.evaluate((element) => { element.style.transform = "translateY(20px)"; });
      await page.mouse.move(start.x + 180, start.y + 60);
    }
    if (interruption === "Clear" || interruption === "Retry") {
      await page.getByRole("button", { name: interruption, exact: true }).focus();
      await page.keyboard.press("Enter");
    }
    await expect(page.getByRole("status")).toContainText(interruption === "Clear" || interruption === "Retry" ? "Ready to trace" : "Stroke interrupted");
    await page.mouse.up();
    if (interruption === "cancel" || interruption === "capture loss" || interruption === "blur") {
      // Pixel coverage tolerates subpixel rasterization while detecting leftover unfinished ink.
      expect(Math.abs(await inkPixels(pad) - finished)).toBeLessThan(finished * .05);
    }
    const nextBounds = await pad.boundingBox();
    if (!nextBounds) throw new Error("No resized pad");
    await page.mouse.move(nextBounds.x + 30, nextBounds.y + 30);
    await page.mouse.down();
    await page.mouse.move(nextBounds.x + 80, nextBounds.y + 80, { steps: 4 });
    await page.mouse.up();
    await expect(page.getByRole("status")).toContainText(interruption === "Clear" || interruption === "Retry" ? "1 stroke drawn" : "2 strokes drawn");
  });
}

test("other pointers do not interrupt capture, and releasing outside does not leave ghost ink", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Ready to trace");
  const pad = page.getByRole("img", { name: "Hindi writing practice area" });
  const bounds = await pad.boundingBox();
  if (!bounds) throw new Error("No pad");
  await page.mouse.move(bounds.x + 80, bounds.y + 80);
  await page.mouse.down();
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) await pad.dispatchEvent(type, { pointerId: 999, pointerType: "touch", button: 0, buttons: 1, clientX: bounds.x + 200, clientY: bounds.y + 200 });
  await expect(page.getByRole("status")).toContainText("Drawing…");
  await page.mouse.move(bounds.x + bounds.width + 30, bounds.y + 100, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole("status")).toContainText("1 stroke drawn");
  const finished = await inkPixels(pad);
  await page.mouse.move(bounds.x + 90, bounds.y + 90, { steps: 5 });
  expect(Math.abs(await inkPixels(pad) - finished)).toBeLessThan(finished * .05);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 140, bounds.y + 140, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByRole("status")).toContainText("2 strokes drawn");
});
