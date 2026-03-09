---
artifact_type: design
created_by: brainstorm-design
lifecycle: snapshot
created_at: 2026-03-09
---

# Illustration 使用场景设计

**Date:** 2026-03-09  
**Status:** Draft  
**Scope:** 结合项目目标（可展示、可学习、可传播）设计 illustration 的多场景应用

---

## 1. 项目目标对齐

| 目标 | 含义 | Illustration 可支撑 |
|------|------|---------------------|
| **可展示** | 以 Atlas 视图呈现知识对象、坐标与关系 | 详情面板、3D 节点缩略图、嵌入模式 |
| **可学习** | 用户快速找到并理解对象，形成学习路径 | 落地页、学习手册、练习卡片、路径预览 |
| **可传播** | 分享、嵌入、复用 | 竖卡、脚本模板、OG 图、SEO 落地页 |

---

## 2. 使用场景矩阵

| 场景 | 触点 | 用户行为 | 配图价值 | 优先级 |
|------|------|----------|----------|--------|
| **竖卡导出** | 抖音 9:16 卡 | 3 秒识别 + CTA | 强化语义、提升停留 | P0 |
| **落地页 / 详情** | ?model=MECE | 完整学习 | 概念可视化、辅助记忆 | P0 |
| **学习手册 Markdown** | 导出的 .md | 离线学习 | 每节配图，增强可读 | P1 |
| **创作者脚本模板** | 导出脚本 | 做视频时参考 | 脚本中引用「配图路径」供插入 | P1 |
| **学习路径预览** | 路径列表 / 步骤卡 | 选路径、看步骤 | 每步缩略图，快速识别 | P2 |
| **embed 嵌入** | iframe 详情 | 外部站点展示 | 紧凑视图带图 | P2 |
| **3D 节点 hover** | 悬停 tooltip | 快速预览 | 小图 + 名称 | P3 |
| **SEO / OG** | 链接预览 | 社交分享 | og:image 用 illustration | P2 |

---

## 3. 方案对比

### 方案 A：竖卡 + 落地页优先（推荐）

**范围**：illustration 仅在竖卡、详情面板/落地页使用。

| Pros | Cons |
|------|------|
| 与可传播、可学习核心路径强绑定 | 3D/embed/手册等暂不展示 |
| 实现成本低，复用现有 export、详情结构 | - |
| 用户第一次接触（竖卡）即有图 | - |

**适用**：优先验证配图对传播与学习的实际效果。

### 方案 B：全触点覆盖

**范围**：竖卡、落地页、手册、脚本、路径、embed、OG 全部使用 illustration。

| Pros | Cons |
|------|------|
| 信息一致、体验统一 | 需改造多处（手册、embed、OG 等） |
| 各场景都能传递视觉语义 | 依赖 90+ 对象全部配图 |

**适用**：配图资产已较完整、且需要统一品牌时。

### 方案 C：仅竖卡

**范围**：只在竖卡中嵌入 illustration。

| Pros | Cons |
|------|------|
| 实现最快 | 落地页等学习场景无图，价值有限 |
| 聚焦传播场景 | 与「可学习」目标联动弱 |

---

## 4. 推荐设计（方案 A）

**Phase 1**：竖卡 + 落地页

1. **竖卡**：在概念区上方或侧方插入 illustration 缩略图（约 1/4 高度），保持 3 秒可读。
2. **落地页 / 详情**：在「概念」卡片上方或侧边展示 illustration，附带 `source` 引用。

**Phase 2**（可选）：学习手册、脚本模板、OG

- 手册：Markdown 每节插入 `![](illustration.png)`
- 脚本：输出 `配图：docs/assets/illustrations/mece.svg`
- OG：单模型落地页 `og:image` 指向 illustration

**数据层**：在 model-library 或 v2 对象中增加可选字段 `illustration: { url, alt, source }`，与 `references` 并列。

---

## 5. 与参考信息的整合

| 信息 | 展示位置 | 说明 |
|------|----------|------|
| illustration | 竖卡、详情、手册 | 概念可视化 |
| references | 详情「参考与来源」 | authors、wikipedia、books |
| illustration.source | 图下方或 caption | 如「来源：Barbara Minto《金字塔原理》」 |

竖卡空间有限时，可在图下方加一行：`图源：McKinsey; Minto`，完整引用放在落地页。

---

## 6. 验收标准（Phase 1）

- [ ] 竖卡支持可选 illustration，有则展示、无则跳过
- [ ] 落地页/详情支持 illustration，与概念区块一起呈现
- [ ] 每个 illustration 附带 source 引用
- [ ] MECE 作为首例，完成设计与实现验证
