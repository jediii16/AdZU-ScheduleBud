// Mechanical exports of the approved artwork. No runtime image generation.
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const brand = "public/brand";
await sharp("hero.svg")
  .resize(1920, 1080)
  .webp({ quality: 90, effort: 6 })
  .toFile(`${brand}/hero.webp`);
const logo = await readFile(`${brand}/schedulebud-logo-on-light.svg`);
for (const [size, name] of [
  [32, "icon-32.png"],
  [180, "apple-touch-icon.png"],
]) {
  const mark = await sharp(logo)
    .resize(Math.round(size * 0.78), Math.round(size * 0.78), { fit: "inside" })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(`${brand}/${name}`);
}
const copy =
  Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f7f9fc"/>
  <rect width="1200" height="12" fill="#007cff"/>
  <g font-family="Arial, sans-serif" fill="#182335">
    <text x="126" y="109" font-size="36" font-weight="700">Schedule<tspan fill="#007cff">Bud</tspan></text>
    <text x="60" y="220" font-size="50" font-weight="700">Your schedule.</text>
    <text x="60" y="282" font-size="50" font-weight="700">Your wallpaper.</text>
    <text x="60" y="349" font-size="24">Personalized class schedule wallpapers</text>
    <text x="60" y="386" font-size="24">for phone, tablet, laptop, and desktop.</text>
    <text x="60" y="520" font-size="20" fill="#526078">Built for Ateneo de Zamboanga University students.</text>
    <text x="60" y="567" font-size="18" fill="#007cff">adzu-schedulebud.vercel.app</text>
  </g>
</svg>`);
await sharp(copy)
  .composite([
    {
      input: await sharp(logo)
        .resize(52, 50, { fit: "inside" })
        .png()
        .toBuffer(),
      left: 60,
      top: 67,
    },
    {
      input: await sharp("hero.svg").resize(680, 383).png().toBuffer(),
      left: 510,
      top: 140,
    },
  ])
  .png()
  .toFile(`${brand}/social-preview.png`);
