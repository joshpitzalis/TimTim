import type { Page } from "@playwright/test";
import { DEVELOPMENT_LESSON } from "../../use-case/tracing/constants/development-lesson";
import { test, expect } from "./fixtures";

test("Check stays disabled until learner ink is drawn", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("status")).toContainText("Ready to trace");
	await expect(page.getByRole("button", { name: "Check", exact: true })).toBeDisabled();
	await expect(page.getByRole("button", { name: "Reveal", exact: true })).toHaveCount(0);
});

type Path = readonly { readonly x: number; readonly y: number }[];
const trace: readonly Path[] = DEVELOPMENT_LESSON.strokes.map((stroke) => stroke.points);

async function draw(page: Page, paths: readonly Path[]): Promise<void> {
	const bounds = await page.getByRole("img", { name: "Hindi writing practice area" }).boundingBox();
	if (!bounds) throw new Error("No writing area");
	for (const path of paths) {
		const first = path[0];
		if (!first) continue;
		await page.mouse.move(
			bounds.x + (first.x / 100) * bounds.width,
			bounds.y + (first.y / 100) * bounds.height,
		);
		await page.mouse.down();
		for (const point of path.slice(1))
			await page.mouse.move(
				bounds.x + (point.x / 100) * bounds.width,
				bounds.y + (point.y / 100) * bounds.height,
				{ steps: 3 },
			);
		await page.mouse.up();
	}
}

test("a complete letter passes in reverse order and direction without replacing the learner's ink", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page.getByRole("status")).toContainText("Ready to trace");
	await draw(
		page,
		[...trace].reverse().map((path) => [...path].reverse()),
	);
	const pad = page.getByRole("img", { name: "Hindi writing practice area" });
	const before = await pad.evaluate((element) =>
		[...element.querySelectorAll("polyline")].map((line) => line.getAttribute("points")),
	);
	const check = page.getByRole("button", { name: "Check", exact: true });
	await check.click();
	await expect(page.getByRole("status")).toContainText("That’s it! You matched the letter.");
	expect(
		await pad.evaluate((element) =>
			[...element.querySelectorAll("polyline")].map((line) => line.getAttribute("points")),
		),
	).toEqual(before);
	await check.click();
	await expect(page.getByRole("status")).toContainText("That’s it! You matched the letter.");
	const bounds = await pad.boundingBox();
	if (!bounds) throw new Error("No pad");
	await page.mouse.move(bounds.x + 50, bounds.y + 50);
	await page.mouse.down();
	await expect(check).toBeDisabled();
	await expect(page.getByRole("status")).toContainText("Drawing…");
	await pad.dispatchEvent("pointercancel", { pointerId: 1 });
	await page.mouse.up();
	await expect(page.getByRole("status")).not.toContainText("That’s it");
	await page.getByRole("button", { name: "Retry", exact: true }).click();
	await expect(page.getByRole("status")).toContainText("Ready to trace");
});

test("a failed letter keeps its ink so the learner can add missing parts and check again", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");
	const check = page.getByRole("button", { name: "Check", exact: true });
	await expect(page.getByRole("status")).toContainText("Ready to trace");
	await draw(page, trace.slice(0, 2));
	await check.click();
	await expect(page.getByRole("status")).toContainText("Some parts are missing.");
	await draw(page, trace.slice(2));
	await expect(page.getByRole("status")).not.toContainText("Some parts are missing");
	await check.click();
	await expect(page.getByRole("status")).toContainText("That’s it! You matched the letter.");
	await page.setViewportSize({ width: 1200, height: 900 });
	await check.click();
	await expect(page.getByRole("status")).toContainText("That’s it! You matched the letter.");
	await draw(page, [
		[
			{ x: 10, y: 90 },
			{ x: 90, y: 10 },
		],
	]);
	await check.click();
	await expect(page.getByRole("status")).toContainText("Keep closer to the guide.");
	await page.getByRole("button", { name: "Retry", exact: true }).click();
	await expect(page.getByRole("status")).toContainText("Ready to trace");
	await expect(check).toBeDisabled();
});
