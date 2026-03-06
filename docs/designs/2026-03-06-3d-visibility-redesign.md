# 3D 可见性与详情改版设计

**Date:** 2026-03-06
**Status:** Proposed
**Goal:** 解决模型过多带来的视觉混乱，优化浏览体验，提供“总览-聚焦”的认知路径。

## 1. 3D 可见性 (Visibility Redesign)

### 核心逻辑
- **交互模式**: **B (Overview First)**
  - **默认状态 (Overview Mode)**:
    - 所有 Cell 显示 **徽章 (Badge)**: 包含该 Cell 模型数量、类别颜色。
    - **隐藏** 所有单个模型的 Label (或降低不透明度至 0.2)。
    - **点击空白处** 保持此状态。
  - **聚焦状态 (Focus Mode)**:
    - **点击 Cell 徽章** 或 **选中 Cell 内任一模型** 进入。
    - **高亮** 该 Cell 内的所有模型 (Opacity 1.0)。
    - **淡化** 其他 Cell (Opacity 0.1, Label 隐藏)。
    - **显示** 该 Cell 内模型的 Label 与连线。
    - **点击空白处** 退回 Overview Mode。

### 技术方案
- **状态管理**: `src/app3d/state.js` 新增 `visibilityMode` ('overview' | 'focus') 与 `focusedCell`。
- **渲染循环**:
  - `scene.js` 或 `ui.js` 监听状态变更。
  - 更新 `nodesGroup` 中所有 Sprite 的 `material.opacity` 与 `visible` 属性。
  - 更新连线 `linksGroup` 的可见性（仅显示两端都在 focusedCell 内的连线）。
- **性能**: 避免每帧遍历；仅在状态切换时全量更新一次材质属性。

## 2. 详情面板 (IA Redesign)

### 核心逻辑
- **布局**: **手风琴 (Accordion)**
  - 默认展开：`Model Overview` (基本信息), `Definition` (定义)。
  - 默认折叠：`Admission Rationale` (准入理由), `Core Resources` (资源), `Tags` (标签)。
  - **记忆功能**: 记录用户手动展开/折叠的状态 (SessionStorage)，下次打开同类模型时保持偏好。

### 技术方案
- **组件**: `src/app3d/details.js` 重构渲染逻辑。
- **DOM**: 使用 `<details>` 和 `<summary>` 原生标签实现手风琴，样式自定义。
- **数据**: `src/domain/model-data.js` 保持不变，仅调整 `renderDetails` 消费数据的方式。
- **状态**: `sessionStorage.setItem('model-details-prefs', JSON.stringify({ ... }))`。

## 3. 验收标准
- [ ] 页面加载后，默认仅显示 Cell 徽章，无密集文字遮挡。
- [ ] 点击 Cell 徽章，平滑过渡到该 Cell 高亮状态，相关模型文字清晰。
- [ ] 点击空白处，平滑退回总览模式。
- [ ] 详情面板各区块可独立折叠/展开，且状态在刷新前保持。

## 4. 依赖与风险
- **依赖**: 无额外库。
- **风险**: Cell 徽章遮挡模型点击。
- **缓解**: 徽章 `pointer-events: auto`，点击徽章视为选中 Cell；模型 `raycast` 优先级高于徽章背景。
