import { expect, test } from "@playwright/test";

test("launch metadata includes canonical branding and a usable social image", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    "ScheduleBud — AdZU Schedule Wallpaper Generator",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https:\/\/adzu-schedulebud\.vercel\.app\/?$/,
  );
  const image = page.locator('meta[property="og:image"]');
  await expect(image).toHaveAttribute(
    "content",
    /\/brand\/social-preview\.png$/,
  );
  const response = await request.get(
    new URL((await image.getAttribute("content"))!).pathname,
  );
  expect(response.ok()).toBeTruthy();
  const png = await response.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  for (const asset of ["/brand/icon-32.png", "/brand/apple-touch-icon.png"]) {
    expect((await request.get(asset)).ok()).toBeTruthy();
  }
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(
    "Sitemap: https://adzu-schedulebud.vercel.app/sitemap.xml",
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("https://adzu-schedulebud.vercel.app/create/manual");
  expect(xml).not.toContain("/studio");
  expect(xml).not.toContain("localhost");
});

test("production routes and public actions survive direct entry and refresh", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/create",
    "/create/portal",
    "/create/curriculum",
    "/create/manual",
    "/review",
    "/studio",
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(
      page.getByText("Loading ScheduleBud…", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Preparing Studio…", { exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("main")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("main")).toBeVisible();
    if (route === "/studio" || route === "/review") {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    } else {
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(
          `^https://adzu-schedulebud\\.vercel\\.app${route === "/" ? "/?" : route}$`,
        ),
      );
    }
  }
  await page.goto("/create");
  for (const path of ["portal", "curriculum", "manual"]) {
    await expect(page.locator(`a[href="/create/${path}"]`)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("launch Home remains reachable at representative widths and loads its assets", async ({
  page,
}, testInfo) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your schedule. Your wallpaper." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create my schedule" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${width}px overflow`,
    ).toBeTruthy();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.images].every(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        ),
      )
      .toBeTruthy();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () =>
          [...document.fonts].filter((font) => font.status === "error").length,
      ),
    ).toBe(0);
    if (width === 375 || width === 1440) {
      await page.screenshot({
        path: testInfo.outputPath(`home-${width}.png`),
        fullPage: true,
      });
    }
  }
  expect(failures).toEqual([]);
});

test("unknown routes offer a branded path Home", async ({ page }) => {
  expect((await page.goto("/not-a-schedulebud-route"))?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("link", { name: "Create my schedule" }),
  ).toBeVisible();
});
