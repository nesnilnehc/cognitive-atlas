# 3D Cognitive Space Visibility Redesign

**Date:** 2026-03-04  
**Status:** Proposed  
**Scope:** Design only (no implementation in this document)

## Goal
Improve readability in a dense 3D cognitive space (80+ models) by shifting from "all-nodes-at-once" to progressive disclosure, while preserving the 3-axis semantics and exploration value.

## Problem Summary
Current pain points:
- Too many labels and nodes visible simultaneously, causing occlusion and cognitive overload.
- Users cannot quickly answer: "Which cell is dense?", "Where should I start?", "What belongs together?"
- Tool layer was previously underpopulated and distribution quality was not explicit.

## Constraints
- Keep 3D coordinate semantics unchanged: X temporal, Y control depth, Z abstraction.
- Keep single-page client-side architecture (no backend dependency).
- Preserve bilingual UI and model terminology.
- Preserve direct interaction speed (hover/click/orbit).

## Alternatives

### Option A: Camera-driven LOD (distance-based)
Description:
- Keep all nodes loaded; adjust label visibility by camera distance.
- Far: points only; mid: term only; near: term + annotation.

Pros:
- Minimal conceptual change for existing users.
- Fast to implement.

Cons:
- Still visually busy in dense cells.
- Does not explicitly communicate cell-level structure.

Best for:
- Small/medium datasets (<40 nodes) or expert users.

---

### Option B: Cell-first Navigation (recommended)
Description:
- Default is "overview mode": show cell counts (heat/number badges), hide most node labels.
- User selects a cell (from dropdown or by clicking badge) to enter "focus mode".
- Focus mode renders only selected-cell nodes + local neighbors.

Pros:
- Strongest readability gain for large datasets.
- Aligns with user mental model: "space unit contains multiple models".
- Makes density and coverage explicit.

Cons:
- Adds one interaction step before seeing full model details.

Best for:
- 60+ nodes, learning-oriented browsing, presentation scenarios.

---

### Option C: Layer-story Mode (guided walkthrough)
Description:
- Provide scripted exploration steps: Tool layer -> Method -> Principle -> Meta Model.
- Each step highlights a subset and narrates relation to X/Y.

Pros:
- Best onboarding and teaching experience.
- Great for first-time users.

Cons:
- More product complexity and state management.
- Less free-form for advanced users.

Best for:
- Workshops, training, guided demos.

## Recommendation
Adopt **Option B** as primary interaction, then add a lightweight subset of Option A:
- Default: Cell-first overview.
- In focus mode: enable distance-based label detail for selected cell only.

Why:
- Highest clarity improvement with moderate complexity.
- Directly addresses all observed issues: density, discoverability, and per-cell plurality.

## Proposed Interaction Model

### Modes
1. Overview Mode
- Show cell badges with counts.
- Keep node labels mostly hidden (or very sparse).
- Encourage user to choose a cell.

2. Focus Mode (single cell)
- Show models inside one cell.
- Show term + annotation by default.
- Show optional nearest-neighbor links within the cell context.

3. Compare Mode (optional next phase)
- Two cells side-by-side filters for contrast reading.

### Entry Points
- Cell dropdown (explicit control).
- Click cell badge in 3D scene (direct manipulation).
- Search box auto-switches into focus-like filtering behavior.

## Data & Layout Rules
- Keep data source externalized (`model-data.js`) and layout engine separated (`model-layout.js`).
- Add validation at startup:
  - `z=1` must not be empty.
  - warn when any active cell has only 1 model (target: mostly 2+).
  - report top-3 densest cells for balancing.

## Rendering Rules
- Overview:
  - Node opacity lower, labels hidden by default.
  - Cell badges visible.
- Focus:
  - Node opacity normal, labels visible.
  - Non-focus cells hidden or heavily de-emphasized.
- Keep frame budget stable:
  - Reuse sprite textures where possible.
  - Avoid rebuilding all labels every frame.

## Error Handling
- Missing data file: show non-blocking panel message and fallback empty state.
- Bad row schema: skip invalid row and report count in console warning.
- Unknown category: map to fallback style and mark in validation summary.

## Acceptance Criteria
- [ ] In default overview, user can identify dense cells within 3 seconds.
- [ ] Focusing a cell shows only relevant models and improves label overlap significantly.
- [ ] Tool layer (`z=1`) contains non-zero models.
- [ ] At least 70% of filled cells contain 2+ models.
- [ ] No runtime errors in console during language switch, search, and cell switching.

## Rollout Plan
1. Stabilize Option B core (overview/focus + cell badges + cell filter).
2. Add startup validation panel (distribution diagnostics).
3. Add optional guided layer-story (Option C-lite) if needed.

## Out of Scope (for now)
- Backend model management.
- Full graph clustering algorithms.
- Multi-user collaboration.
