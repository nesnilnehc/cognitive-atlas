#!/usr/bin/env node
import fs from "node:fs";
import vm from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ILLUSTRATION_CONFIG } from "../data/illustration-config.js";
import { MODEL_ILLUSTRATION_PATHS } from "../data/illustration-paths.generated.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "data/model-library.js");

function loadModelLibrary() {
  const content = fs.readFileSync(dataPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(content, sandbox);
  return sandbox.window.MODEL_LIBRARY_ROWS || [];
}

const EXPECTED_BY_CATEGORY = {
  Expression: new Set(["flow", "funnel", "steps"]),
  Structure: new Set(["tree", "grid", "matrix", "flow"]),
  Diagnosis: new Set(["fishbone", "tree", "flow", "matrix", "grid", "loop"]),
  Strategy: new Set(["matrix", "funnel", "loop", "flow", "grid", "tree", "curve", "steps"]),
  Meta: new Set(["loop", "curve", "pyramid", "grid", "flow", "tree", "steps"])
};

const SEMANTIC_OVERRIDES = {
  "4MAT": "matrix",
  "9-Grid Thinking": "grid",
  "Issue Tree": "tree",
  "Decision Tree": "tree",
  "AIDA": "funnel",
  "AARRR": "funnel",
  "OODA Loop": "loop",
  "PDCA": "loop",
  "Flywheel": "loop",
  "Minimum Viable Product": "pyramid",
  "Maslow's Hierarchy": "pyramid",
  "Dreyfus Model": "steps",
  "Ebbinghaus Forgetting Curve": "curve",
  "Kotter's 8 Steps": "steps",
  "Tuckman Model": "steps",
  "Logical Levels": "pyramid",
  "Bloom's Taxonomy": "pyramid"
};

const TEMPLATE_KIND = new Map([
  ["matrix_2x2", "matrix"], ["matrix_grid", "matrix"], ["matrix_payoff", "matrix"], ["venn_2", "matrix"], ["venn_3", "matrix"],
  ["flow_linear", "flow"], ["flow_gate", "flow"], ["chain_vertical", "flow"], ["chain_consequence", "flow"], ["arrows_opposing", "flow"], ["list_compare", "flow"], ["list_checklist", "flow"], ["stack_folders", "flow"], ["target_zone", "flow"], ["formula", "flow"], ["formula_fraction", "flow"], ["point_intersect", "flow"], ["filter_simple", "flow"], ["mirror", "flow"], ["lever", "flow"], ["gauge", "flow"], ["chart_curve", "flow"], ["scale_balance", "flow"], ["timeline_future", "flow"], ["shield_layers", "flow"],
  ["pyramid", "pyramid"], ["pyramid_slice", "pyramid"], ["steps_up", "steps"], ["ladder", "steps"],
  ["loop_cycle", "loop"], ["loop_double", "loop"], ["loop_reinforce", "loop"], ["loop_figure8", "loop"], ["loop_reflection", "loop"],
  ["funnel", "funnel"],
  ["tree_branch", "tree"], ["flow_tree", "tree"], ["tree_roots", "tree"], ["fishbone", "fishbone"],
  ["grid_3x3", "grid"], ["star_6", "grid"], ["hex_6", "grid"], ["table", "grid"], ["radar", "grid"], ["network_nodes", "grid"], ["network_mesh", "grid"], ["grid_connected", "grid"], ["swarm", "grid"], ["brain_map", "grid"], ["symbol_yin_yang", "grid"],
  ["curve_bell", "curve"], ["curve_fat_tail", "curve"], ["curve_power_law", "curve"], ["curve_wave", "curve"], ["chart_value_curve", "curve"], ["chart_forgetting", "curve"], ["chart_decay", "curve"], ["chart_convex", "curve"], ["radial_5", "curve"], ["iceberg", "curve"], ["bar_80_20", "curve"], ["spiral_up", "curve"]
]);

function suggestionLabel(kind) {
  return {
    matrix: "2×2 矩阵",
    grid: "网格结构",
    tree: "树状结构",
    funnel: "漏斗/阶段流",
    loop: "循环/环",
    pyramid: "金字塔/阶梯",
    steps: "步骤流",
    curve: "曲线",
    flow: "线性流程",
    fishbone: "鱼骨因果"
  }[kind] || kind;
}

function fallbackKindByCategory(category) {
  if (category === "Expression") return "flow";
  if (category === "Structure") return "grid";
  if (category === "Diagnosis") return "fishbone";
  if (category === "Strategy") return "matrix";
  if (category === "Meta") return "loop";
  return "default";
}

function main() {
  const rows = loadModelLibrary();
  const missingAssets = [];
  const configFallback = [];
  const semanticMismatches = [];

  for (const row of rows) {
    const [name, aliasZh, , category] = row;
    const path = MODEL_ILLUSTRATION_PATHS[name];
    if (!path || !fs.existsSync(join(root, path))) {
      missingAssets.push({ name, aliasZh, path: path || "(missing path mapping)" });
    }

    const config = ILLUSTRATION_CONFIG[name];
    const currentKind = config?.template
      ? (TEMPLATE_KIND.get(config.template) || "default")
      : fallbackKindByCategory(category);
    if (!config?.template) configFallback.push({ name, aliasZh, category, currentKind });
    const expected = SEMANTIC_OVERRIDES[name];
    if (expected && currentKind !== expected) {
      semanticMismatches.push({ name, aliasZh, category, currentKind, expected });
      continue;
    }

    if (!expected) {
      const allow = EXPECTED_BY_CATEGORY[category];
      if (allow && !allow.has(currentKind)) {
        semanticMismatches.push({ name, aliasZh, category, currentKind, expected: "category-default" });
      }
    }
  }

  console.log("=== 资源缺失 ===\n");
  for (const m of missingAssets) {
    console.log(`${m.name} (${m.aliasZh})`);
    console.log(`  path: ${m.path}\n`);
  }

  console.log("=== 使用类别兜底模板（建议后续补 config）===\n");
  for (const m of configFallback) {
    console.log(`${m.name} (${m.aliasZh})`);
    console.log(`  Category: ${m.category} → 兜底: ${suggestionLabel(m.currentKind)}\n`);
  }

  console.log("\n=== 语义不匹配 ===\n");
  for (const m of semanticMismatches) {
    console.log(`${m.name} (${m.aliasZh})`);
    console.log(`  Category: ${m.category} → 当前: ${suggestionLabel(m.currentKind)}`);
    console.log(`  建议: ${m.expected === "category-default" ? "按类别模板复核" : suggestionLabel(m.expected)}\n`);
  }

  const mismatches = [];
  mismatches.push(...missingAssets, ...semanticMismatches);
  console.log(`\n合计: ${mismatches.length} 个问题，${rows.length - mismatches.length} 个可接受`);
}

main();
