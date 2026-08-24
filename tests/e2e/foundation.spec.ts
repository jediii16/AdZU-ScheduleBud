import { expect, test } from "@playwright/test";

test("foundation landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "AdZU ScheduleBud 2.0" }),
  ).toBeVisible();
  await expect(page.getByText("Canonical schedule domain")).toBeVisible();
});
