# 推广图改版方案 v2：基于实际 3D 实现

## 1. 现有 3D 页面实现分析

### 1.1 坐标映射（[src/app.js](src/app.js)）

```javascript
const SCALE = { x: 22, y: 12, z: 12 };
const SEMANTIC_ORIGIN = { x: 0, y: 4, z: 4 };

// Y: 语义值 1–4 → 世界 Y（表达层在下方，元认知层在上方）
function toWorldY(yLevel) {
  const centeredLevel = yLevel - SEMANTIC_ORIGIN.y;  // 1→-3, 2→-2, 3→-1, 4→0
  return -centeredLevel * SCALE.y;                   // -36,-24,-12,0
}

// Z: 语义值 1–4 → 世界 Z（工具在一端，元模型在另一端）
function toWorldZ(zLevel) {
  const centeredLevel = zLevel - SEMANTIC_ORIGIN.z;  // 1→-3, 2→-2, 3→-1, 4→0
  return -centeredLevel * SCALE.z;                   // -36,-24,-12,0
}

// X: 语义值 -1/0/1 → 世界 X
// getCellCenter: xCenter = -0.75*SCALE.x | 0 | 0.75*SCALE.x
```

### 1.2 三轴几何（[src/app.js](src/app.js) buildAxis）

- **X 轴**：世界 X 方向，直线 `(xMin, 0, 0)` → `(xMax, 0, 0)`
  - 刻度：-1, 0, 1 → 过去 | 现在 | 未来

- **Y 轴**：世界 Y 方向（竖直），直线 `(0, yMin, 0)` → `(0, yMax, 0)`
  - 刻度：1, 2, 3, 4 → 表达层 | 结构层 | 战略层 | 元认知层

- **Z 轴**：世界 Z 方向（深度），直线 `(0, 0, zMin)` → `(0, 0, zMax)`
  - 刻度：1, 2, 3, 4 → 工具 | 方法 | 原则 | 元模型

三轴**正交**，**相交于原点** (0,0,0)。**原点语义**：现在 (X=0) × 元认知层 (Y=4) × 元模型 (Z=4)。

### 1.3 刻度顺序（与 [src/app3d/i18n.js](src/app3d/i18n.js) 一致）

| 轴 | 沿轴正向顺序 |
|----|--------------|
| X | 过去(-1) → 现在(0) → 未来(1) |
| Y | 表达层(1) → 结构层(2) → 战略层(3) → 元认知层(4) |
| Z | 工具(1) → 方法(2) → 原则(3) → 元模型(4) |

## 2. 当前推广图问题

1. **Z 轴标签不在同一条线上**：工具/方法/原则/元模型未严格落在 Z 轴直线上的连续刻度
2. **轴方向/刻度易混淆**：三轴未明确表现为“三条正交直线 + 原点”
3. **顺序错误风险**：Z 轴必须严格按 工具→方法→原则→元模型 沿同一直线排列

## 3. 改版设计要点

### 3.1 三轴必须满足

1. **原点**：三轴相交点，标签仅显示 **现在 / Present**（不显示数字）
2. **三条直线**：X、Y、Z 各为一条直线，三线交于该原点
3. **全双语**：所有刻度标签均为「中文 / English」
4. **刻度不显示数字**：仅显示语义名称
5. **与时间轴相交的顺序**：
   - X：过去 / Past — **现在 / Present** — 未来 / Future
   - Y：**元认知层 / Meta-Cognition** — 战略层 / Strategy — 结构层 / Structure — 表达层 / Output
   - Z（向内）：**元模型 / Meta Model** — 原则 / Principle — 方法 / Method — 工具 / Tool

### 3.2 示例模型

- **MECE** (0, 2, 3)：现在 · 结构层 · 原则
- **OKR** (1, 3, 2)：未来 · 战略层 · 方法

### 3.3 可选方案

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| A | 用 HTML/Canvas/SVG 手动画图，再导出 PNG | 刻度、顺序、对齐完全可控 | 需实现绘图逻辑 |
| B | 修改 GenerateImage prompt，强调“同轴、正交、顺序” | 实现简单 | AI 生成易出现轴错位 |
| C | 从实际 3D 页面截屏（隐藏多余 UI） | 与真实界面一致 | 需自动化截图、可能含不需要元素 |

**推荐**：先用方案 B 细化 prompt；若仍出现轴错位，再考虑方案 A（SVG 或 Canvas 图）。

## 4. 细化后的 GenerateImage prompt（方案 B）

```
Origin label ONLY: 现在 / Present (no numbers).
All labels bilingual: 中文 / English. No numeric values on any axis.

X axis: 过去 / Past — 现在 / Present — 未来 / Future
Y axis (no numbers): 元认知层 / Meta-Cognition — 战略层 / Strategy — 结构层 / Structure — 表达层 / Output
Z axis (no numbers, INWARD): 元模型 / Meta Model — 原则 / Principle — 方法 / Method — 工具 / Tool

Z order MUST be: 元模型, 原则, 方法, 工具 (Meta Model, Principle, Method, Tool).

Model points: MECE, OKR. Title: ModelSpace. Subtitle: 认知模型三维坐标系.
```

## 5. 产出物

- 覆盖 [docs/assets/modelspace-promo.png](docs/assets/modelspace-promo.png)
- 若 B 效果不佳，实现方案 A：新建 `docs/assets/modelspace-promo.svg` 或通过脚本生成 PNG
