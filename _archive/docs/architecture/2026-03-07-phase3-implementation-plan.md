# Phase 3 实施计划 (分发深化 & 3D 可见性改版)

**Date:** 2026-03-06
**Status:** Planned
**Target:** 2026-03-07 交付

## 1. 任务拆解与优先级

| 阶段 | 任务 | 负责人 | 优先级 | 验收标准 |
|------|------|--------|--------|----------|
| **Phase 3.1** | **3D 可见性 (Overview First)** | maintainer | P0 | 默认隐藏 Label，点击 Cell 徽章进入 Focus 模式 |
| **Phase 3.2** | **详情面板 (Accordion)** | maintainer | P1 | 区块可折叠，状态记忆在 sessionStorage |
| **Phase 3.3** | **局部截图 (Cell Crop)** | maintainer | P1 | 选中 Cell 后导出图精准对焦，无杂质 |
| **Phase 3.4** | **深色科技海报 (Poster)** | maintainer | P2 | Canvas 合成海报包含 Title, Definition, QR |

## 2. 实施细节

- [x] **3.1 3D 可见性 (Overview First)**
  - [x] `src/app3d/state.js`: Add `visibilityMode`, `focusedCell`.
  - [x] `src/app.js`: Implement `refreshNodeStyles` with dimming logic.
  - [x] `src/app.js`: Update `selectNode` / `onSceneClick` to switch modes.

- [x] **3.2 详情面板 (Accordion)**
  - [x] `src/app3d/details.js`: Refactor to use Accordion UI.
  - [x] `src/app3d/details.js`: Implement `sessionStorage` persistence.
  - [x] `src/app3d/details.js`: Update `renderModelDetails` for Focus Mode context.

- [x] **3.3 局部截图 (Cell Crop)**
  - [x] `src/app3d/export.js`: Implement `getBoxBoundsInPixels`.
  - [x] `src/app.js`: Implement `getFocusedBox` logic.
  - [x] `src/app.js`: Update `onExportImage` to use auto-focus.

- [x] **3.4 深色科技海报 (Poster)**
  - [x] `src/app3d/export.js`: Implement Canvas composition (Cyber Style).
  - [x] `src/app3d/export.js`: Add glowing text, tech grid, corner brackets.

## 3. 风险管理
- **性能**: 频繁切换 Focus 模式可能导致渲染开销，需通过 `requestAnimationFrame` 节流。
- **兼容性**: Canvas 绘图在旧版浏览器或低端移动端可能存在内存限制。

## 4. 下一步
- [ ] 启动 Phase 3.1: 3D 可见性改版实施。
