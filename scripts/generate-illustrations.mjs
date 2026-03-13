import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ILLUSTRATION_CONFIG } from "../data/illustration-config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../docs/assets/illustrations");
const MODEL_LIB_PATH = path.join(__dirname, "../data/model-library.js");
const ILLUSTRATION_PATHS_FILE = path.join(__dirname, "../data/illustration-paths.generated.js");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const window = {};
new Function("window", fs.readFileSync(MODEL_LIB_PATH, "utf8"))(window);

const COLORS = {
  accent1: "#00f0ff",
  accent2: "#ff8c42",
  accent3: "#9d7bff",
  accent4: "#6b7b8c",
  bg: "#0d1520",
  panel: "#121c2a",
  line: "rgba(180,210,230,0.55)",
  text: "#dbe8f4",
  muted: "rgba(190,210,230,0.75)"
};

const MANUAL_SLUGS = new Set(["mece", "issue-tree", "fishbone-diagram"]);

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function frame(title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="${COLORS.bg}" />
  <rect x="28" y="28" width="744" height="744" rx="24" fill="${COLORS.panel}" stroke="${COLORS.line}" />
  <text x="400" y="78" text-anchor="middle" fill="${COLORS.muted}" font-size="26" font-family="Inter,Arial,sans-serif">${esc(title)}</text>
  ${body}
</svg>`;
}

function renderMatrix(config, modelName) {
  const labels = (config.labels || []).slice(0, 4);
  const baseCells = [
    { x: 120, y: 160, c: COLORS.accent1 },
    { x: 410, y: 160, c: COLORS.accent2 },
    { x: 120, y: 450, c: COLORS.accent3 },
    { x: 410, y: 450, c: COLORS.accent4 }
  ];
  const modelMeta = {
    "BCG Matrix": {
      tags: ["Q1", "Q2", "Q3", "Q4"],
      order: [0, 1, 2, 3],
      axis: ["Relative Market Share", "Market Growth Rate"]
    },
    "Eisenhower Matrix": {
      tags: ["Q1", "Q2", "Q3", "Q4"],
      order: [0, 1, 2, 3],
      axis: ["Urgency", "Importance"]
    },
    SWOT: {
      tags: ["S", "O", "W", "T"],
      order: [0, 2, 1, 3],
      axis: ["Internal / External", "Helpful / Harmful"]
    }
  }[modelName] || {
    tags: ["Q1", "Q2", "Q3", "Q4"],
    order: [0, 1, 2, 3],
    axis: config.axisLabels || ["X", "Y"]
  };
  const cells = baseCells.map((cell, idx) => ({
    ...cell,
    tag: modelMeta.tags[idx],
    label: labels[modelMeta.order[idx]] || `Q${idx + 1}`
  }));
  const axis = modelMeta.axis.map(esc);
  let axisHints = "";
  if (modelName === "BCG Matrix") {
    axisHints = `<text x="250" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">High Share</text>
  <text x="560" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">Low Share</text>
  <text x="78" y="580" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,580)">Low</text>
  <text x="78" y="260" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,260)">High</text>`;
  } else if (modelName === "Eisenhower Matrix") {
    axisHints = `<text x="250" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">Urgent</text>
  <text x="560" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">Not Urgent</text>
  <text x="78" y="580" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,580)">Not Important</text>
  <text x="78" y="260" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,260)">Important</text>`;
  } else if (modelName === "SWOT") {
    axisHints = `<text x="250" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">Internal</text>
  <text x="560" y="744" text-anchor="middle" fill="${COLORS.muted}" font-size="16">External</text>
  <text x="78" y="580" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,580)">Harmful</text>
  <text x="78" y="260" text-anchor="middle" fill="${COLORS.muted}" font-size="16" transform="rotate(-90 78,260)">Helpful</text>`;
  }
  const nodes = cells.map((cell, idx) => {
    const label = esc(cell.label);
    return `<rect x="${cell.x}" y="${cell.y}" width="270" height="270" rx="16" fill="${cell.c}" fill-opacity="0.18" stroke="${cell.c}" />
    <circle cx="${cell.x + 34}" cy="${cell.y + 34}" r="20" fill="${cell.c}" fill-opacity="0.9" />
    <text x="${cell.x + 34}" y="${cell.y + 41}" text-anchor="middle" fill="#0d1520" font-size="14">${cell.tag}</text>
    <text x="${cell.x + 135}" y="${cell.y + 145}" text-anchor="middle" fill="${COLORS.text}" font-size="24" font-family="Inter,Arial,sans-serif">${label}</text>`;
  }).join("\n");
  return `${nodes}
  <line x1="400" y1="150" x2="400" y2="730" stroke="${COLORS.line}" />
  <line x1="110" y1="440" x2="690" y2="440" stroke="${COLORS.line}" />
  <text x="400" y="772" text-anchor="middle" fill="${COLORS.muted}" font-size="20">${axis[0]}</text>
  <text x="52" y="440" text-anchor="middle" fill="${COLORS.muted}" font-size="20" transform="rotate(-90 52,440)">${axis[1]}</text>
  ${axisHints}`;
}

