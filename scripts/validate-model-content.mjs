import fs from "node:fs";
import vm from "node:vm";

const file = "data/model-library.js";
const content = fs.readFileSync(file, "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
try {
    vm.runInContext(content, sandbox);
} catch (err) {
    console.error("Failed to parse data/model-library.js:", err.message);
    process.exit(1);
}

const {
    MODEL_LIBRARY_ROWS,
    MODEL_EVIDENCE_PACKS,
    MODEL_REFERENCE_RESOURCES,
    MODEL_EVALUATION_BY_NAME
} = sandbox.window;

const errors = [];

// 1. Validating descriptions in rows
for (const row of MODEL_LIBRARY_ROWS) {
    const [name, aliasZh, descriptionEn] = row;

    if (!descriptionEn || descriptionEn.length < 10) {
        errors.push(`[${name}] descriptionEn is too short (length: ${descriptionEn ? descriptionEn.length : 0}), must be >= 10 chars.`);
    }

    if (!aliasZh || aliasZh.length < 2) {
        errors.push(`[${name}] aliasZh is too short (length: ${aliasZh ? aliasZh.length : 0}), must be >= 2 chars.`);
    }
}

// 2. Validating evidence mapping
for (const [name, evalData] of Object.entries(MODEL_EVALUATION_BY_NAME)) {
    const packId = evalData.evaluation.evidencePack;
    if (!MODEL_EVIDENCE_PACKS[packId]) {
        errors.push(`[${name}] Missing evidence pack '${packId}' in MODEL_EVIDENCE_PACKS.`);
    }
}

// 3. Validating reference resources
for (const [name, refData] of Object.entries(MODEL_REFERENCE_RESOURCES || {})) {
    let hasValidContent = false;

    if (refData.authors && Array.isArray(refData.authors) && refData.authors.length > 0) {
        hasValidContent = true;
    }
    if (refData.wikipedia && Array.isArray(refData.wikipedia) && refData.wikipedia.length > 0) {
        hasValidContent = true;
        for (const item of refData.wikipedia) {
            if (item.url && !/^https?:\/\//.test(item.url)) {
                errors.push(`[${name}] Wikipedia reference URL is invalid (must start with http/https): ${item.url}`);
            }
        }
    }
    if (refData.books && Array.isArray(refData.books) && refData.books.length > 0) {
        hasValidContent = true;
        for (const item of refData.books) {
            if (item.url && !/^https?:\/\//.test(item.url)) {
                errors.push(`[${name}] Book reference URL is invalid (must start with http/https): ${item.url}`);
            }
        }
    }

    if (!hasValidContent) {
        errors.push(`[${name}] Reference exists but has no valid content (missing non-empty authors, wikipedia, or books arrays).`);
    }
}

if (errors.length > 0) {
    console.error("Content governance validation failed:");
    for (const err of errors) console.error(`- ${err}`);
    process.exit(1);
}

console.log("Content governance validation passed.");
console.log(`Checked ${MODEL_LIBRARY_ROWS.length} models for content length.`);
console.log(`Checked ${Object.keys(MODEL_EVALUATION_BY_NAME).length} model evidence mappings.`);
console.log(`Checked ${Object.keys(MODEL_REFERENCE_RESOURCES || {}).length} reference configurations.`);
