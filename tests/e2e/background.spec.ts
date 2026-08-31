import { expect, test, type Page } from "@playwright/test";

async function createStudioSchedule(page: Page, code: string) {
  await page.goto("/create/manual");
  const form = page.locator("form").first();
  await form.getByLabel("Subject code").fill(code);
  for (const day of ["Mon", "Wed", "Fri"])
    await form.getByText(day, { exact: true }).click();
  await form.getByLabel("Start time").fill("08:00");
  await form.getByLabel("End time").fill("09:30");
  await form.getByRole("button", { name: "Add class" }).click();
  await page.getByRole("link", { name: /Review schedule/i }).click();
  await page.getByRole("button", { name: /Start designing/i }).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.getByTestId("artboard-preview")).toBeVisible();
}

async function openDesign(page: Page) {
  await page.getByRole("button", { name: "Design", exact: true }).click();
  await expect(
    page.getByRole("radiogroup", { name: "Background mode" }),
  ).toBeVisible();
}

async function openTargetPicker(page: Page) {
  await page.getByRole("button", { name: "Device", exact: true }).click();
  await page.getByRole("button", { name: "Change device" }).click();
  await expect(
    page.getByRole("dialog", { name: "Choose a device" }),
  ).toBeVisible();
}

async function choosePreset(
  page: Page,
  _category: "Phone" | "Desktop",
  name: RegExp,
) {
  await openTargetPicker(page);
  await page.getByRole("button", { name }).click();
}

