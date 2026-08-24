import { expect, test, type Download, type Page } from "@playwright/test";
import { resolve } from "node:path";

async function createStudioSchedule(
  page: Page,
  code = "STUDIO 1",
  days: readonly string[] = ["Mon"],
) {
  await page.goto("/create/manual");
  await page.getByLabel("Subject code").fill(code);
  await page.getByLabel("Subject name").fill("Interaction Design");
  for (const day of days) await page.getByText(day, { exact: true }).click();
  await page.getByLabel("Start time").fill("08:00");
  await page.getByLabel("End time").fill("09:30");
  await page.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await page.getByRole("button", { name: /Start designing/i }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
}

async function pngDimensions(download: Download) {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const png = Buffer.concat(chunks);
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

async function exportedPng(page: Page): Promise<Buffer> {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

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

test("Studio preserves target positions and exports exact Phone and Desktop PNGs", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await createStudioSchedule(page);
  const preview = page.getByTestId("artboard-preview");
  await expect(preview).toHaveAttribute("data-target-width", "1080");
  await expect(preview).toHaveAttribute("data-target-height", "2400");

  await page.getByRole("button", { name: /Zoom in/i }).click();
  const phoneDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  const phone = await phoneDownload;
  expect(phone.suggestedFilename()).toBe("adzu-schedule-phone.png");
  expect(await pngDimensions(phone)).toEqual({ width: 1080, height: 2400 });

  await page.getByRole("button", { name: "Device", exact: true }).click();
  const horizontal = page.getByLabel("Horizontal schedule position");
  await horizontal.fill("80");
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect(preview).toHaveAttribute("data-target-width", "1920");
  await expect(preview).toHaveAttribute("data-target-height", "1080");
  await horizontal.fill("20");
  await page.getByRole("button", { name: "Phone", exact: true }).click();
  await expect(horizontal).toHaveValue("80");
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect(horizontal).toHaveValue("20");

  const desktopDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  const desktop = await desktopDownload;
  expect(desktop.suggestedFilename()).toBe("adzu-schedule-desktop.png");
  expect(await pngDimensions(desktop)).toEqual({ width: 1920, height: 1080 });
});

test("Studio edits title and class inclusion without deleting the class", async ({
  page,
}) => {
  await createStudioSchedule(page, "KEEP 1");
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await expect(page.getByLabel("Hide days without classes")).toBeChecked();
  await page.getByLabel("Show title").uncheck();
  await expect(page.getByLabel("Title text")).toBeDisabled();
  await page.getByLabel("Show title").check();
  await page.getByLabel("Title text").fill("First Semester");
  await page.getByLabel("Title text").blur();
  await expect(page.getByLabel("Title text")).toHaveValue("First Semester");

  await page.getByRole("button", { name: "Classes", exact: true }).click();
  await page.getByRole("checkbox", { name: "Included" }).click();
  await expect(page.getByText(/Not included · 1/i)).toBeVisible();
  await expect(page.getByText("KEEP 1")).toBeVisible();
  await page.getByRole("checkbox", { name: "Include in schedule" }).click();
  await expect(page.getByText(/Included · 1/i)).toBeVisible();

  await page.getByRole("button", { name: "Device", exact: true }).click();
  await expect(page.getByLabel("Snap to guides")).toBeChecked();
  await page.getByLabel("Snap to guides").uncheck();
  await expect(page.getByLabel("Snap to guides")).not.toBeChecked();
});

test("mobile Studio keeps the artboard visible and uses bottom tool panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createStudioSchedule(page, "MOBILE 1");
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Device" })).toBeVisible();
  await expect(page.getByLabel("Vertical schedule position")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("Clean Slate Cards visual fixtures remain deterministic", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "VISUAL 1", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const preview = page.getByTestId("artboard-preview");
  await expect(preview).toHaveScreenshot("phone-cards-clean-5-days-title.png", {
    animations: "disabled",
  });
  expect(await exportedPng(page)).toMatchSnapshot(
    "phone-cards-clean-5-days-title-target.png",
  );
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByLabel("Show title").uncheck();
  await expect(preview).toHaveScreenshot(
    "phone-cards-clean-5-days-no-title.png",
    {
      animations: "disabled",
    },
  );
  expect(await exportedPng(page)).toMatchSnapshot(
    "phone-cards-clean-5-days-no-title-target.png",
  );
  await page.getByLabel("Show title").check();
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Desktop", exact: true }).click();
  await expect(preview).toHaveScreenshot(
    "desktop-cards-clean-5-days-title.png",
    {
      animations: "disabled",
    },
  );
  expect(await exportedPng(page)).toMatchSnapshot(
    "desktop-cards-clean-5-days-title-target.png",
  );
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByLabel("Hide days without classes").uncheck();
  await expect(preview).toHaveScreenshot("desktop-cards-clean-full-week.png", {
    animations: "disabled",
  });
  expect(await exportedPng(page)).toMatchSnapshot(
    "desktop-cards-clean-full-week-target.png",
  );
});

test("Phone Cards remain legible at a narrow phone editor width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createStudioSchedule(page, "PHONE 1", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  await expect(page.getByTestId("artboard-preview")).toHaveScreenshot(
    "phone-cards-clean-5-days-display-390.png",
    { animations: "disabled" },
  );
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
