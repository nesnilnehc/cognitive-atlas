# Cognitive Atlas Illustration Status

This document tracks the current coverage and quality gate for model illustrations.

## Current Coverage

- Model count: 94
- Path mappings: 94
- Existing SVG assets: 94
- Missing assets: 0

## Rendering Rules

- Primary format: SVG
- Visual baseline: dark background, low-saturation accents, minimal geometry
- Semantic source: `data/illustration-config.js`
- Path source: `data/illustration-paths.generated.js`

## Verification Workflow

```bash
npm run generate:illustrations
npm run verify:illustrations
```

## Manual Overrides

- `MECE` keeps manual `mece.svg` and is not overwritten by generator.

## Next Quality Work

- Refine semantics for mismatches reported by `verify:illustrations`
- Add classic-structure fidelity upgrades for P0/P1 priority models
