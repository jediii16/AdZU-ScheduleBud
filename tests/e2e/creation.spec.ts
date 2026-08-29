import { expect, test, type Download, type Page } from "@playwright/test";
import { resolve } from "node:path";

async function createStudioSchedule(
  page: Page,
  code = "STUDIO 1",
  days: readonly string[] = ["Mon"],
) {
  await page.goto("/create/manual");
  const form = page.locator("form").first();
  await form.getByLabel("Subject code").fill(code);
  for (const day of days) await form.getByText(day, { exact: true }).click();
  await form.getByLabel("Start time").fill("08:00");
  await form.getByLabel("End time").fill("09:30");
  await form.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await page.getByRole("button", { name: /Start designing/i }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
}

async function pngDimensions(download: Download) {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return pngBufferDimensions(Buffer.concat(chunks));
}

function pngBufferDimensions(png: Buffer) {
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

async function openTargetPicker(page: Page) {
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Change device" }).click();
  await expect(
    page.getByRole("dialog", { name: "Choose a device" }),
  ).toBeVisible();
  await expect(page.getByText("This project", { exact: true })).toHaveCount(0);
}

async function choosePreset(
  page: Page,
  category: "Phone" | "Tablet" | "Laptop" | "Desktop" | "Square",
  name: RegExp,
) {
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, category, name);
}

async function choosePresetFromOpenPicker(
  page: Page,
  category: "Phone" | "Tablet" | "Laptop" | "Desktop" | "Square",
  name: RegExp,
) {
  await page.getByRole("radio", { name: category, exact: true }).click();
  await page.getByRole("button", { name }).click();
}

async function switchToMinimal(page: Page) {
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByRole("radio", { name: "Minimal", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Minimal", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
}

async function switchToGrid(page: Page) {
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByRole("radio", { name: "Grid", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Grid", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
}

async function createGridStudioClasses(
  page: Page,
  classes: readonly {
    code: string;
    days: readonly string[];
    start: string;
    end: string;
    room?: string;
    professor?: string;
    section?: string;
  }[],
) {
  await page.goto("/create/manual");
  for (const input of classes) {
    const form = page.locator("form").first();
    await form.getByLabel("Subject code").fill(input.code);
    if (input.section) await form.getByLabel("Section").fill(input.section);
    for (const day of input.days) {
      await form.getByText(day, { exact: true }).click();
    }
    await form.getByLabel("Start time").fill(input.start);
    await form.getByLabel("End time").fill(input.end);
    if (input.room) await form.getByLabel(/^Room/).fill(input.room);
    if (input.professor)
      await form.getByLabel(/^Professor/).fill(input.professor);
    await form.getByRole("button", { name: "Add class" }).click();
  }
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(
    page.getByRole("heading", { name: "Make sure your schedule is correct." }),
  ).toBeVisible();
  const startDesigning = page.getByRole("button", {
    name: /Start designing/i,
  });
  if (await startDesigning.isVisible()) {
    await startDesigning.click();
  } else {
    await page.getByRole("button", { name: "Continue anyway" }).click();
    await page.getByRole("button", { name: "I understand — continue" }).click();
  }
  await expect(page).toHaveURL(/\/studio$/);
  await switchToGrid(page);
}

test("manual schedule creation reaches review", async ({ page }) => {
  await page.goto("/create/manual");
  await page.getByLabel("Subject code").fill("CS 201");
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
  await page.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "Fix issues" })).toBeVisible();
  await expect(
    footer.getByRole("button", { name: "Continue anyway" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      footer.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return box.bottom - window.innerHeight;
      }),
    )
    .toBeLessThanOrEqual(1);
  const placement = await footer.evaluate((element) => ({
    paddingBottom: Number.parseFloat(getComputedStyle(element).paddingBottom),
  }));
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
  const changeDevice = page.getByRole("button", { name: "Change device" });
  const switchOrientation = page.getByRole("button", {
    name: "Switch orientation",
  });
  await expect(switchOrientation).toBeVisible();
  const deviceButtonBox = await changeDevice.boundingBox();
  const orientationButtonBox = await switchOrientation.boundingBox();
  expect(deviceButtonBox).not.toBeNull();
  expect(orientationButtonBox).not.toBeNull();
  expect(Math.abs(deviceButtonBox!.y - orientationButtonBox!.y)).toBeLessThan(
    2,
  );
  const horizontal = page.getByLabel("Horizontal schedule position");
  await horizontal.fill("80");
  await changeDevice.click();
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(switchOrientation).toHaveCount(0);
  await expect(preview).toHaveAttribute("data-target-width", "1920");
  await expect(preview).toHaveAttribute("data-target-height", "1080");
  await horizontal.fill("20");
  await page.getByRole("button", { name: "Change device" }).click();
  await choosePresetFromOpenPicker(page, "Phone", /Generic FHD\+ Portrait/);
  await expect(switchOrientation).toBeVisible();
  await expect(horizontal).toHaveValue("80");
  await page.getByRole("button", { name: "Change device" }).click();
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(switchOrientation).toHaveCount(0);
  await expect(horizontal).toHaveValue("20");

  const desktopDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  const desktop = await desktopDownload;
  expect(desktop.suggestedFilename()).toBe("adzu-schedule-desktop.png");
  expect(await pngDimensions(desktop)).toEqual({ width: 1920, height: 1080 });
});

test("Studio zoom keeps the entire canvas reachable in both scroll directions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page);
  const workspace = page.getByTestId("artboard-workspace");
  const preview = page.getByTestId("artboard-preview");

  for (let step = 0; step < 5; step += 1)
    await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.getByText("150%", { exact: true })).toBeVisible();

  const overflow = await workspace.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);

  await workspace.evaluate((element) => element.scrollTo({ top: 0 }));
  await expect
    .poll(async () => {
      const workspaceBox = await workspace.boundingBox();
      const previewBox = await preview.boundingBox();
      if (!workspaceBox || !previewBox) return Number.NEGATIVE_INFINITY;
      return previewBox.y - workspaceBox.y;
    })
    .toBeGreaterThanOrEqual(0);

  await workspace.evaluate((element) =>
    element.scrollTo({ top: element.scrollHeight }),
  );
  await expect
    .poll(() => workspace.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await workspace.evaluate((element) => element.scrollTo({ top: 0 }));
  await expect
    .poll(() => workspace.evaluate((element) => element.scrollTop))
    .toBe(0);
});