function renderFlow(config, modelName) {
  const labels = (config.labels || []).slice(0, 6);
  if (modelName === "5 Whys") {
    const n = Math.max(labels.length, 5);
    const stepH = 108;
    let body = `<text x="120" y="166" fill="${COLORS.muted}" font-size="16">Symptom</text>
    <text x="640" y="166" fill="${COLORS.muted}" font-size="16">Root Cause</text>`;
    for (let i = 0; i < n; i++) {
      const y = 170 + i * stepH;
      const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4, COLORS.accent1][i % 5];
      const x = 170 + i * 28;
      const w = 460 - i * 40;
      const label = esc(labels[i] || (i === n - 1 ? "Root Cause" : "Why?"));
      body += `<rect x="${x}" y="${y}" width="${w}" height="76" rx="14" fill="${c}" fill-opacity="0.22" stroke="${c}" />
      <text x="${x + w / 2}" y="${y + 48}" text-anchor="middle" fill="${COLORS.text}" font-size="22">${label}</text>
      <circle cx="${x + 24}" cy="${y + 24}" r="12" fill="${c}" />
      <text x="${x + 24}" y="${y + 29}" text-anchor="middle" fill="#0d1520" font-size="11">${i + 1}</text>`;
      if (i < n - 1) {
        body += `<line x1="${x + w / 2}" y1="${y + 80}" x2="${x + w / 2}" y2="${y + stepH - 8}" stroke="${COLORS.line}" />
        <polygon points="${x + w / 2 - 6},${y + stepH - 18} ${x + w / 2 + 6},${y + stepH - 18} ${x + w / 2},${y + stepH - 8}" fill="${COLORS.line}" />`;
      }
    }
    return body;
  }
  const row = chunks(labels, 3);
  const startY = row.length === 1 ? 360 : 250;
  let body = "";
  row.forEach((group, rIdx) => {
    const y = startY + rIdx * 210;
    const w = 180;
    const gap = 50;
    const total = group.length * w + (group.length - 1) * gap;
    const startX = (800 - total) / 2;
    group.forEach((label, idx) => {
      const x = startX + idx * (w + gap);
      const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][(rIdx * 3 + idx) % 4];
      body += `<rect x="${x}" y="${y}" width="${w}" height="86" rx="12" fill="${c}" fill-opacity="0.2" stroke="${c}" />
      <text x="${x + w / 2}" y="${y + 53}" text-anchor="middle" fill="${COLORS.text}" font-size="22">${esc(label)}</text>`;
      if (idx < group.length - 1) {
        body += `<line x1="${x + w + 10}" y1="${y + 43}" x2="${x + w + gap - 10}" y2="${y + 43}" stroke="${COLORS.line}" />
        <polygon points="${x + w + gap - 12},${y + 37} ${x + w + gap - 12},${y + 49} ${x + w + gap - 2},${y + 43}" fill="${COLORS.line}" />`;
      }
    });
  });
  return body;
}

