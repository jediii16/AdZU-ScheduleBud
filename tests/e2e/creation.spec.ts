import { expect, test } from "@playwright/test";
import { resolve } from "node:path";

test("manual schedule creation reaches review", async ({ page }) => {
  await page.goto("/create/manual");
  await page.getByLabel("Subject code").fill("CS 201");
  await page.getByLabel("Subject name").fill("Data Structures");
  await page.getByText("Mon", { exact: true }).click();
  await page.getByLabel("Start time").fill("08:00");
  await page.getByLabel("End time").fill("09:30");
  await page.getByRole("button", { name: "Add class" }).click();
  await expect(page.getByText("CS 201").last()).toBeVisible();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(
    page.getByRole("heading", { name: "Make sure your schedule is correct." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Monday" }).locator(".."),
  ).toContainText("CS 201");
});

test("sanitized Portal import confirms before review", async ({ page }) => {
  await page.goto("/create/portal");
  await page
    .locator('input[type="file"]')
    .setInputFiles(resolve("tests/fixtures/portal/portal-normal.xlsx"));
  await expect(
    page.getByRole("heading", { name: "Check the imported classes." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "FIC.101" })).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Include in schedule" })
    .first()
    .uncheck({ force: true });
  await page.getByRole("button", { name: /Confirm import/i }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByText("FIC.101")).toHaveCount(0);
  await expect(page.getByText("FIC.102").first()).toBeVisible();
});

test("curriculum selection adds a meeting before review", async ({ page }) => {
  await page.goto("/create/curriculum");
  await page
    .getByRole("combobox", { name: "Program", exact: true })
    .fill("computer science");
  await page.getByRole("option", { name: /BS CS/i }).click();
  await page.getByRole("button", { name: "Year 1" }).click();
  await page.getByRole("button", { name: "Semester 1" }).click();
  await expect(page.getByText("COMPINTRO")).toBeVisible();
  await page.getByRole("button", { name: /Use this term/i }).click();
  const firstClass = page.locator("article").first();
  await firstClass.getByText("Edit class").click();
  await firstClass.getByText("Mon", { exact: true }).click();
  await firstClass.getByLabel("Start time").fill("08:00");
  await firstClass.getByLabel("End time").fill("09:00");
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(
    page.getByRole("heading", { name: "Monday" }).locator(".."),
  ).toContainText("COMPINTRO");
});

test("mobile curriculum picker is searchable and reveals progression", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/create/curriculum");
  await page.getByRole("button", { name: "Choose program" }).click();
  await expect(page.getByText("Choose your program")).toBeVisible();
  await page.getByRole("textbox", { name: "Search programs" }).fill("BS CS");
  await page.getByRole("button", { name: /BS CS/i }).click();
  await expect(page.getByRole("button", { name: "Year 1" })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("mobile creation remains reachable without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/create/manual");
  await expect(
    page.getByRole("heading", { name: "Add your classes." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add class" })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("mobile review keeps warning actions inside the bottom safe area", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/create/manual");
  await page.getByLabel("Subject code").fill("OPEN 1");
  await page.getByLabel("Subject name").fill("Incomplete class");
  await page.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Fix issues" })).toBeVisible();
  await expect(
    footer.getByRole("button", { name: "Continue anyway" }),
  ).toBeVisible();
  const placement = await footer.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      bottom: box.bottom,
      viewportHeight: window.innerHeight,
      paddingBottom: Number.parseFloat(getComputedStyle(element).paddingBottom),
    };
  });
  expect(placement.bottom).toBeLessThanOrEqual(placement.viewportHeight + 1);
  expect(placement.paddingBottom).toBeGreaterThanOrEqual(16);
});