test("Studio edits title and class inclusion without deleting the class", async ({
  page,
}) => {
  await createStudioSchedule(page, "KEEP 1");
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await expect(page.getByLabel("Hide days without classes")).toBeChecked();
  await expect(page.getByLabel("Subject code")).toHaveCount(0);
  for (const detail of ["Time", "Room", "Professor", "Section"]) {
    await expect(page.getByLabel(detail, { exact: true })).toBeVisible();
  }
  const titleInput = page.getByLabel("Title", { exact: true });
  const savedTitle = await titleInput.inputValue();
  await page.getByLabel("Show title").uncheck();
  await expect(titleInput).toHaveCount(0);
  await page.getByLabel("Show title").check();
  await expect(titleInput).toHaveValue(savedTitle);
  await titleInput.fill("First Semester");
  await titleInput.blur();
  await expect(titleInput).toHaveValue("First Semester");

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

test("Studio schedule selection appears on interaction and clears outside", async ({
  page,
}) => {
  await createStudioSchedule(page, "SELECT 1", ["Mon", "Tue"]);
  const preview = page.getByTestId("artboard-preview");
  const geometry = await preview.evaluate((element) => {
    const number = (name: string) =>
      Number(element.getAttribute(`data-${name}`) ?? "0");
    return {
      scale: number("preview-scale"),
      canvasWidth: number("target-width"),
      canvasHeight: number("target-height"),
      x: number("schedule-x"),
      y: number("schedule-y"),
      width: number("schedule-width"),
      height: number("schedule-height"),
    };
  });
  await preview.click({
    position: {
      x: (geometry.x + geometry.width / 2) * geometry.scale,
      y: (geometry.y + geometry.height / 2) * geometry.scale,
    },
  });
  await expect(preview).toHaveAttribute("data-schedule-selected", "true");

  const outside = [
    { x: 2, y: 2 },
    { x: geometry.canvasWidth - 2, y: 2 },
    { x: 2, y: geometry.canvasHeight - 2 },
  ].find(
    (point) =>
      point.x < geometry.x ||
      point.x > geometry.x + geometry.width ||
      point.y < geometry.y ||
      point.y > geometry.y + geometry.height,
  );
  expect(outside).toBeDefined();
  await preview.click({
    position: {
      x: outside!.x * geometry.scale,
      y: outside!.y * geometry.scale,
    },
  });
  await expect(preview).toHaveAttribute("data-schedule-selected", "false");
});

test("long class editing cannot scroll the Studio shell out of the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1905, height: 950 });
  await createStudioSchedule(page, "PORTAL 101");
  await page.getByRole("button", { name: "Classes", exact: true }).click();
  await page.getByText("Edit class", { exact: true }).click();
  for (let index = 0; index < 5; index += 1) {
    await page
      .getByRole("button", { name: "Duplicate class", exact: true })
      .click();
  }

  const inspector = page.getByTestId("studio-inspector");
  const workspace = page.getByTestId("artboard-workspace");
  const classRows = inspector.locator("article");
  await classRows.first().getByText("Edit class", { exact: true }).click();
  await classRows.nth(3).getByText("Edit class", { exact: true }).click();
  await expect(inspector).toBeVisible();
  expect(
    await inspector.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await inspector.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const shellBefore = await page.getByTestId("studio-shell").boundingBox();
  const workspaceBefore = await workspace.boundingBox();
  expect(shellBefore).not.toBeNull();
  expect(workspaceBefore).not.toBeNull();
  expect(shellBefore!.y).toBe(0);
  expect(shellBefore!.height).toBe(950);
  expect(
    await page.getByTestId("studio-shell").evaluate((element) => ({
      position: getComputedStyle(element).position,
      height: getComputedStyle(element).height,
      overflow: getComputedStyle(element).overflow,
    })),
  ).toEqual({ position: "fixed", height: "950px", overflow: "hidden" });
  expect(
    await page.evaluate(() => ({
      rootOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      rootScrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight,
    })),
  ).toEqual({
    rootOverflow: "hidden",
    bodyOverflow: "hidden",
    rootScrollHeight: 950,
    bodyScrollHeight: 950,
    viewportHeight: 950,
  });
  expect(
    await inspector.evaluate(
      (element) => getComputedStyle(element).overscrollBehaviorY,
    ),
  ).toBe("contain");
  expect(
    await workspace.evaluate(
      (element) => getComputedStyle(element).overscrollBehaviorY,
    ),
  ).toBe("contain");

  await classRows.nth(3).getByText("Sat", { exact: true }).click();
  await expect(
    classRows.nth(3).getByRole("checkbox", { name: "Sat", exact: true }),
  ).toBeChecked();
  const shellAfter = await page.getByTestId("studio-shell").boundingBox();
  const workspaceAfter = await workspace.boundingBox();
  expect(shellAfter).not.toBeNull();
  expect(workspaceAfter).not.toBeNull();
  expect(shellAfter!.y).toBe(0);
  expect(shellAfter!.height).toBe(950);
  expect(workspaceAfter!.height).toBe(workspaceBefore!.height);
  await classRows.nth(3).getByText("Edit class", { exact: true }).click();
  await classRows.nth(4).getByText("Edit class", { exact: true }).click();
  await classRows.nth(4).getByText("Fri", { exact: true }).click();
  await expect(
    classRows.nth(4).getByRole("checkbox", { name: "Fri", exact: true }),
  ).toBeChecked();
  const shellAfterFifth = await page.getByTestId("studio-shell").boundingBox();
  expect(shellAfterFifth).not.toBeNull();
  expect(shellAfterFifth!.y).toBe(0);
  expect(shellAfterFifth!.height).toBe(950);
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("mobile Studio keeps the artboard visible and uses bottom tool panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createStudioSchedule(page, "MOBILE 1");
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Device", exact: true }),
  ).toBeVisible();
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
  await page.getByRole("button", { name: "Change device" }).click();
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
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

test("multi-device picker creates Tablet and custom Phone variants and preserves positions", async ({
  page,
}) => {
  await createStudioSchedule(page, "TARGET 1", ["Mon", "Tue", "Wed"]);
  await openTargetPicker(page);
  await page.getByRole("radio", { name: "Tablet" }).click();
  await page.getByRole("button", { name: /Generic 4:3 Portrait/ }).click();
  await expect(page.getByTestId("artboard-preview")).toHaveAttribute(
    "data-target-width",
    "1536",
  );
  await page.getByLabel("Horizontal schedule position").fill("25");

  await page.getByRole("button", { name: "Change device" }).click();
  await page.getByRole("radio", { name: "Phone", exact: true }).click();
  await page.getByLabel("Custom width").fill("1170");
  await page.getByLabel("Custom height").fill("2532");
  await page.getByRole("button", { name: "Use custom size" }).click();
  await expect(page.getByTestId("artboard-preview")).toHaveAttribute(
    "data-target-width",
    "1170",
  );
  await page.getByRole("button", { name: "Change device" }).click();
  await choosePresetFromOpenPicker(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(page.getByLabel("Horizontal schedule position")).toHaveValue(
    "25",
  );
});

test("Match My Screen uses dimensions locally and persists a guide only when requested", async ({
  page,
}) => {
  await createStudioSchedule(page, "MATCH 1", ["Mon", "Tue"]);
  await openTargetPicker(page);
  await page.getByRole("button", { name: "Match My Screen" }).click();
  await expect(
    page.getByRole("button", { name: "Upload screenshot" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Screen screenshot", { exact: true }),
  ).toHaveClass(/sr-only/);
  await page
    .getByLabel("Screen screenshot", { exact: true })
    .setInputFiles(
      resolve(
        "tests/e2e/creation.spec.ts-snapshots/phone-cards-clean-5-days-title-target-chromium-win32.png",
      ),
    );
  await expect(
    page.getByText("1080 × 2400", { exact: true }).last(),
  ).toBeVisible();
  await page.getByLabel("Use as preview guide").check();
  await page.getByRole("button", { name: "Use screenshot dimensions" }).click();
  await expect(page.getByRole("button", { name: "My screen" })).toBeVisible();
  await expect(page.getByLabel("Guide opacity")).toBeVisible();
  await page.getByRole("button", { name: "Remove screen guide" }).click();
  await expect(page.getByRole("button", { name: "My screen" })).toHaveCount(0);
});

test("generic lock-screen safe areas report overlap and Tablet exports exact dimensions", async ({
  page,
}) => {
  await createStudioSchedule(page, "SAFE 1", ["Mon", "Tue", "Wed"]);
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Lock screen" }).click();
  await page.getByLabel("Show safe areas").check();
  await page.getByLabel("Vertical schedule position").fill("0");
  await expect(page.getByText(/covered|blocked system area/)).toBeVisible();
  await page.getByRole("button", { name: "Change device" }).click();
  await page.getByRole("radio", { name: "Tablet" }).click();
  await page.getByRole("button", { name: /Generic 4:3 Landscape/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await download)).toEqual({
    width: 2048,
    height: 1536,
  });
});

test("mobile target picker remains a usable sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createStudioSchedule(page, "PICKER 1");
  await openTargetPicker(page);
  await expect(
    page.getByRole("dialog", { name: "Choose a device" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Square" }).click();
  await expect(page.getByRole("button", { name: /Square 1080/ })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Choose a device" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Change device" }),
  ).toBeFocused();
});

test("device preview environments remain visually restrained", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "DEVICE 1", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const preview = page.getByTestId("artboard-preview");
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Lock screen" }).click();
  await expect(preview).toHaveScreenshot("phone-lock-screen-preview.png", {
    animations: "disabled",
  });
  await page.getByLabel("Show safe areas").check();
  await expect(preview).toHaveScreenshot("phone-safe-area-preview.png", {
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Change device" }).click();
  await page.getByRole("radio", { name: "Tablet" }).click();
  await page.getByRole("button", { name: /Generic 4:3 Portrait/ }).click();
  await expect(preview).toHaveScreenshot("tablet-cards-preview.png", {
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Change device" }).click();
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await page.getByRole("button", { name: "Windows" }).click();
  await expect(preview).toHaveScreenshot("desktop-windows-preview.png", {
    animations: "disabled",
  });
  await page.getByRole("button", { name: "macOS" }).click();
  await expect(preview).toHaveScreenshot("desktop-macos-preview.png", {
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Change device" }).click();
  await page.getByRole("button", { name: "Match My Screen" }).click();
  await page
    .getByLabel("Screen screenshot")
    .setInputFiles(
      resolve(
        "tests/e2e/creation.spec.ts-snapshots/phone-cards-clean-5-days-title-target-chromium-win32.png",
      ),
    );
  await page.getByLabel("Use as preview guide").check();
  await page.getByRole("button", { name: "Use screenshot dimensions" }).click();
  await expect(preview).toHaveScreenshot("my-screen-guide-preview.png", {
    animations: "disabled",
  });
});

test("Minimal layout switches, shares editor behavior, and exports exact target sizes", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "MINIMAL 1", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  await expect(
    page.getByLabel("Clean Slate automatic subject colors"),
  ).toBeVisible();
  await switchToMinimal(page);
  await expect(
    page.getByLabel("Clean Slate automatic subject colors"),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("radio", { name: "Cards", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByLabel("Clean Slate automatic subject colors"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(
    page.getByRole("radio", { name: "Minimal", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByLabel("Clean Slate automatic subject colors"),
  ).toHaveCount(0);

  await page.getByLabel("Show title").uncheck();
  await page.getByLabel("Show title").check();
  await page.getByLabel("Title", { exact: true }).fill("First Semester");
  await page.getByLabel("Title", { exact: true }).blur();
  await page.getByLabel("Hide days without classes").uncheck();
  await page.getByLabel("Hide days without classes").check();

  const preview = page.getByTestId("artboard-preview");
  const geometry = await preview.evaluate((element) => ({
    scale: Number(element.getAttribute("data-preview-scale")),
    x: Number(element.getAttribute("data-schedule-x")),
    y: Number(element.getAttribute("data-schedule-y")),
    width: Number(element.getAttribute("data-schedule-width")),
    height: Number(element.getAttribute("data-schedule-height")),
    canvasWidth: Number(element.getAttribute("data-target-width")),
    canvasHeight: Number(element.getAttribute("data-target-height")),
  }));
  const previewBox = await preview.boundingBox();
  expect(previewBox).not.toBeNull();
  const start = {
    x: previewBox!.x + (geometry.x + geometry.width / 2) * geometry.scale,
    y: previewBox!.y + (geometry.y + geometry.height / 2) * geometry.scale,
  };
  const delta = {
    x:
      (geometry.canvasWidth / 2 - geometry.width / 2 - geometry.x) *
      geometry.scale,
    y:
      (geometry.canvasHeight / 2 - geometry.height / 2 - geometry.y) *
      geometry.scale,
  };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 8 });
  await expect(preview).toHaveAttribute("data-dragging", "true");
  await expect(preview).toHaveAttribute("data-guide-vertical", "true");
  await expect(preview).toHaveAttribute("data-guide-horizontal", "true");
  await page.mouse.up();
  await expect(preview).toHaveAttribute("data-dragging", "false");

  const phoneDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await phoneDownload)).toEqual({
    width: 1080,
    height: 2400,
  });

  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Lock screen" }).click();
  await page.getByLabel("Show safe areas").check();
  await page.getByLabel("Vertical schedule position").fill("0");
  await expect(page.getByText(/covered|blocked system area/)).toBeVisible();

  await choosePreset(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(preview).toHaveAttribute("data-target-width", "1536");
  await choosePreset(page, "Square", /Square 1080/);
  await expect(preview).toHaveAttribute("data-target-width", "1080");
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  const desktopDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await desktopDownload)).toEqual({
    width: 1920,
    height: 1080,
  });

  await choosePreset(page, "Phone", /Generic FHD\+ Portrait/);
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Change device" }).click();
  await page.getByRole("radio", { name: "Phone", exact: true }).click();
  await page.getByLabel("Custom width").fill("1170");
  await page.getByLabel("Custom height").fill("2532");
  await page.getByRole("button", { name: "Use custom size" }).click();
  const customDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await customDownload)).toEqual({
    width: 1170,
    height: 2532,
  });
});

test("Minimal visual baselines cover dense, sparse, long, and target-specific compositions", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "MIN 501", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  await switchToMinimal(page);
  const preview = page.getByTestId("artboard-preview");

  await expect(preview).toHaveScreenshot(
    "phone-minimal-clean-5-days-title.png",
    { animations: "disabled" },
  );
  const phoneTarget = await exportedPng(page);
  expect(pngBufferDimensions(phoneTarget)).toEqual({
    width: 1080,
    height: 2400,
  });
  expect(phoneTarget).toMatchSnapshot(
    "phone-minimal-clean-5-days-title-target.png",
  );
  await page.getByLabel("Show title").uncheck();
  await expect(preview).toHaveScreenshot(
    "phone-minimal-clean-5-days-no-title.png",
    { animations: "disabled" },
  );
  await page.getByLabel("Show title").check();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview).toHaveScreenshot(
    "phone-minimal-clean-display-390.png",
    { animations: "disabled" },
  );
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByRole("button", { name: "Device", exact: true }).click();
  await choosePreset(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(preview).toHaveScreenshot("tablet-portrait-minimal-clean.png", {
    animations: "disabled",
  });
  const tabletPortraitTarget = await exportedPng(page);
  expect(pngBufferDimensions(tabletPortraitTarget)).toEqual({
    width: 1536,
    height: 2048,
  });
  expect(tabletPortraitTarget).toMatchSnapshot(
    "tablet-portrait-minimal-clean-target.png",
  );
  await choosePreset(page, "Tablet", /Generic 4:3 Landscape/);
  await expect(preview).toHaveScreenshot("tablet-landscape-minimal-clean.png", {
    animations: "disabled",
  });
  const tabletLandscapeTarget = await exportedPng(page);
  expect(pngBufferDimensions(tabletLandscapeTarget)).toEqual({
    width: 2048,
    height: 1536,
  });
  expect(tabletLandscapeTarget).toMatchSnapshot(
    "tablet-landscape-minimal-clean-target.png",
  );
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-minimal-clean-5-days.png", {
    animations: "disabled",
  });
  const desktopTarget = await exportedPng(page);
  expect(pngBufferDimensions(desktopTarget)).toEqual({
    width: 1920,
    height: 1080,
  });
  expect(desktopTarget).toMatchSnapshot(
    "desktop-minimal-clean-5-days-target.png",
  );
  await choosePreset(page, "Square", /Square 1080/);
  await expect(preview).toHaveScreenshot("square-minimal-clean-5-days.png", {
    animations: "disabled",
  });
  const squareTarget = await exportedPng(page);
  expect(pngBufferDimensions(squareTarget)).toEqual({
    width: 1080,
    height: 1080,
  });
  expect(squareTarget).toMatchSnapshot(
    "square-minimal-clean-5-days-target.png",
  );

  await createStudioSchedule(page, "MIN 301", ["Mon", "Wed", "Fri"]);
  await switchToMinimal(page);
  await expect(preview).toHaveScreenshot("phone-minimal-clean-3-days.png", {
    animations: "disabled",
  });
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-minimal-clean-3-days.png", {
    animations: "disabled",
  });
  const sparseDesktopTarget = await exportedPng(page);
  expect(pngBufferDimensions(sparseDesktopTarget)).toEqual({
    width: 1920,
    height: 1080,
  });
  expect(sparseDesktopTarget).toMatchSnapshot(
    "desktop-minimal-clean-3-days-target.png",
  );

  await createStudioSchedule(page, "MIN 601", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  await switchToMinimal(page);
  await choosePreset(page, "Tablet", /Generic 4:3 Landscape/);
  await expect(preview).toHaveScreenshot(
    "tablet-landscape-minimal-clean-6-days.png",
    { animations: "disabled" },
  );
  const packedTabletLandscapeTarget = await exportedPng(page);
  expect(pngBufferDimensions(packedTabletLandscapeTarget)).toEqual({
    width: 2048,
    height: 1536,
  });
  expect(packedTabletLandscapeTarget).toMatchSnapshot(
    "tablet-landscape-minimal-clean-6-days-target.png",
  );
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-minimal-clean-6-days.png", {
    animations: "disabled",
  });
  const packedDesktopTarget = await exportedPng(page);
  expect(pngBufferDimensions(packedDesktopTarget)).toEqual({
    width: 1920,
    height: 1080,
  });
  expect(packedDesktopTarget).toMatchSnapshot(
    "desktop-minimal-clean-6-days-target.png",
  );

  await page.goto("/create/manual");
  const longForm = page.locator("form").first();
  await longForm.getByLabel("Subject code").fill("LONG 401");
  await longForm.getByLabel("Section").fill("Research and Development A");
  for (const day of ["Mon", "Thu"]) {
    await longForm.getByText(day, { exact: true }).click();
  }
  await longForm.getByLabel("Start time").fill("08:00");
  await longForm.getByLabel("End time").fill("09:30");
  await longForm.getByLabel(/^Room/).fill("Advanced Computing Laboratory");
  await longForm
    .getByLabel(/^Professor/)
    .fill("Professor With A Deliberately Long Display Name");
  await longForm.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await page.getByRole("button", { name: /Start designing/i }).click();
  await switchToMinimal(page);
  await expect(preview).toHaveScreenshot(
    "phone-minimal-clean-long-content.png",
    { animations: "disabled" },
  );
  const longPhoneTarget = await exportedPng(page);
  expect(pngBufferDimensions(longPhoneTarget)).toEqual({
    width: 1080,
    height: 2400,
  });
  expect(longPhoneTarget).toMatchSnapshot(
    "phone-minimal-clean-long-content-target.png",
  );

  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(
    `<main style="margin:0;background:#f7f8fa"><img aria-label="Phone wallpaper at display size" style="display:block;width:390px;height:auto" src="data:image/png;base64,${phoneTarget.toString("base64")}"></main>`,
  );
  await expect(
    page.getByRole("img", { name: "Phone wallpaper at display size" }),
  ).toHaveScreenshot("phone-minimal-clean-export-display-390.png", {
    animations: "disabled",
  });
});

test("mobile Studio switches between Cards and Minimal without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createStudioSchedule(page, "MOBILE MIN", ["Mon", "Tue", "Wed"]);
  await switchToMinimal(page);
  await page.getByRole("radio", { name: "Cards", exact: true }).click();
  await page.getByRole("radio", { name: "Minimal", exact: true }).click();
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("Grid shares Studio controls, history, guides, safe areas, and exact export", async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "GRID 501", [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  await switchToGrid(page);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(
    page.getByRole("radio", { name: "Cards", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(
    page.getByRole("radio", { name: "Grid", exact: true }),
  ).toHaveAttribute("aria-checked", "true");

  await page.getByLabel("Show title").uncheck();
  await page.getByLabel("Show title").check();
  await page.getByLabel("Hide days without classes").uncheck();
  await page.getByLabel("Hide days without classes").check();
  await expect(page.getByText("Subject code", { exact: true })).toBeVisible();
  await expect(page.getByText("Always shown", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Larger Grid devices only", { exact: true }),
  ).toHaveCount(1);
  const detailsGroup = page.getByRole("group", { name: "Class details" });
  const timePosition = await detailsGroup
    .getByText("Time", { exact: true })
    .boundingBox();
  const roomPosition = await detailsGroup
    .getByText("Room", { exact: true })
    .boundingBox();
  expect(timePosition).not.toBeNull();
  expect(roomPosition).not.toBeNull();
  expect(timePosition!.y).toBeLessThan(roomPosition!.y);
  await expect(page.getByLabel("Room")).toBeChecked();
  await expect(page.getByLabel("Time")).not.toBeChecked();
  await detailsGroup.getByText("Room", { exact: true }).click();
  await expect(page.getByLabel("Room")).not.toBeChecked();
  await detailsGroup.getByText("Room", { exact: true }).click();
  await expect(page.getByLabel("Room")).toBeChecked();
  await page.getByLabel("Time").check();
  await expect(page.getByRole("checkbox", { name: "Professor" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Professor" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Section" })).toHaveCount(0);

  const preview = page.getByTestId("artboard-preview");
  const geometry = await preview.evaluate((element) => ({
    scale: Number(element.getAttribute("data-preview-scale")),
    x: Number(element.getAttribute("data-schedule-x")),
    y: Number(element.getAttribute("data-schedule-y")),
    width: Number(element.getAttribute("data-schedule-width")),
    height: Number(element.getAttribute("data-schedule-height")),
    canvasWidth: Number(element.getAttribute("data-target-width")),
    canvasHeight: Number(element.getAttribute("data-target-height")),
  }));
  const previewBox = await preview.boundingBox();
  expect(previewBox).not.toBeNull();
  const start = {
    x: previewBox!.x + (geometry.x + geometry.width / 2) * geometry.scale,
    y: previewBox!.y + (geometry.y + geometry.height / 2) * geometry.scale,
  };
  const delta = {
    x:
      (geometry.canvasWidth / 2 - geometry.width / 2 - geometry.x) *
      geometry.scale,
    y:
      (geometry.canvasHeight / 2 - geometry.height / 2 - geometry.y) *
      geometry.scale,
  };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + delta.x, start.y + delta.y, { steps: 8 });
  await expect(preview).toHaveAttribute("data-guide-vertical", "true");
  await expect(preview).toHaveAttribute("data-guide-horizontal", "true");
  await page.mouse.up();

  const phoneDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await phoneDownload)).toEqual({
    width: 1080,
    height: 2400,
  });

  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Lock screen" }).click();
  await page.getByLabel("Show safe areas").check();
  await page.getByLabel("Vertical schedule position").fill("0");
  await expect(page.getByText(/covered|blocked system area/)).toBeVisible();

  await choosePreset(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(preview).toHaveAttribute("data-target-width", "1536");
  await choosePreset(page, "Tablet", /Generic 4:3 Landscape/);
  await expect(preview).toHaveAttribute("data-target-width", "2048");
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Professor" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Section" })).toBeVisible();
  const desktopDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export|Download again/i }).click();
  expect(await pngDimensions(await desktopDownload)).toEqual({
    width: 1920,
    height: 1080,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Grid", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("Square Grid keeps class details when the title is visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createGridStudioClasses(page, [
    {
      code: "WEBPROG",
      days: ["Mon", "Thu"],
      start: "14:00",
      end: "15:20",
      room: "ADV LAB",
      professor: "Tan, Cristel Jade DS.",
      section: "A",
    },
    {
      code: "MATMOD",
      days: ["Mon", "Thu"],
      start: "15:30",
      end: "16:50",
      room: "S402",
      professor: "Fajardo, Erborne G.",
      section: "M",
    },
    {
      code: "FFP.1n",
      days: ["Tue", "Fri"],
      start: "09:30",
      end: "10:50",
      room: "S402",
      professor: "Baguio, Joey James",
      section: "U",
    },
    {
      code: "COMPROG1",
      days: ["Tue", "Fri"],
      start: "12:30",
      end: "13:50",
      room: "S401",
      professor: "Cañedo, Fe Grace T.",
      section: "A",
    },
    {
      code: "COMPINTRO",
      days: ["Tue", "Fri"],
      start: "17:00",
      end: "18:20",
      room: "BC405",
      professor: "Galvez, Ylman Nayr A.",
      section: "A",
    },
    {
      code: "PATHFIT1n",
      days: ["Wed"],
      start: "08:00",
      end: "10:00",
      room: "MPCC",
      professor: "Francisco, Noldan King S.",
      section: "U",
    },
  ]);
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await choosePreset(page, "Square", /Square 1080/);

  const target = await exportedPng(page);
  expect(pngBufferDimensions(target)).toEqual({ width: 1080, height: 1080 });
  expect(target).toMatchSnapshot("square-grid-title-details-target.png");
});

test("Square Planner keeps dense titled panels inside the export", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createGridStudioClasses(page, [
    {
      code: "WEBPROG",
      days: ["Mon", "Thu"],
      start: "14:00",
      end: "15:20",
      room: "ADV LAB",
      professor: "Tan, Cristel Jade DS.",
      section: "A",
    },
    {
      code: "MATMOD",
      days: ["Mon", "Thu"],
      start: "15:30",
      end: "16:50",
      room: "S402",
      professor: "Fajardo, Erborne G.",
      section: "M",
    },
    {
      code: "FFP.1n",
      days: ["Tue", "Fri"],
      start: "09:30",
      end: "10:50",
      room: "S402",
      professor: "Baguio, Joey James",
      section: "U",
    },
    {
      code: "COMPROG1",
      days: ["Tue", "Wed", "Fri"],
      start: "12:30",
      end: "13:50",
      room: "S401",
      professor: "Cañedo, Fe Grace T.",
      section: "A",
    },
    {
      code: "COMPINTRO",
      days: ["Tue", "Fri"],
      start: "17:00",
      end: "18:20",
      room: "BC405",
      professor: "Galvez, Ylman Nayr A.",
      section: "A",
    },
    {
      code: "PATHFIT1n",
      days: ["Wed"],
      start: "08:00",
      end: "10:00",
      room: "MPCC",
      professor: "Francisco, Noldan King S.",
      section: "U",
    },
    {
      code: "NSTP2",
      days: ["Tue", "Fri"],
      start: "19:00",
      end: "20:20",
      room: "FWS",
      professor: "Santos, Maria L.",
      section: "B",
    },
  ]);
  await page.getByRole("radio", { name: "Planner", exact: true }).click();
  await page.getByRole("radio", { name: /Midnight/ }).click();
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await choosePreset(page, "Square", /Square 1080/);

  const target = await exportedPng(page);
  expect(pngBufferDimensions(target)).toEqual({ width: 1080, height: 1080 });
  expect(target).toMatchSnapshot("square-planner-dense-title-target.png");
});

test("Grid visual baselines cover target families, temporal range, and overlaps", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createGridStudioClasses(page, [
    {
      code: "CS.412",
      days: ["Mon", "Thu"],
      start: "08:00",
      end: "09:30",
      room: "ICT 301",
      professor: "Prof. Rivera",
      section: "A",
    },
    {
      code: "COMPINTRO",
      days: ["Tue", "Fri"],
      start: "10:15",
      end: "11:45",
      room: "ADV LAB",
      professor: "Professor With A Deliberately Long Display Name",
    },
    {
      code: "PATHFIT1n",
      days: ["Wed"],
      start: "14:00",
      end: "16:00",
      room: "Gymnasium",
    },
  ]);
  const preview = page.getByTestId("artboard-preview");
  await expect(preview).toHaveScreenshot("phone-grid-clean-5-days-title.png", {
    animations: "disabled",
  });
  const phoneTarget = await exportedPng(page);
  expect(pngBufferDimensions(phoneTarget)).toEqual({
    width: 1080,
    height: 2400,
  });
  expect(phoneTarget).toMatchSnapshot(
    "phone-grid-clean-5-days-title-target.png",
  );
  await page.getByLabel("Show title").uncheck();
  await expect(preview).toHaveScreenshot(
    "phone-grid-clean-5-days-no-title.png",
    { animations: "disabled" },
  );
  await page.getByLabel("Show title").check();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview).toHaveScreenshot("phone-grid-clean-display-390.png", {
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByRole("button", { name: "Device", exact: true }).click();
  await choosePreset(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(preview).toHaveScreenshot(
    "tablet-portrait-grid-clean-5-days.png",
    { animations: "disabled" },
  );
  await choosePreset(page, "Tablet", /Generic 4:3 Landscape/);
  await expect(preview).toHaveScreenshot(
    "tablet-landscape-grid-clean-5-days.png",
    { animations: "disabled" },
  );
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-grid-clean-5-days.png", {
    animations: "disabled",
  });
  const desktopTarget = await exportedPng(page);
  expect(pngBufferDimensions(desktopTarget)).toEqual({
    width: 1920,
    height: 1080,
  });
  expect(desktopTarget).toMatchSnapshot("desktop-grid-clean-5-days-target.png");
  await choosePreset(page, "Square", /Square 1080/);
  await expect(preview).toHaveScreenshot("square-grid-clean-5-days.png", {
    animations: "disabled",
  });

  await createGridStudioClasses(page, [
    {
      code: "GRID 601",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      start: "09:00",
      end: "10:30",
    },
  ]);
  await expect(preview).toHaveScreenshot("phone-grid-clean-6-days.png", {
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await choosePreset(page, "Tablet", /Generic 4:3 Portrait/);
  await expect(preview).toHaveScreenshot(
    "tablet-portrait-grid-clean-6-days.png",
    { animations: "disabled" },
  );
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-grid-clean-6-days.png", {
    animations: "disabled",
  });

  await createGridStudioClasses(page, [
    {
      code: "SPARSE 301",
      days: ["Mon", "Wed", "Fri"],
      start: "13:00",
      end: "15:00",
    },
  ]);
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-grid-clean-3-days.png", {
    animations: "disabled",
  });

  await createGridStudioClasses(page, [
    {
      code: "EARLY",
      days: ["Mon", "Wed"],
      start: "07:30",
      end: "09:00",
    },
    {
      code: "LATE",
      days: ["Tue", "Thu", "Fri"],
      start: "19:15",
      end: "20:45",
    },
  ]);
  await expect(preview).toHaveScreenshot("phone-grid-clean-long-range.png", {
    animations: "disabled",
  });

  await createGridStudioClasses(page, [
    {
      code: "CS.412",
      days: ["Mon"],
      start: "08:00",
      end: "10:00",
      room: "Advanced Computing Laboratory",
    },
    {
      code: "COMPINTRO",
      days: ["Mon"],
      start: "08:30",
      end: "09:45",
    },
    {
      code: "PATHFIT1n",
      days: ["Mon"],
      start: "09:00",
      end: "10:15",
    },
  ]);
  await expect(preview).toHaveScreenshot("phone-grid-clean-overlap.png", {
    animations: "disabled",
  });
  await openTargetPicker(page);
  await choosePresetFromOpenPicker(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveScreenshot("desktop-grid-clean-overlap.png", {
    animations: "disabled",
  });

  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(
    `<main style="margin:0;background:#f7f8fa"><img aria-label="Grid phone wallpaper at display size" style="display:block;width:390px;height:auto" src="data:image/png;base64,${phoneTarget.toString("base64")}"></main>`,
  );
  await expect(
    page.getByRole("img", { name: "Grid phone wallpaper at display size" }),
  ).toHaveScreenshot("phone-grid-clean-export-display-390.png", {
    animations: "disabled",
  });
});
