# Phase 3 分发能力深化设计 (局部截图与海报)

**Date:** 2026-03-06
**Status:** Proposed
**Goal:** 增强 ModelSpace 的内容传播能力，使用户能快速生成高质量的局部模型图和品牌海报。

## 1. 局部截图 (Cell Crop)

### 核心逻辑
- **交互方式**: **自动聚焦 (Auto-Focus)**
  - 用户选中任意 Cell 或 Cell 内的模型时，「导出」面板增加「当前选中区域 (Cell)」选项。
  - 系统自动计算该 Cell 所有节点的 3D 包围盒 (Bounding Box)。
  - 相机平滑飞向该包围盒的最佳视角 (Fit Bounds)，保留约 20% 边距。
  - 背景自动虚化或隐藏非选中 Cell 的节点（复用 Visibility 逻辑）。

### 技术方案
- **输入**: 当前选中的 `currentCell` 或 `currentModel`。
- **计算**: `THREE.Box3.setFromObject(cellGroup)` 获取世界坐标包围盒。
- **相机**: 使用 `OrbitControls.target` 移动到包围盒中心，调整 `camera.position` 到适配距离。
- **输出**: 调用 `WebGLRenderer.render` 生成 Base64，不含 UI 覆盖层。

## 2. 主题海报 (Poster)

### 核心逻辑
- **风格**: **深色科技 (Cyber)**
  - 背景：深蓝/黑渐变，叠加网格线或粒子噪点。
  - 装饰：发光边框，角落由 ModelSpace LOGO、二维码、Slogan 组成。
  - 布局：
    - 主图区 (60-70%)：3D 渲染图（复用局部截图逻辑）。
    - 信息区 (30-40%)：模型标题（大号）、定义（中号）、分类标签（胶囊样式）。
  - 配色：复用 `CATEGORY_COLOR_MAP` 作为强调色（霓虹光感）。

### 技术方案
- **合成方式**: Canvas 2D 后处理。
  - 步骤 1: 获取 3D 场景截图 (透明背景或纯色背景)。
  - 步骤 2: 创建离屏 Canvas (1200x1600, 3:4 比例)。
  - 步骤 3: 绘制深色背景与装饰纹理。
  - 步骤 4: 绘制 3D 截图到主图区。
  - 步骤 5: 绘制文字信息 (Title, Definition, QR Code)。
- **输出**: PNG 图片下载，文件名 `ModelSpace-Poster-{ModelName}.png`。

## 3. 验收标准
- [ ] 选中 Cell 后导出，图片内容仅包含该 Cell 节点，无多余遮挡。
- [ ] 海报生成包含正确的模型标题、定义和二维码。
- [ ] 海报风格符合“深色科技”设定，文字清晰可读。
- [ ] 移动端与桌面端生成的图片比例适配 (建议统一为 3:4 或 1:1)。

## 4. 依赖与风险
- **依赖**: `html2canvas` 或原生 Canvas API (推荐原生以减小包体积)。
- **风险**: 长文本排版在 Canvas 中需手动换行 (Text Wrapping)。
- **缓解**: 限制海报仅展示 `aliasZh` (定义) 的前 50 字，超出省略。
