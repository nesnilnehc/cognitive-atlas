# 认知对象插图生成策略

**Date:** 2026-03-09  
**Status:** Active  
**Scope:** 为 94 个认知对象批量生成 illustration，补齐竖卡与落地页配图

---

## 1. 目标与约束

| 项 | 说明 |
|----|------|
| **目标** | 所有模型竖卡均有配图，符合 illustration-design-spec（极简几何、少色、语义可视化） |
| **约束** | 不引入外部 AI 绘图 API；输出可被 export.js 直接加载 |
| **保留** | MECE 已有人工设计 `mece.svg`，不覆盖 |

---

## 2. 生成策略

### 2.1 分阶段

| 阶段 | 内容 | 产出 |
|------|------|------|
| **Phase 1** | 程序化生成占位插图（按 category 模板） | 93 个 SVG，语义可区分 |
| **Phase 2** | 高优先级模型人工精修（OKR、5 Whys、SWOT 等） | 替换为定制 SVG |
| **Phase 3** | 按需补齐其余模型定制图 | 可选 |

### 2.2 按 Category 的视觉模板

| Category | 视觉隐喻 | 几何形态 |
|----------|----------|----------|
| Expression | 线性表达、步骤流 | 水平箭头 / 阶梯 / 气泡链 |
| Structure | 分层、分块、网格 | 树状 / 2×2 或 3×3 网格 / 分区块 |
| Diagnosis | 因果、根因 | 鱼骨 / 发散箭头 / 链条 |
| Strategy | 决策、优先级、矩阵 | 2×2 矩阵 / 漏斗 / 循环箭头 |
| Meta | 抽象、递归、系统 | 圆环 / 递归嵌套 / 杠杆 |

### 2.3 统一规范

- **尺寸**：建议 512×512 或 600×400（竖卡展示约 240px 高，等比缩放）
- **配色**：深色底（#0d1520）、低饱和点缀（#00f0ff、#ff8c42、#9d7bff、#6b7b8c）
- **格式**：SVG（可无损缩放，体积小；竖卡 Canvas 可加载）
- **命名**：`{slug}.svg`，与 douyin-publish 一致

### 2.4 优先级（Phase 2 精修候选）

1. OKR、5 Whys、SWOT、PDCA、First Principles、Design Thinking、Eisenhower Matrix  
2. Issue Tree、Fishbone、Feynman Technique、Lean Startup、Pareto Principle  
3. 其余按使用频率择机

---

## 3. 技术方案

### 3.1 脚本

- **路径**：`scripts/generate-illustrations.mjs`
- **输入**：`data/model-library.js`（MODEL_LIBRARY_ROWS）
- **输出**：`docs/assets/illustrations/{slug}.svg`，及 `data/illustration-paths.generated.js`

### 3.2 路径映射

- 生成 `ILLUSTRATION_PATHS` 对象：`modelName → "docs/assets/illustrations/{slug}.svg"`
- MECE 保留 `mece.svg`（手工图优先覆盖）
- `export.js` 直接使用 `illustration-paths.generated.js` 映射

### 3.3 执行命令

```bash
npm run generate:illustrations
```

---

## 4. 验收

- [x] 94 个模型均映射到 SVG（MECE 使用手工 mece.svg）
- [x] 竖卡导出时所有模型均能加载配图
- [x] 视觉上能按 category 区分（Expression/Structure/Diagnosis/Strategy/Meta）
