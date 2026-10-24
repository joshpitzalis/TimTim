import { test, expect } from "./fixtures";

test("opens a readable practice page with a square pad on phone and desktop", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Strokes", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Focus on the whole letter" })).toBeVisible();
    await expect(page.getByText(/Take your time with the curves and lines/)).toHaveCount(1);
    await expect(page.getByText(/Your ink stays on this page/)).toHaveCount(0);
    const pad = page.getByRole("img", { name: "Hindi writing practice area" });
    await expect(pad).toBeVisible();
    const bounds = await pad.boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds === null) throw new Error("Practice pad has no visible bounds");
    expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
    expect(bounds.width).toBeLessThanOrEqual(viewport.width);
  }
});
