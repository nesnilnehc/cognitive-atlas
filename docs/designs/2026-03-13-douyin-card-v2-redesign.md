# 抖音竖卡 v2 重新规划与设计

**Date:** 2026-03-13  
**Status:** Proposal  
**Scope:** 按最新认知对象属性（v2 schema）重新规划竖卡结构与内容  
**Traceability:** [数据契约 v1.1](../requirements-planning/model-data-contract-v1.md) · [可传播资产需求](../requirements-planning/spreadable-cognitive-assets-requirements.md) REQ-D-2 / REQ-D-4 · **[平台约束（必须遵守）](douyin-card-platform-constraints.md)**

---

## 1. 现状与问题

### 1.1 当前竖卡实现（`src/app3d/export.js`）

| 区域 | 当前数据来源 | 问题 |
|------|--------------|------|
| 名称 | `model.name`, `model.aliasZh` | ✓ 稳定 |
| 概念一句话 | `DOUYIN_CARD_EXTRA.summaryZh` 或 `axisRationale.x` 抽取 或 `definition` | 硬编码 MECE/Issue Tree；其余模型用 axisRationale 抽取，语义不稳 |
| 规则 | `DOUYIN_CARD_EXTRA.rules` 或 `knowledgeObject.rules` | 仅少数模型有 rules |
| 应用示例 | `DOUYIN_CARD_EXTRA.examples` 或 `knowledgeObject.examples` / `whenToUse` | 来源混用，优先级不统一 |
| 参考来源 | `DOUYIN_CARD_EXTRA.source` 或 `MODEL_REFERENCE_RESOURCES` | 手工覆盖与引用库并存 |
| 坐标 | 无 | 未在竖卡上展示（REQ-D-2 要求「坐标提示」） |
| CTA | 固定文案 | ✓ |

### 1.2 与 v2 契约的差距

- **REQ-D-4**：内容应源自 v2 schema，当前仍依赖 `DOUYIN_CARD_EXTRA` 和 `axisRationale` 抽取。
- **REQ-D-2**：竖卡应含「坐标提示」，目前未渲染。
- **v2 属性未充分利用**：`objectType`、`problemTarget`、`limitations`、`commonMisuse`、`practice`、`origin`、`coordinates` 等未纳入竖卡设计。

---

## 2. v2 认知对象属性（数据源）

依据 `docs/requirements-planning/model-data-contract-v1.md` 和 `cognitive-atlas-v2-system-spec.md`：

### 2.1 维度 1：身份与本体
| 字段 | 类型 | 竖卡用途 |
|------|------|----------|
| `id` | String | 不展示，用于落地页 URL |
| `name` | String | 主标题 |
| `aliases` | String[] | 中文名（aliasZh） |
| `objectType` | Enum | 副标签（Theory / Principle / Framework / Model / Method / Tool 等） |
| `definition` | String | 权威定义（快读） |
| `status` / `version` | — | 不展示 |

### 2.2 维度 2：场景与边界
| 字段 | 类型 | 竖卡用途 |
|------|------|----------|
| `problemTarget` | String | 核心痛点，可作「一句话怎么用」 |
| `whenToUse` | String | 适用场景 |
| `limitations` | String | 可选展示：不适用边界 |

### 2.3 维度 3：执行与落地
| 字段 | 类型 | 竖卡用途 |
|------|------|----------|
| `rules` | String[] | 结构化规则 / 步骤（若有） |
| `examples` | String | 应用示例 |
| `commonMisuse` | String | 可选：常见误用 |

### 2.4 维度 4：拓扑与元数据
| 字段 | 类型 | 竖卡用途 |
|------|------|----------|
| `origin` | String | 提出者 / 出处（可作参考来源） |
| `coordinates` | Object | 三维坐标 (x,y,z) → 坐标提示 |
| `axisRationale` | Object | 作为 definition 的备选语义（非首选） |
| `relations` | Array | 不在竖卡展示，落地页 / CTA 引导 |