function renderPyramid(config, modelName) {
  const labels = (config.labels || []).slice(0, 6).reverse();
  const layerH = 500 / Math.max(labels.length, 1);
  let body = "";
  if (modelName === "Maslow's Hierarchy") {
    body += `<text x="120" y="166" fill="${COLORS.muted}" font-size="16">Growth Needs</text>
    <text x="120" y="686" fill="${COLORS.muted}" font-size="16">Deficiency Needs</text>`;
  }
  labels.forEach((label, idx) => {
    const y1 = 640 - idx * layerH;
    const y2 = y1 - layerH;
    const p = idx + 1;
    const x1b = 100 + idx * 45;
    const x2b = 700 - idx * 45;
    const x1t = 100 + p * 45;
    const x2t = 700 - p * 45;
    const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][idx % 4];
    body += `<polygon points="${x1b},${y1} ${x2b},${y1} ${x2t},${y2} ${x1t},${y2}" fill="${c}" fill-opacity="${0.18 + idx * 0.08}" stroke="${c}" />
    <text x="400" y="${y2 + layerH / 2 + 8}" text-anchor="middle" fill="${COLORS.text}" font-size="22">${esc(label)}</text>`;
    body += `<circle cx="${x1b + 30}" cy="${y2 + 24}" r="13" fill="${c}" />
    <text x="${x1b + 30}" y="${y2 + 29}" text-anchor="middle" fill="#0d1520" font-size="11">${idx + 1}</text>`;
  });
  return body;
}

