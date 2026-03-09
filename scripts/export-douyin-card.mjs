#!/usr/bin/env node
/**
 * Export douyin vertical card for a cognitive model.
 *
 * Usage:
 *   npm run export:douyin-card
 *   npm run export:douyin-card -- Issue Tree
 *   node scripts/export-douyin-card.mjs MECE
 *
 * Output: docs/assets/douyin/cognitive-atlas-douyin-{model-slug}-{date}.png
 */
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml; charset=utf-8"
};

function createStaticServer(rootDir) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === "/") pathname = "/index.html";
      const targetPath = path.join(rootDir, path.normalize(pathname).replace(/^(\.\.(\/|\\))+/, ""));
      if (!targetPath.startsWith(rootDir)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const buf = await readFile(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(buf);
    } catch (e) {
      res.writeHead(e?.code === "ENOENT" ? 404 : 500).end();
    }
  });
}

function toSlug(name) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

async function main() {
  const modelName = process.argv[2] || "Issue Tree";
  const encodedModel = encodeURIComponent(modelName);
  const slug = toSlug(modelName);
  const date = new Date().toISOString().slice(0, 10);
  const outputDir = path.join(projectRoot, "docs", "assets", "douyin");
  const outputPath = path.join(outputDir, `cognitive-atlas-douyin-${slug}-${date}.png`);

  await mkdir(outputDir, { recursive: true });

  const server = createStaticServer(projectRoot);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr?.port || 0}`;

  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle"] });

  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

    const downloadPromise = new Promise((resolve, reject) => {
      page.on("download", (d) => {
        d.path().then(resolve).catch(reject);
      });
      setTimeout(() => reject(new Error("Download timeout 30s")), 30000);
    });

    await page.goto(`${baseUrl}/cognitive-model-3d.html?model=${encodedModel}`, {
      waitUntil: "networkidle",
      timeout: 20000
    });

    await page.waitForFunction(
      () => {
        const title = document.querySelector("#modelContent .model-name")?.textContent?.trim() || "";
        return title && title.length > 0;
      },
      { timeout: 10000 }
    );

    await page.click("#dockAdvancedSummary");
    await page.waitForSelector("#exportDouyinCardBtn", { state: "visible", timeout: 5000 });

    const disabled = await page.getAttribute("#exportDouyinCardBtn", "disabled");
    if (disabled !== null) {
      throw new Error(`Export button disabled. Ensure model "${modelName}" is selected.`);
    }

    await page.click("#exportDouyinCardBtn");

    const downloadPath = await downloadPromise;
    if (!downloadPath) {
      throw new Error("Download did not trigger");
    }

    const buf = await readFile(downloadPath);
    if (buf.length < 1000) {
      throw new Error("Exported PNG too small");
    }
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e) {
      throw new Error("Exported file is not a valid PNG");
    }

    writeFileSync(outputPath, buf);
    console.log(`Saved: ${outputPath}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("Export failed:", err.message);
  process.exit(1);
});
