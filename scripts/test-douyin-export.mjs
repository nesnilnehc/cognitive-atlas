#!/usr/bin/env node
/**
 * E2E test: 竖卡导出
 * Requires: server running (e.g. python3 -m http.server 8001) or uses inline static server
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
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

async function run() {
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
      setTimeout(() => reject(new Error("Download timeout 10s")), 10000);
    });

    await page.goto(`${baseUrl}/cognitive-model-3d.html?model=MECE`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForFunction(() => {
      const title = document.querySelector("#modelContent .model-name")?.textContent?.trim() || "";
      return title.includes("MECE");
    }, { timeout: 10000 });

    await page.click("#dockAdvancedSummary");
    await page.waitForSelector("#exportDouyinCardBtn", { state: "visible", timeout: 5000 });

    const disabled = await page.getAttribute("#exportDouyinCardBtn", "disabled");
    assert.equal(disabled, null, "Export Douyin card btn should be enabled when model selected");

    await page.click("#exportDouyinCardBtn");

    const downloadPath = await downloadPromise;
    assert.ok(downloadPath, "Expected download to trigger");

    const buf = await readFile(downloadPath);
    assert.ok(buf.length > 1000, "Expected PNG size > 1KB");
    assert.ok(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e, "Expected PNG magic bytes");

    console.log("Douyin card export: OK (PNG downloaded, valid)");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error("Douyin export test failed:", err.message);
  process.exit(1);
});