async function uploadBackground(page: Page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, "#79BBD1");
    gradient.addColorStop(0.52, "#D7C8E8");
    gradient.addColorStop(1, "#F4B99B");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 800);
    context.globalAlpha = 0.32;
    context.fillStyle = "#FFFFFF";
    context.beginPath();
    context.arc(210, 180, 170, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#304866";
    context.beginPath();
    context.arc(970, 610, 250, 0, Math.PI * 2);
    context.fill();
    return canvas.toDataURL("image/png");
  });
  await page.getByLabel("Choose background image").setInputFiles({
    name: "abstract-background.png",
    mimeType: "image/png",
    buffer: Buffer.from(dataUrl.split(",")[1]!, "base64"),
  });
  await expect(
    page.getByRole("radio", { name: "Image", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
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

function pngDimensions(png: Buffer) {
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

test("Background modes expose previews and contextual resets", async ({
  page,
}) => {
  await createStudioSchedule(page, "BG MODES");
  await openDesign(page);

  await page.getByRole("radio", { name: "Solid", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Reset Solid background" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Gradient", exact: true }).click();
  await expect(
    page.getByRole("radiogroup", { name: "Gradient direction" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Pattern", exact: true }).click();
  for (const type of ["dots", "grid", "checker", "diagonal", "emoji"])
    await expect(page.getByTestId(`pattern-preview-${type}`)).toBeVisible();
  await page.getByRole("button", { name: "Reset Pattern background" }).click();
  await expect(
    page.getByRole("radio", { name: "Dots", exact: true }),
  ).toHaveAttribute("aria-checked", "true");

  const incorrectClickableCursors = await page
    .locator(
      'button:not(:disabled), a[href], summary, select:not(:disabled), [role="button"]:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"]), input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled), input[type="range"]:not(:disabled)',
    )
    .evaluateAll((elements) =>
      elements
        .filter((element) => getComputedStyle(element).cursor !== "pointer")
        .map((element) => ({
          cursor: getComputedStyle(element).cursor,
          label:
            element.getAttribute("aria-label") ??
            element.textContent?.trim().slice(0, 60) ??
            element.tagName,
        })),
    );
  expect(incorrectClickableCursors).toEqual([]);
  await expect(page.getByLabel("Background HEX")).toHaveCSS("cursor", "text");
});

test("Image adjustment has explicit controls and independent phone and desktop crops", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await createStudioSchedule(page, "BG CROP");
  await openDesign(page);
  await uploadBackground(page);

  const preview = page.getByTestId("artboard-preview");
  await page.getByRole("button", { name: "Adjust background" }).click();
  await expect(preview).toHaveAttribute("data-background-adjusting", "true");
  await expect(
    preview.getByRole("status").filter({ hasText: "Adjusting background" }),
  ).toBeVisible();
  await page.getByRole("slider", { name: "Zoom" }).fill("1.5");
  await expect(page.getByText("150%", { exact: true })).toBeVisible();

  const phoneBox = await preview.boundingBox();
  expect(phoneBox).not.toBeNull();
  await page.mouse.move(
    phoneBox!.x + phoneBox!.width / 2,
    phoneBox!.y + phoneBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    phoneBox!.x + phoneBox!.width / 2 + 40,
    phoneBox!.y + phoneBox!.height / 2 + 55,
    { steps: 6 },
  );
  await page.mouse.up();
  const movedPhoneX = Number(
    await preview.getAttribute("data-background-position-x"),
  );
  const movedPhoneY = Number(
    await preview.getAttribute("data-background-position-y"),
  );
  expect(movedPhoneX).not.toBe(0.5);
  expect(movedPhoneY).not.toBe(0.5);

  await page.getByRole("button", { name: "Center image" }).click();
  await expect(preview).toHaveAttribute("data-background-position-x", "0.5");
  await expect(preview).toHaveAttribute("data-background-position-y", "0.5");
  await expect(preview).toHaveAttribute("data-background-zoom", "1.5");
  await page.keyboard.press("Escape");
  await expect(preview).toHaveAttribute("data-background-adjusting", "false");

  await choosePreset(page, "Desktop", /Desktop Full HD/);
  await expect(preview).toHaveAttribute("data-target-width", "1920");
  await expect(preview).toHaveAttribute("data-background-position-x", "0.5");
  await expect(preview).toHaveAttribute("data-background-zoom", "1");
  await openDesign(page);
  await page.getByRole("button", { name: "Adjust background" }).click();
  await page.getByRole("slider", { name: "Zoom" }).fill("2");
  const desktopBox = await preview.boundingBox();
  expect(desktopBox).not.toBeNull();
  await page.mouse.move(
    desktopBox!.x + desktopBox!.width / 2,
    desktopBox!.y + desktopBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    desktopBox!.x + desktopBox!.width / 2 - 45,
    desktopBox!.y + desktopBox!.height / 2 - 30,
    { steps: 6 },
  );
  await page.mouse.up();
  const desktopX = Number(
    await preview.getAttribute("data-background-position-x"),
  );
  expect(desktopX).not.toBe(0.5);
  await page.getByRole("button", { name: "Done", exact: true }).click();

  await choosePreset(page, "Phone", /Android Phone/);
  await expect(preview).toHaveAttribute("data-target-width", "1080");
  await expect(preview).toHaveAttribute("data-background-position-x", "0.5");
  await expect(preview).toHaveAttribute("data-background-position-y", "0.5");
  await expect(preview).toHaveAttribute("data-background-zoom", "1.5");
});

test("Gradient, emoji, image overlay, and Cards Glass preview and PNG baselines stay aligned", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await createStudioSchedule(page, "BG PARITY");
  await openDesign(page);
  const preview = page.getByTestId("artboard-preview");

  await page.getByRole("radio", { name: "Gradient", exact: true }).click();
  await page.getByLabel("Color 1 HEX").fill("#E9F4FF");
  await page.getByLabel("Color 2 HEX").fill("#FFE9F2");
  await page.getByRole("radio", { name: "Top left to bottom right" }).click();
  await expect(preview).toHaveScreenshot("background-gradient-preview.png", {
    animations: "disabled",
  });
  expect(await exportedPng(page)).toMatchSnapshot(
    "background-gradient-target.png",
  );

  await page.getByRole("radio", { name: "Pattern", exact: true }).click();
  await page.getByRole("radio", { name: "Diagonal", exact: true }).click();
  await expect(preview).toHaveScreenshot("background-diagonal-preview.png", {
    animations: "disabled",
  });
  expect(await exportedPng(page)).toMatchSnapshot(
    "background-diagonal-target.png",
  );

  await page.getByRole("radio", { name: "Emoji", exact: true }).click();
  await expect(preview).toHaveScreenshot("background-emoji-preview.png", {
    animations: "disabled",
  });
  expect(await exportedPng(page)).toMatchSnapshot(
    "background-emoji-target.png",
  );

  await uploadBackground(page);
  await page.getByRole("radio", { name: "dark", exact: true }).click();
  await page.getByRole("radio", { name: "Glass", exact: true }).click();
  await expect(preview).toHaveScreenshot(
    "background-image-dark-glass-preview.png",
    { animations: "disabled" },
  );
  expect(await exportedPng(page)).toMatchSnapshot(
    "background-image-dark-glass-target.png",
  );
});

test("Minimum-spacing pattern exports at the largest supported canvas", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await createStudioSchedule(page, "BG MAX");
  await openTargetPicker(page);
  await page.getByLabel("Custom width").fill("5120");
  await page.getByLabel("Custom height").fill("3125");
  await page.getByRole("button", { name: "Use custom size" }).click();
  await openDesign(page);
  await page.getByRole("radio", { name: "Pattern", exact: true }).click();
  await page.getByRole("radio", { name: "Dots", exact: true }).click();
  await page.getByLabel("Spacing").fill("0.02");

  const startedAt = Date.now();
  const png = await exportedPng(page);
  expect(pngDimensions(png)).toEqual({ width: 5120, height: 3125 });
  expect(Date.now() - startedAt).toBeLessThan(60_000);
});