function renderLoop(config, modelName) {
  const labels = (config.labels || []).slice(0, 8);
  const n = Math.max(labels.length, 3);
  const cx = 400;
  const cy = 430;
  const radius = 200;
  let body = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${COLORS.line}" stroke-width="2" />`;
  if (modelName === "PDCA") {
    body += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="${COLORS.muted}" font-size="20">CONTINUOUS IMPROVEMENT</text>`;
  } else if (modelName === "OODA Loop") {
    body += `<text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="${COLORS.muted}" font-size="20">FAST DECISION CYCLE</text>`;
  }
  const points = [];
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][i % 4];
    points.push({ x, y });
    body += `<circle cx="${x}" cy="${y}" r="52" fill="${c}" fill-opacity="0.2" stroke="${c}" />
    <text x="${x}" y="${y + 7}" text-anchor="middle" fill="${COLORS.text}" font-size="18">${esc((labels[i] || `S${i + 1}`).slice(0, 12))}</text>`;
    body += `<circle cx="${x - 40}" cy="${y - 40}" r="14" fill="${c}" />
    <text x="${x - 40}" y="${y - 35}" text-anchor="middle" fill="#0d1520" font-size="12">${i + 1}</text>`;
  }
  for (let i = 0; i < n; i++) {
    const from = points[i];
    const to = points[(i + 1) % n];
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const vx = mx - cx;
    const vy = my - cy;
    const len = Math.hypot(vx, vy) || 1;
    const ox = (vx / len) * 28;
    const oy = (vy / len) * 28;
    const tx = mx + ox;
    const ty = my + oy;
    body += `<path d="M ${from.x} ${from.y} Q ${tx} ${ty} ${to.x} ${to.y}" fill="none" stroke="${COLORS.line}" stroke-width="2.4" />`;
    const ex = to.x + ((cx - to.x) / Math.hypot(cx - to.x, cy - to.y)) * 52;
    const ey = to.y + ((cy - to.y) / Math.hypot(cx - to.x, cy - to.y)) * 52;
    body += `<polygon points="${ex},${ey} ${ex - 10},${ey - 4} ${ex - 2},${ey - 12}" fill="${COLORS.line}" transform="rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI} ${ex} ${ey})" />`;
  }
  return body;
}

function renderFunnel(config, modelName) {
  const labels = (config.labels || []).slice(0, 6);
  const n = Math.max(labels.length, 3);
  const h = 470 / n;
  let body = "";
  if (modelName === "AIDA") {
    body += `<text x="120" y="166" fill="${COLORS.muted}" font-size="16">Audience Reach</text>
    <text x="620" y="166" fill="${COLORS.muted}" font-size="16">Intent Depth</text>`;
  }
  for (let i = 0; i < n; i++) {
    const y1 = 180 + i * h;
    const y2 = y1 + h;
    const w1 = 560 - i * 70;
    const w2 = 560 - (i + 1) * 70;
    const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][i % 4];
    body += `<polygon points="${400 - w1 / 2},${y1} ${400 + w1 / 2},${y1} ${400 + w2 / 2},${y2} ${400 - w2 / 2},${y2}" fill="${c}" fill-opacity="${0.22 + i * 0.1}" stroke="${c}" />
    <text x="400" y="${y1 + h / 2 + 8}" text-anchor="middle" fill="${COLORS.text}" font-size="22">${esc(labels[i] || `Step ${i + 1}`)}</text>
    <circle cx="${400 - w1 / 2 + 26}" cy="${y1 + 26}" r="13" fill="${c}" />
    <text x="${400 - w1 / 2 + 26}" y="${y1 + 31}" text-anchor="middle" fill="#0d1520" font-size="11">${i + 1}</text>`;
    if (modelName === "AIDA") {
      const pct = [100, 60, 30, 12][i];
      if (pct) {
        body += `<text x="${400 + w1 / 2 - 34}" y="${y1 + 32}" text-anchor="middle" fill="${COLORS.muted}" font-size="14">${pct}%</text>`;
      }
    }
  }
  return body;
}

function renderTree(config) {
  const labels = (config.labels || []).slice(0, 7);
  const root = esc(labels[0] || "Root");
  const children = labels.slice(1);
  const yRoot = 220;
  let body = `<rect x="300" y="${yRoot}" width="200" height="80" rx="12" fill="${COLORS.accent1}" fill-opacity="0.2" stroke="${COLORS.accent1}" />
  <text x="400" y="${yRoot + 50}" text-anchor="middle" fill="${COLORS.text}" font-size="24">${root}</text>`;
  const n = Math.max(children.length, 2);
  children.forEach((label, i) => {
    const x = 80 + (480 * i) / Math.max(n - 1, 1);
    const y = 500;
    const c = [COLORS.accent2, COLORS.accent3, COLORS.accent4, COLORS.accent1][i % 4];
    body += `<line x1="400" y1="${yRoot + 80}" x2="${x + 80}" y2="${y}" stroke="${COLORS.line}" />
    <rect x="${x}" y="${y}" width="160" height="76" rx="12" fill="${c}" fill-opacity="0.2" stroke="${c}" />
    <text x="${x + 80}" y="${y + 48}" text-anchor="middle" fill="${COLORS.text}" font-size="20">${esc(label)}</text>`;
  });
  return body;
}

/**
 * Ishikawa / Fishbone diagram: head (Effect) faces right, causes extend left as fishbones.
 * Ref: https://en.wikipedia.org/wiki/Ishikawa_diagram
 * 5 Ms (manufacturing): Manpower, Machine, Material, Method, Measurement.
 */
function renderFishbone(config, modelName) {
  const labels = (config.labels || []).slice(0, 8);
  let body = `<line x1="140" y1="430" x2="650" y2="430" stroke="${COLORS.line}" stroke-width="5" />
  <polygon points="650,420 690,430 650,440" fill="${COLORS.line}" />
  <rect x="692" y="398" width="84" height="64" rx="10" fill="${COLORS.accent4}" fill-opacity="0.2" stroke="${COLORS.accent4}" />
  <text x="734" y="438" text-anchor="middle" fill="${COLORS.text}" font-size="18">${esc(labels[labels.length - 1] || "Effect")}</text>`;
  const causes = labels.slice(0, Math.max(labels.length - 1, 1));
  causes.forEach((label, i) => {
    const xSpine = 180 + i * (420 / Math.max(causes.length - 1, 1));
    const up = i % 2 === 0;
    const y2 = up ? 300 : 560;
    const x2 = xSpine - 85;
    const c = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][i % 4];
    body += `<line x1="${xSpine}" y1="430" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" />
    <text x="${x2 - 4}" y="${up ? y2 - 12 : y2 + 24}" text-anchor="end" fill="${COLORS.text}" font-size="18">${esc(label)}</text>
    <line x1="${xSpine - 42}" y1="${up ? 365 : 495}" x2="${x2 + 20}" y2="${up ? 340 : 530}" stroke="${COLORS.line}" stroke-width="2" />`;
  });
  return body;
}

function renderGrid(config) {
  const labels = (config.labels || []).slice(0, 9);
  let body = "";
  const size = 170;
  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 120 + c * (size + 20);
      const y = 170 + r * (size + 20);
      const color = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4][idx % 4];
      body += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="12" fill="${color}" fill-opacity="0.18" stroke="${color}" />
      <text x="${x + size / 2}" y="${y + size / 2 + 7}" text-anchor="middle" fill="${COLORS.text}" font-size="20">${esc(labels[idx] || `C${idx + 1}`)}</text>`;
      idx++;
    }
  }
  return body;
}