---

## 3. 重新规划：竖卡信息层级

设计原则：**3 秒可读 + 首次接触输出核心价值 + 引导指向更多**（保持现有原则）。

### 3.1 建议布局结构（自上而下）

```
┌─────────────────────────────────────┐
│ 1. 主标题：name                       │
│ 2. 副标题：aliasZh                    │
│ 3. 类型标签：objectType（可选，如 Framework）│
│ 4. [插图 illustration]               │
│ 5. 一句话定义：definition / problemTarget  │
│ 6. 坐标提示：coordinates 可视化/文字     │
│ 7. [可选] 规则 / 步骤：rules           │
│ 8. [可选] 应用示例：examples           │
│ 9. [可选] 参考：origin / references    │
│ ───────────────────────────────────  │
│ CTA：关联模型 · 学习路径 · 练习 → 评论置顶   │
└─────────────────────────────────────┘
```

### 3.2 字段映射（v2 优先，无则 fallback）

| 竖卡元素 | 主数据源 | 备选 |
|----------|----------|------|
| 主标题 | `knowledgeObject.name` | `model.name` | — |
| 副标题 | aliasZh | — | — |
| 类型标签 | `knowledgeObject.objectType` | 可省略（空间紧时） | — |
| **核心价值** | **`problemTarget`** → `whenToUse` | `definition` | 优先回答「解决什么/何时用」，见设计思考 |
| 坐标提示 | `coordinates.primary` | — | 如「诊断 · 结构层 · 团队」 |
| 规则 | `knowledgeObject.rules[0:2]` | — | 1–2 条，每条 ≤45 字 |
| 应用示例 | `knowledgeObject.examples` | `whenToUse` | 截断至 100 字 |
| 参考 | `knowledgeObject.origin` | `MODEL_REFERENCE_RESOURCES` | — |

### 3.3 废除或缩减

- **DOUYIN_CARD_EXTRA**：逐步废弃；仅在 v2 数据尚未补齐时作为临时 fallback，最终由 v2 统一驱动。
- **axisRationale 抽取**：不再作为 definition 的主来源，避免语义不稳。

---

## 4. 坐标提示设计

REQ-D-2 要求竖卡含「坐标提示」。建议两种形式二选一：

### 方案 A：简短文字

- X: Sensemaking / Diagnosis / Design / Execution / Adaptation
- Y: Meta / Conceptual / Structural / Procedural / Instrumental  
- Z: Individual / Team / Organization / Ecosystem / Societal

示例：`诊断 · 结构层 · 团队→组织`

### 方案 B：迷你坐标条

在竖卡中嵌入一条简化的 3 轴条形图（X/Y/Z 各 1–5 刻度），视觉化位置，需额外实现。

**推荐**：Phase 1 采用方案 A，实现成本低，满足 REQ-D-2。

---

## 5. 实施步骤

| 步骤 | 内容 | 产出 |
|------|------|------|
| 1 | 更新 `export.js` 竖卡逻辑：全部以 `model.knowledgeObject` 为数据源 | 无 `DOUYIN_CARD_EXTRA` 依赖 |
| 2 | 增加坐标提示区域（方案 A） | REQ-D-2 满足 |
| 3 | 增加 `objectType` 副标签（可选，空间允许时） | 强化 v2 语义 |
| 4 | 统一 definition / problemTarget / whenToUse / examples 取值优先级 | REQ-D-4 满足 |
| 5 | 待 v2 数据全面补齐后，移除 `DOUYIN_CARD_EXTRA` | 数据驱动 |

---

## 6. 验收标准

- [ ] 竖卡内容 100% 来自 `knowledgeObject`（或显式 fallback 到 legacy，无隐式抽取）
- [ ] 竖卡含坐标提示（文字或迷你图）
- [ ] 无新增硬编码覆盖（MECE / Issue Tree 等由 v2 数据提供）
- [ ] 3 秒可读、9:16、1080×1920 不变
