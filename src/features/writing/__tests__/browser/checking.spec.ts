import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

type Stroke = readonly (readonly [number, number])[];

// Independent learner attempts in the pad's 0–100 coordinate space, with small deviations.
const curve: Stroke = [
	[39, 72],
	[31, 65],
	[26, 56],
	[26, 49],
	[30, 42],
	[35, 39],
	[40, 42],
	[44, 49],
	[48, 56],
	[52, 50],
	[59, 45],
	[66, 45],
];
const stem: Stroke = [
	[68, 26],
	[68, 50],
	[66, 75],
];
const headline: Stroke = [
	[23, 26],
	[49, 24],
	[76, 26],
];
const letter = [curve, stem, headline];
const extraInk: Stroke = [
	[8, 8],
	[90, 90],
];
const accepted = "That’s it! You matched the letter.";
const rejected = "Not quite yet. Follow the whole shape and try again.";

async function draw(page: Page, strokes: readonly Stroke[]): Promise<void> {
	const pad = page.getByRole("img", { name: "Hindi writing practice area" });
	await pad.scrollIntoViewIfNeeded();
	const bounds = await pad.boundingBox();
	if (!bounds) throw new Error("Writing pad has no bounds");
	for (const stroke of strokes) {
		for (const [index, [x, y]] of stroke.entries()) {
			await page.mouse.move(
				bounds.x + (bounds.width * x) / 100,
				bounds.y + (bounds.height * y) / 100,
				{ steps: index === 0 ? 1 : 3 },
			);
			if (index === 0) await page.mouse.down();
		}
		await page.mouse.up();
	}
}

const attempts: readonly {
	readonly name: string;
	readonly strokes: readonly Stroke[];
	readonly result: string;
}[] = [
	{
		name: "accepts a complete character with small drawing deviations",
		strokes: letter,
		result: accepted,
	},
	{
		name: "accepts reversed direction and a different stroke order",
		strokes: [...letter].reverse().map((stroke) => [...stroke].reverse()),
		result: accepted,
	},
	{ name: "rejects a missing headline", strokes: [curve, stem], result: rejected },
	{ name: "rejects a single dot", strokes: [[[68, 26]]], result: rejected },
	{
		name: "rejects a misplaced character",
		strokes: letter.map((stroke) => stroke.map(([x, y]) => [x + 18, y])),
		result: rejected,
	},
	{
		name: "rejects extra ink even with a complete character",
		strokes: [...letter, extraInk],
		result: rejected,
	},
];

for (const viewport of [
	{ name: "desktop", width: 1200, height: 1000 },
	{ name: "phone", width: 390, height: 844 },
]) {
	test.describe(viewport.name, () => {
		test.use({ viewport: { width: viewport.width, height: viewport.height } });

		for (const attempt of attempts) {
			test(attempt.name, async ({ page }) => {
				await page.goto("/");
				const status = page.getByRole("status");
				const check = page.getByRole("button", { name: "Check", exact: true });
				await expect(status).toContainText("Ready to trace");
				await expect(check).toBeDisabled();
				await draw(page, attempt.strokes);
				await expect(check).toBeEnabled();
				await check.click();
				await expect(status).toContainText(attempt.result);
				await check.click();
				await expect(status).toContainText(attempt.result);
				await page.getByRole("button", { name: "Retry", exact: true }).click();
				await expect(status).toContainText("Ready to trace");
				await expect(check).toBeDisabled();
			});
		}

		test("a rejected character can be completed without resetting", async ({ page }) => {
			await page.goto("/");
			const status = page.getByRole("status");
			const check = page.getByRole("button", { name: "Check", exact: true });
			await expect(status).toContainText("Ready to trace");
			await draw(page, [curve, stem]);
			await check.click();
			await expect(status).toContainText(rejected);
			await draw(page, [headline]);
			await expect(status).toContainText("3 strokes drawn");
			await check.click();
			await expect(status).toContainText(accepted);
		});

		test("new ink clears success and is included in the next check", async ({ page }) => {
			await page.goto("/");
			const status = page.getByRole("status");
			const check = page.getByRole("button", { name: "Check", exact: true });
			await expect(status).toContainText("Ready to trace");
			await draw(page, letter);
			await check.click();
			await expect(status).toContainText(accepted);
			await draw(page, [extraInk]);
			await expect(status).toContainText("4 strokes drawn");
			await check.click();
			await expect(status).toContainText(rejected);
		});
	});
}