function renderCurve(config) {
  const labels = (config.labels || []).slice(0, 3);
  return `<line x1="120" y1="640" x2="680" y2="640" stroke="${COLORS.line}" />
  <line x1="120" y1="640" x2="120" y2="180" stroke="${COLORS.line}" />
  <path d="M130 610 C240 380, 360 260, 680 220" fill="none" stroke="${COLORS.accent1}" stroke-width="5" />
  <path d="M130 610 C260 520, 420 470, 680 450" fill="none" stroke="${COLORS.accent3}" stroke-width="4" opacity="0.75" />
  <text x="150" y="200" fill="${COLORS.text}" font-size="20">${esc(labels[0] || "Value")}</text>
  <text x="620" y="676" fill="${COLORS.text}" font-size="20">${esc(labels[1] || "Time")}</text>
  <text x="520" y="246" fill="${COLORS.muted}" font-size="18">${esc(labels[2] || "")}</text>`;
}

function renderBellCurve(config) {
  const labels = (config.labels || []).slice(0, 5);
  const slots = [140, 230, 320, 450, 580];
  const widths = [80, 90, 120, 110, 90];
  const colors = [COLORS.accent4, COLORS.accent3, COLORS.accent1, COLORS.accent2, COLORS.accent4];
  let body = `<line x1="120" y1="640" x2="700" y2="640" stroke="${COLORS.line}" />
  <line x1="120" y1="640" x2="120" y2="180" stroke="${COLORS.line}" />
  <path d="M130 640 C210 520, 250 300, 400 260 C520 280, 590 470, 690 640" fill="none" stroke="${COLORS.line}" stroke-width="3" />`;
  for (let i = 0; i < 5; i++) {
    const x = slots[i];
    const w = widths[i];
    const h = i === 2 ? 250 : (i === 1 || i === 3 ? 180 : 120);
    const y = 640 - h;
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colors[i]}" fill-opacity="0.18" stroke="${colors[i]}" />
    <text x="${x + w / 2}" y="${y - 10}" text-anchor="middle" fill="${COLORS.text}" font-size="15">${esc(labels[i] || `G${i + 1}`)}</text>`;
  }
  body += `<text x="130" y="200" fill="${COLORS.muted}" font-size="16">Adoption Rate</text>
  <text x="616" y="676" fill="${COLORS.muted}" font-size="16">Time</text>`;
  return body;
}

function renderDecayCurve(config, modelName) {
  const labels = (config.labels || []).slice(0, 3);
  const title = modelName === "Ebbinghaus Forgetting Curve" ? "Forgetting Trend" : "Decay Trend";
  return `<line x1="120" y1="640" x2="700" y2="640" stroke="${COLORS.line}" />
  <line x1="120" y1="640" x2="120" y2="180" stroke="${COLORS.line}" />
  <path d="M130 240 C190 280, 260 340, 340 420 C420 500, 520 560, 690 610" fill="none" stroke="${COLORS.accent2}" stroke-width="5" />
  <path d="M130 300 C200 340, 280 390, 360 470 C450 550, 560 595, 690 628" fill="none" stroke="${COLORS.accent1}" stroke-width="3" opacity="0.75" />
  <line x1="250" y1="180" x2="250" y2="640" stroke="${COLORS.line}" stroke-dasharray="4 5" />
  <line x1="430" y1="180" x2="430" y2="640" stroke="${COLORS.line}" stroke-dasharray="4 5" />
  <line x1="590" y1="180" x2="590" y2="640" stroke="${COLORS.line}" stroke-dasharray="4 5" />
  <text x="210" y="670" fill="${COLORS.muted}" font-size="14">T1</text>
  <text x="390" y="670" fill="${COLORS.muted}" font-size="14">T2</text>
  <text x="550" y="670" fill="${COLORS.muted}" font-size="14">T3</text>
  <text x="140" y="206" fill="${COLORS.text}" font-size="18">${esc(title)}</text>
  <text x="140" y="228" fill="${COLORS.muted}" font-size="16">${esc(labels[0] || "Retention")}</text>
  <text x="610" y="676" fill="${COLORS.muted}" font-size="16">${esc(labels[1] || "Time")}</text>
  <text x="480" y="520" fill="${COLORS.muted}" font-size="14">${esc(labels[2] || "Review")}</text>`;
}

function renderRadialFive(config) {
  const labels = (config.labels || []).slice(0, 5);
  const cx = 400;
  const cy = 430;
  const radius = 210;
  let body = `<circle cx="${cx}" cy="${cy}" r="84" fill="${COLORS.accent4}" fill-opacity="0.2" stroke="${COLORS.line}" />
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" fill="${COLORS.text}" font-size="20">Rivalry</text>`;
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const color = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4, COLORS.accent1][i];
    const label = esc(labels[i] || `Force ${i + 1}`);
    body += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${COLORS.line}" />
    <circle cx="${x}" cy="${y}" r="56" fill="${color}" fill-opacity="0.22" stroke="${color}" />
    <text x="${x}" y="${y + 7}" text-anchor="middle" fill="${COLORS.text}" font-size="16">${label.slice(0, 16)}</text>`;
  }
  return body;
}

function renderSwissCheese(config) {
  const labels = (config.labels || []).slice(0, 4);
  const cols = [COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4];
  let body = "";
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * 150;
    const c = cols[i % cols.length];
    body += `<rect x="${x}" y="220" width="110" height="420" rx="18" fill="${c}" fill-opacity="0.2" stroke="${c}" />
    <circle cx="${x + 36}" cy="300" r="12" fill="${COLORS.panel}" />
    <circle cx="${x + 70}" cy="390" r="18" fill="${COLORS.panel}" />
    <circle cx="${x + 48}" cy="500" r="14" fill="${COLORS.panel}" />
    <circle cx="${x + 78}" cy="590" r="10" fill="${COLORS.panel}" />
    <text x="${x + 55}" y="674" text-anchor="middle" fill="${COLORS.text}" font-size="16">${esc(labels[i] || `Layer ${i + 1}`)}</text>`;
  }
  body += `<line x1="100" y1="350" x2="710" y2="560" stroke="${COLORS.line}" stroke-width="4" />
  <polygon points="696,548 724,566 691,574" fill="${COLORS.line}" />`;
  return body;
}

function renderPareto(config) {
  const labels = (config.labels || []).slice(0, 2);
  return `<line x1="120" y1="640" x2="700" y2="640" stroke="${COLORS.line}" />
  <line x1="120" y1="640" x2="120" y2="190" stroke="${COLORS.line}" />
  <rect x="180" y="270" width="120" height="370" fill="${COLORS.accent2}" fill-opacity="0.25" stroke="${COLORS.accent2}" />
  <rect x="360" y="510" width="280" height="130" fill="${COLORS.accent1}" fill-opacity="0.25" stroke="${COLORS.accent1}" />
  <path d="M180 300 C260 290, 360 360, 640 520" fill="none" stroke="${COLORS.accent3}" stroke-width="4" />
  <text x="240" y="260" text-anchor="middle" fill="${COLORS.text}" font-size="22">80%</text>
  <text x="500" y="500" text-anchor="middle" fill="${COLORS.text}" font-size="22">20%</text>
  <text x="240" y="676" text-anchor="middle" fill="${COLORS.muted}" font-size="16">${esc(labels[0] || "Effects")}</text>
  <text x="500" y="676" text-anchor="middle" fill="${COLORS.muted}" font-size="16">${esc(labels[1] || "Causes")}</text>`;
}

function renderValueCurve(config) {
  const labels = (config.labels || []).slice(0, 2);
  return `<line x1="120" y1="640" x2="700" y2="640" stroke="${COLORS.line}" />
  <line x1="120" y1="640" x2="120" y2="190" stroke="${COLORS.line}" />
  <path d="M140 560 L220 520 L300 550 L380 510 L460 540 L540 500 L660 530" fill="none" stroke="${COLORS.accent4}" stroke-width="4" />
  <path d="M140 490 L220 420 L300 460 L380 340 L460 390 L540 300 L660 250" fill="none" stroke="${COLORS.accent1}" stroke-width="5" />
  <text x="670" y="244" fill="${COLORS.accent1}" font-size="18">${esc(labels[1] || "Blue Ocean")}</text>
  <text x="670" y="536" fill="${COLORS.accent4}" font-size="18">${esc(labels[0] || "Red Ocean")}</text>`;
}

function renderIceberg(config) {
  const labels = (config.labels || []).slice(0, 4);
  return `<rect x="100" y="410" width="600" height="6" fill="${COLORS.line}" />
  <polygon points="220,390 320,230 470,250 570,390" fill="${COLORS.accent1}" fill-opacity="0.24" stroke="${COLORS.accent1}" />
  <polygon points="200,416 320,620 500,610 600,416" fill="${COLORS.accent3}" fill-opacity="0.2" stroke="${COLORS.accent3}" />
  <text x="390" y="210" text-anchor="middle" fill="${COLORS.text}" font-size="20">${esc(labels[0] || "Visible")}</text>
  <text x="390" y="664" text-anchor="middle" fill="${COLORS.text}" font-size="20">${esc(labels[3] || "Deep Structure")}</text>
  <text x="615" y="398" fill="${COLORS.muted}" font-size="16">surface</text>`;
}

function renderDefault(config, modelName) {
  const title = esc(modelName);
  const tier = esc(config.tier || "P3");
  const template = esc(config.template || "default");
  return `<rect x="120" y="230" width="560" height="320" rx="24" fill="${COLORS.accent4}" fill-opacity="0.2" stroke="${COLORS.accent4}" />
  <text x="400" y="390" text-anchor="middle" fill="${COLORS.text}" font-size="36">${title}</text>
  <text x="400" y="440" text-anchor="middle" fill="${COLORS.muted}" font-size="22">${tier} · ${template}</text>`;
}

const TEMPLATE_KIND = new Map([
  ["matrix_2x2", "matrix"], ["matrix_grid", "matrix"], ["matrix_payoff", "matrix"], ["venn_2", "matrix"], ["venn_3", "matrix"],
  ["flow_linear", "flow"], ["flow_gate", "flow"], ["chain_vertical", "flow"], ["chain_consequence", "flow"], ["arrows_opposing", "flow"], ["list_compare", "flow"], ["list_checklist", "flow"], ["stack_folders", "flow"], ["target_zone", "flow"], ["formula", "flow"], ["formula_fraction", "flow"], ["point_intersect", "flow"], ["filter_simple", "flow"], ["mirror", "flow"], ["lever", "flow"], ["gauge", "flow"], ["chart_curve", "flow"], ["scale_balance", "flow"], ["timeline_future", "flow"], ["shield_layers", "flow"],
  ["pyramid", "pyramid"], ["pyramid_slice", "pyramid"], ["steps_up", "pyramid"], ["ladder", "pyramid"],
  ["loop_cycle", "loop"], ["loop_double", "loop"], ["loop_reinforce", "loop"], ["loop_figure8", "loop"], ["loop_reflection", "loop"],
  ["funnel", "funnel"],
  ["tree_branch", "tree"], ["flow_tree", "tree"], ["tree_roots", "tree"],
  ["fishbone", "fishbone"],
  ["grid_3x3", "grid"], ["star_6", "grid"], ["hex_6", "grid"], ["table", "grid"], ["radar", "grid"], ["network_nodes", "grid"], ["network_mesh", "grid"], ["grid_connected", "grid"], ["swarm", "grid"], ["brain_map", "grid"], ["symbol_yin_yang", "grid"],
  ["curve_bell", "curve"], ["curve_fat_tail", "curve"], ["curve_power_law", "curve"], ["curve_wave", "curve"], ["chart_value_curve", "curve"], ["chart_forgetting", "curve"], ["chart_decay", "curve"], ["chart_convex", "curve"], ["radial_5", "curve"], ["iceberg", "curve"], ["bar_80_20", "curve"], ["spiral_up", "curve"]
]);

function render(config, modelName) {
  if (config.template === "curve_bell") return frame(modelName, renderBellCurve(config));
  if (config.template === "chart_decay") return frame(modelName, renderDecayCurve(config, modelName));
  if (config.template === "radial_5") return frame(modelName, renderRadialFive(config));
  if (config.template === "shield_layers") return frame(modelName, renderSwissCheese(config));
  if (config.template === "bar_80_20") return frame(modelName, renderPareto(config));
  if (config.template === "chart_value_curve") return frame(modelName, renderValueCurve(config));
  if (config.template === "iceberg") return frame(modelName, renderIceberg(config));
  const kind = TEMPLATE_KIND.get(config.template) || "default";
  if (kind === "matrix") return frame(modelName, renderMatrix(config, modelName));
  if (kind === "flow") return frame(modelName, renderFlow(config, modelName));
  if (kind === "pyramid") return frame(modelName, renderPyramid(config, modelName));
  if (kind === "loop") return frame(modelName, renderLoop(config, modelName));
  if (kind === "funnel") return frame(modelName, renderFunnel(config, modelName));
  if (kind === "tree") return frame(modelName, renderTree(config));
  if (kind === "fishbone") return frame(modelName, renderFishbone(config, modelName));
  if (kind === "grid") return frame(modelName, renderGrid(config));
  if (kind === "curve") return frame(modelName, renderCurve(config));
  return frame(modelName, renderDefault(config, modelName));
}

function writePaths(models) {
  const lines = models.map((model) => `  ${JSON.stringify(model.title)}: ${JSON.stringify(`docs/assets/illustrations/${model.slug}.svg`)},`);
  const content = `/**
 * Auto-generated illustration paths for douyin cards.
 * Run: npm run generate:illustrations
 */
