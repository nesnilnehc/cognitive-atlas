#!/usr/bin/env node
/**
 * Export promo image for ModelSpace 3D view.
 *
 * Requires:
 * 1. Local server running (e.g. python3 -m http.server 8080)
 * 2. playwright: npx playwright install chromium
 *
 * Usage:
 *   npm run export-promo
 *   # or: node scripts/export-promo-image.mjs
 *
 * Output: docs/assets/modelspace-promo.png
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outputPath = join(root, "docs/assets/modelspace-promo.png");
const baseUrl = process.env.EXPORT_BASE_URL || "http://localhost:8080";

async function main() {
  await mkdir(dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 2560, height: 1440 });

  try {
    console.log(`Loading ${baseUrl}/cognitive-model-3d.html ...`);
    await page.goto(`${baseUrl}/cognitive-model-3d.html`, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    await page.waitForSelector("#viewPromoBtn", { timeout: 10000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    await page.click("#viewPromoBtn");
    await page.waitForTimeout(1200);

    const dataUrl = await page.evaluate(async () => {
      if (typeof window.__getPromoExportDataUrl !== "function") {
        throw new Error("Export hook not found. Is the app loaded?");
      }
      return window.__getPromoExportDataUrl();
    });

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    writeFileSync(outputPath, Buffer.from(base64, "base64"));
    console.log(`Saved: ${outputPath}`);
  } catch (err) {
    console.error("Export failed:", err.message);
    if (err.message?.includes("net::ERR_CONNECTION_REFUSED")) {
      console.error("\nStart the server first: python3 -m http.server 8080");
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
