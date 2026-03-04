# Model Details IA Redesign (Option B)

**Date:** 2026-03-04  
**Status:** Proposed  
**Scope:** Design only (no implementation in this document)

## Goal
Rebuild the "Model Details" panel into a low-cognitive-load reading flow that supports two primary intents:
- Quick understanding (what this model is and where it sits)
- Learning expansion (authors, core references, deeper sources)

## Problem Statement
Current detail content is complete but still reading-heavy for first-time users:
- Key information (identity, coordinate meaning, admission rationale, references) competes in one continuous stream.
- "Learning resources" are visible but not always the fastest to reach.
- On small screens, users scroll before finding the part they came for.

## Constraints
- Keep current frontend architecture (single-page, client-side rendering).
- Keep bilingual content (`zh`/`en`) and existing terminology.
- Keep data source separation (`model-data.js`, `app-3d.js`, `src/app3d/ui.js`).
- Do not require backend changes.

## Alternatives Considered

### Option A: Flat Card Stack
Description:
- Keep all sections expanded and only improve visual hierarchy.

Pros:
- Minimal interaction complexity.
- Lowest implementation cost.

Cons:
- Scroll burden remains high on mobile.
- Does not prioritize "learning resources first" behavior.

Best for:
- Dense desktop-only workflows.

### Option B: Layered Accordion (Recommended)
Description:
- Details are grouped into semantic sections with intentional default open/close states.

Pros:
- Fast scanning for both novice and advanced users.
- Strong control of information density.
- Clear path from "what it is" to "how to study it."

Cons:
- Adds section state management.

Best for:
- Mixed audiences, bilingual exploration, model-learning scenarios.

### Option C: Split-Pane Study Workspace
Description:
- Details on left, user-curated reading queue on right.

Pros:
- Best for research productivity.

Cons:
- Significant product and state complexity.
- Requires broader UI changes beyond detail panel.

Best for:
- Future advanced phase, not immediate release.

## Recommendation
Adopt **Option B (Layered Accordion)** now.  
Rationale:
- High readability gain with moderate complexity.
- Fits existing panel structure and current code boundaries.
- Allows incremental evolution toward Option C without rework.

## Information Architecture

Section order (top to bottom):
1. `Model Overview` (default: expanded)
2. `Definition` (default: expanded)
3. `Admission Rationale` (default: collapsed)
4. `Core Resources` (default: expanded)
5. `Tags` (default: expanded)

### Why this order
- Users first need orientation (what/where).
- Then semantic understanding (definition).
- Then trust layer (why this coordinate/admission).
- Then learning expansion (references).
- Tags remain discoverable but lightweight.

## Interaction Design

### Accordion behavior
- Each section has independent expand/collapse.
- Default states are deterministic (not random, not session-dependent).
- Section header click toggles state.
- Keyboard support:
  - `Enter`/`Space`: toggle focused section
  - `ArrowDown`/`ArrowUp`: move focus between section headers

### Global quick actions
- Add two optional lightweight actions near detail title:
  - `Expand All`
  - `Collapse All`
- YAGNI rule:
  - If implementation effort is non-trivial in current sprint, postpone and ship per-section toggles first.

### Empty-state rules
- No selected model: show existing hint text only.
- Section with no data:
  - show localized placeholder (`待补充` / `To be added`)
  - keep section visible (avoid layout jumping).

## Desktop Layout
- Keep right-side panel.
- Use card-based section containers with clear title row.
- `Model Overview` uses 2-column key-value grid.
- `Definition` uses single text block.
- `Admission Rationale` keeps status pill + detail rows.
- `Core Resources` keeps grouped lists + outbound action links.

## Mobile Layout
- Keep single column.
- Force `Model Overview` key-value grid to 1 column.
- Preserve same section order and default open/close states.
- Ensure section headers remain thumb-reachable and visually separated.

## Data Contract (UI Payload)
Recommended payload shape for detail renderer:
- `displayName`
- `overviewTitle`
- `overviewRows: Array<{ label, value }>`
- `descriptionTitle`
- `descriptionText`
- `judgementTitle`
- `judgementStatus`
- `judgementStatusClass`
- `judgementRows: Array<{ label, value }>`
- `referenceTitle`
- `referenceSections: Array<{ label, items, emptyText }>`
- `referenceLinks: Array<{ label, url }>`
- `tagsTitle`
- `tags: string[]`

This aligns with current refactor direction and avoids duplicate formatting logic.

## Accessibility Requirements
- Section headers use semantic button behavior.
- Toggle state exposed via `aria-expanded`.
- Section-content relation exposed via `aria-controls`.
- Outbound links must include clear labels and visible focus state.
- Color should not be the only status signal (status pill must include text).

## Performance Considerations
- Avoid remounting entire panel on each section toggle; prefer class/attribute state toggles.
- Keep resource lists static after model selection to minimize reflow.
- Defer heavy DOM rebuilds to model change, not accordion toggle.

## Acceptance Criteria
- [ ] User can identify model category/cell/coordinates within 3 seconds after selecting a node.
- [ ] User can reach core learning resources with at most one scroll gesture.
- [ ] `Admission Rationale` remains accessible but does not dominate initial reading.
- [ ] Mobile view preserves readability with no horizontal overflow.
- [ ] Keyboard-only user can open/close sections and access links.

## Rollout Plan
1. Phase 1: Ship sectioned layout with default expand/collapse states.
2. Phase 2: Add optional `Expand All` / `Collapse All` controls.
3. Phase 3: Add section-state memory (optional, per-session only).

## Out of Scope
- Cross-model comparison workspace.
- User-managed reading queue.
- Backend-managed citation scoring.
