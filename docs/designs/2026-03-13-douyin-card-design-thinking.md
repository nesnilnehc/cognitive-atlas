# 竖卡设计思考：如何把 mece-extensions 的价值传递给用户

**Date:** 2026-03-13  
**Status:** Design Decision  
**Problem:** 竖卡展示 generic 文案（definition、category fallback），mece-extensions 中的 problemTarget、whenToUse、rules、examples 未有效传递，用户觉得「像附件一样没价值」。

---

## 1. 竖卡的本质与约束

| 维度 | 说明 |
|------|------|
| **媒介** | 9:16 图，抖音 3 秒滑动，1080×1920 |
| **目标** | 3 秒可读 + 首次接触输出核心价值 + 引导落地页 |
| **约束** | 空间有限，不能堆砌长文；需在「精简」与「有价值」之间平衡；**两侧必须留足安全边距**（见 [平台约束](douyin-card-platform-constraints.md)） |

**核心问题**：竖卡不是「知识库摘要」，而是「价值钩子」。用户 3 秒内需要知道：**这能解决我什么问题？我什么时候用？** 学术 definition 无法回答这两个问题。

---

## 2. 数据源价值排序（从用户视角）

| 字段 | 回答的问题 | 竖卡价值 | 典型长度 |
|------|------------|----------|----------|
| **problemTarget** | 解决什么痛点 | 高：直接击中需求 | 1–2 句 |
| **whenToUse** | 何时用 | 高：场景匹配 | 1–2 句 |
| **definition** | 学术定义 | 低：抽象、难共鸣 | 1 句 |
| **examples** | 怎么用（案例） | 高：具象、可模仿 | 通常较长 |
| **rules** | 操作步骤/要点 | 高：可执行 | 多条 |
| **origin** | 出处 | 中：建立信任 | 1 句 |

**结论**：竖卡应优先 problemTarget / whenToUse，而非 definition（descriptionEn）。

---

## 3. 信息层级与取舍

### 3.1 必须展示（P0）
- 名称、中文名
- **核心价值**：用 problemTarget 或 whenToUse 作为「一句话」，回答「解决什么 / 何时用」
- 坐标（位置感）
- CTA（引导落地页）

### 3.2 高价值可选（P1）
- **应用示例**：有则展示，**长则截断**（约 80 字 / 2 行），避免挤占
- **规则**：有则展示 **1–2 条** 最核心的，每条可截断
- **参考**：建立信任，1 行

### 3.3 可收缩（P2）
- objectType 标签：有空间则展示
- 坐标：保持简短

### 3.4 不展示
- limitations、commonMisuse：留到落地页
- 全部 rules：仅展示 1–2 条

---

## 4. 字段选择策略

| 竖卡区块 | 主数据源 |  fallback | 截断策略 |
|----------|----------|-----------|----------|
| 一句话核心价值 | **problemTarget** → whenToUse | definition | 优先用 problemTarget；过长则取前 80 字 |
| 应用示例 | **examples** | whenToUse | 前 80–100 字 + 「…」 |
| 规则 | rules[0:2] | — | 每条 ≤40 字，共 1–2 条 |
| 参考 | origin | MODEL_REFERENCE_RESOURCES | 1 行 |

**关键**：不再用 definition 作为「一句话」首选；definition（= descriptionEn）留作 whenToUse、problemTarget 均缺失时的兜底。

---

## 5. 布局建议（自上而下）

```
名称
中文名
[objectType 标签]（空间允许）
[插图]

「一句话」：problemTarget 或 whenToUse（核心价值）
坐标：诊断 · 结构层 · 团队

[可选] 规则：1–2 条
[可选] 应用示例：截断至 2 行

参考
─────────
CTA
```

---

## 6. 实施要点

1. **一句话**：`problemTarget` 优先于 `whenToUse`，再 fallback 到 `definition`
2. **示例**：用 `examples`，超过约 80 字时截断并加「…」
3. **规则**：仅展示 rules 前 1–2 条，每条过长时截断
4. **验证数据流**：确认 meceExtension 正确合并进 knowledgeObject（model-data.js 已实现）
5. **移除 DOUYIN_CARD_EXTRA 对 MECE/Issue Tree 的硬编码**：由 mece-extensions 统一提供，无则再 fallback
