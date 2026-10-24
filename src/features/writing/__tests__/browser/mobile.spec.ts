import { test, expect } from "./fixtures";

for (const viewport of [
	{ width: 320, height: 568 },
	{ width: 390, height: 844 },
	{ width: 430, height: 932 },
]) {
	test.describe(`mobile browser ${viewport.width}px`, () => {
		test.use({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });

		test("uses device width and stacks practice above guidance", async ({ page }, testInfo) => {
			await page.goto("/");
			await expect(page.getByRole("status")).toContainText("Ready to trace");
			await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(viewport.width);
			const pad = page.getByRole("img", { name: "Hindi writing practice area" });
			const retry = page.getByRole("button", { name: "Retry", exact: true });
			const guidance = page.getByRole("complementary", { name: "Practice guidance" });
			const bounds = await pad.boundingBox();
			const retryBounds = await retry.boundingBox();
			const guidanceBounds = await guidance.boundingBox();
			if (!bounds || !retryBounds || !guidanceBounds) throw new Error("Missing practice layout");
			expect(bounds.width).toBeGreaterThanOrEqual(viewport.width - 48);
			expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
			expect(retryBounds.height).toBeGreaterThanOrEqual(48);
			expect(guidanceBounds.y).toBeGreaterThanOrEqual(retryBounds.y + retryBounds.height);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
			const touch = await page.context().newCDPSession(page);
			await touch.send("Input.dispatchTouchEvent", {
				type: "touchStart",
				touchPoints: [{ x: bounds.x + bounds.width * 0.3, y: bounds.y + bounds.height * 0.4 }],
			});
			await expect(page.getByRole("status")).toContainText("Drawing…");
			for (let step = 1; step <= 5; step++) {
				await touch.send("Input.dispatchTouchEvent", {
					type: "touchMove",
					touchPoints: [
						{
							x: bounds.x + bounds.width * (0.3 + step * 0.05),
							y: bounds.y + bounds.height * (0.4 + step * 0.03),
						},
					],
				});
			}
			await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
			await expect(page.getByRole("status")).toContainText("1 stroke drawn");
			expect(await page.evaluate(() => window.scrollY)).toBe(0);
			await retry.tap();
			await expect(page.getByRole("status")).toContainText("Ready to trace");
			await page.screenshot({ path: testInfo.outputPath("mobile-practice.png"), fullPage: true });
		});
	});
}
