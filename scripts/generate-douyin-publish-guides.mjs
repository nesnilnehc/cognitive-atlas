#!/usr/bin/env node
/**
 * Generate douyin-publish-{slug}-phase1.md for all models.
 * Pattern follows docs/guides/douyin-publish-mece-phase1.md
 *
 * Usage: node scripts/generate-douyin-publish-guides.mjs
 * Output: docs/guides/douyin-publish-{slug}-phase1.md
 */
import fs from "node:fs";
import vm from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "data/model-library.js");
const guidesDir = join(root, "docs/guides");
const baseUrl = "https://cognitive-atlas.nesnilnehc.top";

function loadModelLibrary() {
  const content = fs.readFileSync(dataPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  return sandbox.window.MODEL_LIBRARY_ROWS || [];
}

function toSlug(name) {
  return name
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

const HOOK_OVERRIDES = {
  OKR: ["目标难落地？OKR 帮你对齐关键成果", "OKR 目标管理法，团队对齐神器"],
  "5 Whys": ["根因找不到？五问帮你挖到底", "问题反复出？五问根因法一次捋清"],
  "5W1H": ["分析总漏项？六问帮你补全维度", "What-Why-Who-When-Where-How，一次问全"],
  SWOT: ["优劣势看不清？SWOT 四象限帮你梳理", "战略分析入门，从 SWOT 开始"],
  PDCA: ["改进行动没闭环？PDCA 帮你迭代", "计划执行检查处理，持续改进四步法"],
  "Eisenhower Matrix": ["事情太多？四象限帮你排优先级", "紧急重要傻傻分不清？四象限搞定"],
  "Pareto Principle": ["精力分散？80/20 法则帮你聚焦", "帕累托法则：少数关键决定多数结果"],
  "First Principles": ["被惯性思维困住？第一性原理破局", "马斯克都在用的第一性原理思考"],
  "Design Thinking": ["创新没思路？设计思维以人为本", "设计思维：从用户出发做产品"],
  "Lean Startup": ["试错成本高？精益创业快速验证", "精益创业：用最小成本验证假设"],
  "Issue Tree": ["问题拆不干净？问题树帮你分层", "问题树：麦肯锡式问题拆解"],
  "Fishbone Diagram": ["根因散乱？鱼骨图帮你归类", "鱼骨图：因果分析结构化"],
  "Feynman Technique": ["学完就忘？费曼学习法帮你真懂", "费曼学习法：能讲清楚才是真学会"],
  "Growth Mindset": ["怕失败？成长型思维让你敢试", "成长型思维：能力是可以发展的"],
};

/** Derive title hooks and hashtags from model data */
function deriveContent([name, aliasZh, descriptionEn, category]) {
  const slug = toSlug(name);
  const encodedName = encodeURIComponent(name);

  const hooks = HOOK_OVERRIDES[name] || generateHooks(name, aliasZh, descriptionEn, category);
  const short = (s, max = 35) => (s.length > max ? s.slice(0, max - 1) : s);
  const hashtags = generateHashtags(name, aliasZh, category);

  return {
    slug,
    name,
    aliasZh,
    encodedName,
    title1: short(hooks[0]),
    title2: short(hooks[1] || hooks[0]),
    hashtags,
    commentUrl: `${baseUrl}/cognitive-model-3d.html?model=${encodedName}`,
  };
}

function generateHooks(name, aliasZh, descriptionEn, category) {
  const short = (s, max = 35) => (s.length > max ? s.slice(0, max - 1) : s);
  const defaults = [
    short(`${aliasZh}，帮你一次捋清`),
    short(`${name}：${aliasZh}，思维升级必备`),
  ];
  const catHooks = {
    Expression: [`表达没逻辑？用${name}结构化`, `讲不清？${aliasZh}帮你搭框架`],
    Structure: [`分析缺维度？${aliasZh}帮你补全`, `问题拆得乱？${aliasZh}一次捋清`],
    Diagnosis: [`根因找不到？${aliasZh}帮你追问`, `失效防不住？用${aliasZh}系统排查`],
    Strategy: [`决策没依据？${aliasZh}帮你量化`, `优先级乱？${aliasZh}帮你排序`],
    Meta: [`思维卡住了？${aliasZh}帮你破局`, `认知升级，从${aliasZh}开始`],
  };
  const cat = catHooks[category];
  if (cat) {
    return [short(cat[0]), short(cat[1])];
  }
  return defaults;
}

function generateHashtags(name, aliasZh, category) {
  const base = "#思维模型 #认知工具箱";
  const nameTag = name.includes(" ") ? `#${name.replace(/\s+/g, "")}` : `#${name}`;
  const catTags = {
    Expression: "#表达 #结构化表达",
    Structure: "#结构化思维 #问题分析",
    Diagnosis: "#根因分析 #诊断方法",
    Strategy: "#战略分析 #决策思维",
    Meta: "#元认知 #思维升级",
  };
  return `${base} ${nameTag} ${catTags[category] || "#认知"}`;
}

function generateMarkdown(data) {
  return `# ${data.name} 第一期 — 抖音发布内容

**Date:** 2026-03-09  
**Scope:** ${data.aliasZh} 竖卡首发 — 可直接拷贝

---

默认落地页：\`${baseUrl}\`。模板说明见 [抖音发布模板](douyin-publish-template.md)。

---

## 标题（选一，≤35 字）

\`\`\`
${data.title1}
\`\`\`

或

\`\`\`
${data.title2}
\`\`\`

---

## 话题

\`\`\`
${data.hashtags}
\`\`\`

---

## 评论置顶

\`\`\`
完整定义、用法和关联模型戳这里 →
${data.commentUrl}
\`\`\`
`;
}

function main() {
  const rows = loadModelLibrary();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const [name] = row;
    const slug = toSlug(name);
    if (slug === "mece") {
      skipped++;
      continue;
    }
    const data = deriveContent(row);
    const outPath = join(guidesDir, `douyin-publish-${slug}-phase1.md`);
    const md = generateMarkdown(data);
    fs.writeFileSync(outPath, md, "utf8");
    created++;
    console.log(`Created: douyin-publish-${slug}-phase1.md`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (MECE exists).`);
}

main();
