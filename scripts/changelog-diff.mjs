#!/usr/bin/env node
/**
 * 从 git diff data/model-library.js 提取模型级变更，生成可粘贴到 changelog 的 markdown 表格行。
 * Usage: node scripts/changelog-diff.mjs
 *        npm run changelog:diff
 */

import { execSync } from "node:child_process";

const FILE = "data/model-library.js";
const ROW_REGEX = /^\s*[+-]\s*\[\s*"([^"]+)"\s*,/;

let diffOutput;
try {
    diffOutput = execSync(`git diff --no-color ${FILE}`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
} catch (e) {
    diffOutput = e.stdout || "";
}

const lines = diffOutput.split("\n");
const added = new Map();  // name -> line
const removed = new Map(); // name -> line

for (const line of lines) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    const m = line.match(ROW_REGEX);
    if (!m) continue;
    const name = m[1];
    if (line.startsWith("+")) {
        if (!line.startsWith("+++")) added.set(name, line);
    } else if (line.startsWith("-")) {
        if (!line.startsWith("---")) removed.set(name, line);
    }
}

const today = new Date().toISOString().slice(0, 10);
const modified = [];
const addedOnly = [];
const removedOnly = [];

for (const [name] of added) {
    if (removed.has(name)) {
        modified.push(name);
    } else {
        addedOnly.push(name);
    }
}
for (const [name] of removed) {
    if (!added.has(name)) removedOnly.push(name);
}

const rows = [];
for (const name of addedOnly) rows.push({ name, type: "added" });
for (const name of modified) rows.push({ name, type: "modified" });
for (const name of removedOnly) rows.push({ name, type: "removed" });

if (rows.length === 0) {
    console.log("# No model-level changes detected in diff");
    process.exit(0);
}

console.log("# Changelog lines (paste into docs/changelog/model-library-changelog.md, then edit '原因/摘要')\n");
for (const { name, type } of rows) {
    console.log(`| ${today} | ${name} | ${type} | (manual) |`);
}