export const MODEL_ILLUSTRATION_PATHS = {
${lines.join("\n")}
};
`;
  fs.writeFileSync(ILLUSTRATION_PATHS_FILE, content);
}

function fallbackConfig(model) {
  if (model.category === "Expression") return { tier: "P3", template: "flow_linear", labels: [model.title] };
  if (model.category === "Structure") return { tier: "P3", template: "grid_3x3", labels: [model.title] };
  if (model.category === "Diagnosis") return { tier: "P3", template: "fishbone", labels: ["Cause", "Cause", "Effect"] };
  if (model.category === "Strategy") return { tier: "P3", template: "matrix_2x2", labels: ["A", "B", "C", "D"] };
  if (model.category === "Meta") return { tier: "P3", template: "loop_cycle", labels: [model.title] };
  return { tier: "P3", template: "default", labels: [model.title] };
}

function generate() {
  const models = window.MODEL_LIBRARY_ROWS.map((row) => ({ title: row[0], category: row[3], slug: slugify(row[0]) }));
  console.log(`Starting generation for ${models.length} models...`);
  let generated = 0;
  let keptManual = 0;
  for (const model of models) {
    const outputPath = path.join(OUTPUT_DIR, `${model.slug}.svg`);
    if (MANUAL_SLUGS.has(model.slug) && fs.existsSync(outputPath)) {
      keptManual++;
      continue;
    }
    const config = ILLUSTRATION_CONFIG[model.title] || fallbackConfig(model);
    fs.writeFileSync(outputPath, render(config, model.title), "utf8");
    generated++;
  }
  writePaths(models);
  console.log(`Done. Generated ${generated}, kept manual ${keptManual}.`);
}

generate();
