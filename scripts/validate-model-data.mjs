import fs from "node:fs";

const file = "data/model-library.js";
const content = fs.readFileSync(file, "utf8");

const rowRegex = /\[\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]+)"(?:\s*,\s*([0-9-]+)\s*,\s*([0-9-]+))?\s*\]/g;
const rows = [];
let match;
while ((match = rowRegex.exec(content)) !== null) {
  rows.push({
    name: match[1],
    aliasZh: match[2],
    descriptionEn: match[3],
    category: match[4],
    y: match[5] ? Number(match[5]) : null,
    z: match[6] ? Number(match[6]) : null
  });
}

if (rows.length === 0) {
  console.error("No model rows found in data/model-library.js");
  process.exit(1);
}

const errors = [];
const allowedCategories = new Set(["Expression", "Structure", "Diagnosis", "Strategy", "Meta"]);

const seen = new Set();
for (const row of rows) {
  if (seen.has(row.name)) errors.push(`Duplicate model name: ${row.name}`);
  seen.add(row.name);

  if (!allowedCategories.has(row.category)) {
    errors.push(`Invalid category for ${row.name}: ${row.category}`);
  }

  if ((row.y === null) !== (row.z === null)) {
    errors.push(`Invalid override pair for ${row.name}: y=${row.y}, z=${row.z}`);
  }

  if (row.y !== null && (row.y < 1 || row.y > 4)) {
    errors.push(`Y override out of range for ${row.name}: ${row.y}`);
  }

  if (row.z !== null && (row.z < 1 || row.z > 4)) {
    errors.push(`Z override out of range for ${row.name}: ${row.z}`);
  }
}

const toolLayerCount = rows.filter((row) => row.z === 1).length;

if (errors.length > 0) {
  console.error("Model data validation failed:");
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

const categoryCount = rows.reduce((acc, row) => {
  acc[row.category] = (acc[row.category] || 0) + 1;
  return acc;
}, {});

console.log("Model data validation passed.");
console.log(`Rows: ${rows.length}`);
console.log(`Tool layer explicit count (z=1): ${toolLayerCount}`);
if (toolLayerCount === 0) {
  console.log("Warning: no explicit z=1 overrides; tool-layer placement may come from category defaults.");
}
console.log(`Categories: ${JSON.stringify(categoryCount)}`);
