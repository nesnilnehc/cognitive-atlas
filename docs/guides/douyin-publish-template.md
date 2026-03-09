# 抖音发布模板

**Date:** 2026-03-09  
**Scope:** 抖音渠道推广 — 通用模板与 checklist

---

## 1. 使用方式

1. 导出竖卡：在 3D 视图中聚焦目标模型 → 更多 → 导出竖卡
2. 按下方模板填写占位符，或使用已有具体内容文档（如 [MECE 第一期](douyin-publish-mece-phase1.md)）
3. 按 checklist 逐项完成

---

## 2. 通用模板

### 2.1 标题 / 描述（35 字内）

```
{{一句话钩子，如：拆问题不重不漏，用这一条原则}}
```

### 2.2 话题标签

```
#思维模型 #结构化思维 #认知工具箱
```

*按模型补充具体标签，如 MECE 可加 #MECE #麦肯锡*

### 2.3 评论置顶（必发）

```
完整定义、用法和关联模型戳这里 →
{{BASE_URL}}/cognitive-model-3d.html?model={{MODEL_ID}}
```

---

## 3. 占位符说明

| 占位符 | 替换为 |
|--------|--------|
| `{{MODEL_ID}}` | 模型名，如 MECE、OKR、5W1H |
| `{{BASE_URL}}` | 落地页根地址，如 https://your-domain.com |
| 标题钩子 | 根据模型一句话提炼价值或痛点 |

---

## 4. 发布 checklist

- [ ] 竖卡已导出（9:16，1080×1920）
- [ ] 标题 / 描述已写好（≤35 字）
- [ ] 话题标签已添加（2–5 个）
- [ ] 评论置顶已发布，含落地页链接
- [ ] 落地页地址已替换为实际值

---

## 5. 可选：口播脚本

若制作口播讲解视频，可先导出脚本模板：

```bash
npm run export:script -- MECE
```

脚本结构：钩子(3s) → 定义(10s) → 例子(15s) → 关联(5s)。落地页 URL 占位符在脚本末尾，可复制到评论置顶。

---

## 6. 具体内容文档

所有认知对象均有第一期竖卡发布文案，可直接拷贝使用。文档由 `scripts/generate-douyin-publish-guides.mjs` 生成。

| 模型 | 中文 | 文档 |
|------|------|------|
| PREP | 观点先行结构 | [phase1](douyin-publish-prep-phase1.md) |
| PEEL | 段落论证结构 | [phase1](douyin-publish-peel-phase1.md) |
| STAR | 情境行为结果模型 | [phase1](douyin-publish-star-phase1.md) |
| SCQA | 情境冲突提问回答模型 | [phase1](douyin-publish-scqa-phase1.md) |
| FABE | 特性优势利益证据模型 | [phase1](douyin-publish-fabe-phase1.md) |
| AIDA | 注意兴趣欲望行动模型 | [phase1](douyin-publish-aida-phase1.md) |
| PAS | 问题激化解决模型 | [phase1](douyin-publish-pas-phase1.md) |
| Hero's Journey | 英雄之旅模型 | [phase1](douyin-publish-heros-journey-phase1.md) |
| 4MAT | 四象限学习表达模型 | [phase1](douyin-publish-4mat-phase1.md) |
| Elevator Pitch | 电梯演讲模型 | [phase1](douyin-publish-elevator-pitch-phase1.md) |
| Yes And | 即兴接纳贡献法 | [phase1](douyin-publish-yes-and-phase1.md) |
| MECE | 相互独立完全穷尽原则 | [phase1](douyin-publish-mece-phase1.md) |
| 5W1H | 六问分析法 | [phase1](douyin-publish-5w1h-phase1.md) |
| Issue Tree | 问题树 | [phase1](douyin-publish-issue-tree-phase1.md) |
| Decision Tree | 决策树 | [phase1](douyin-publish-decision-tree-phase1.md) |
| P.A.R.A. | 项目领域资源归档体系 | [phase1](douyin-publish-para-phase1.md) |
| 9-Grid Thinking | 九宫格思维 | [phase1](douyin-publish-9-grid-thinking-phase1.md) |
| 5 Whys | 五问根因法 | [phase1](douyin-publish-5-whys-phase1.md) |
| Fishbone Diagram | 鱼骨图 | [phase1](douyin-publish-fishbone-diagram-phase1.md) |
| FMEA | 失效模式分析 | [phase1](douyin-publish-fmea-phase1.md) |
| Chaos Engineering | 混沌工程 | [phase1](douyin-publish-chaos-engineering-phase1.md) |
| Red Teaming | 红队对抗 | [phase1](douyin-publish-red-teaming-phase1.md) |
| Swiss Cheese Model | 瑞士奶酪模型 | [phase1](douyin-publish-swiss-cheese-model-phase1.md) |
| Expected Value | 期望值决策 | [phase1](douyin-publish-expected-value-phase1.md) |
| Eisenhower Matrix | 四象限优先级 | [phase1](douyin-publish-eisenhower-matrix-phase1.md) |
| RICE | 产品优先级模型 | [phase1](douyin-publish-rice-phase1.md) |
| Cost-Benefit Analysis | 成本收益分析 | [phase1](douyin-publish-cost-benefit-analysis-phase1.md) |
| Pareto Principle | 帕累托法则 | [phase1](douyin-publish-pareto-principle-phase1.md) |
| OODA Loop | 观察调整决策循环 | [phase1](douyin-publish-ooda-loop-phase1.md) |
| PDCA | 计划执行检查处理循环 | [phase1](douyin-publish-pdca-phase1.md) |
| Pros and Cons | 利弊权衡法 | [phase1](douyin-publish-pros-and-cons-phase1.md) |
| Regret Minimization | 最小化后悔法 | [phase1](douyin-publish-regret-minimization-phase1.md) |
| SWOT | 优势劣势机会威胁分析 | [phase1](douyin-publish-swot-phase1.md) |
| PESTLE | 宏观环境分析 | [phase1](douyin-publish-pestle-phase1.md) |
| Porter's Five Forces | 五力模型 | [phase1](douyin-publish-porters-five-forces-phase1.md) |
| Generic Strategies | 竞争战略模型 | [phase1](douyin-publish-generic-strategies-phase1.md) |
| VRIO | 资源优势分析 | [phase1](douyin-publish-vrio-phase1.md) |
| BCG Matrix | 波士顿矩阵 | [phase1](douyin-publish-bcg-matrix-phase1.md) |
| Blue Ocean Strategy | 蓝海战略 | [phase1](douyin-publish-blue-ocean-strategy-phase1.md) |
| Ansoff Matrix | 安索夫矩阵 | [phase1](douyin-publish-ansoff-matrix-phase1.md) |
| Core Competence | 核心竞争力 | [phase1](douyin-publish-core-competence-phase1.md) |
| Flywheel | 飞轮模型 | [phase1](douyin-publish-flywheel-phase1.md) |
| JTBD | 待完成任务理论 | [phase1](douyin-publish-jtbd-phase1.md) |
| Lean Startup | 精益创业 | [phase1](douyin-publish-lean-startup-phase1.md) |
| Design Thinking | 设计思维 | [phase1](douyin-publish-design-thinking-phase1.md) |
| Business Model Canvas | 商业模式画布 | [phase1](douyin-publish-business-model-canvas-phase1.md) |
| Value Proposition Canvas | 价值主张画布 | [phase1](douyin-publish-value-proposition-canvas-phase1.md) |
| AARRR | 海盗增长模型 | [phase1](douyin-publish-aarrr-phase1.md) |
| SCAMPER | 创新激发法 | [phase1](douyin-publish-scamper-phase1.md) |
| TRIZ | 发明问题解决理论 | [phase1](douyin-publish-triz-phase1.md) |
| Minimum Viable Product | 最小可行产品 | [phase1](douyin-publish-minimum-viable-product-phase1.md) |
| OKR | 目标与关键成果 | [phase1](douyin-publish-okr-phase1.md) |
| KPI | 关键绩效指标 | [phase1](douyin-publish-kpi-phase1.md) |
| RACI | 责任分配矩阵 | [phase1](douyin-publish-raci-phase1.md) |
| Tuckman Model | 团队发展阶段 | [phase1](douyin-publish-tuckman-model-phase1.md) |
| Kotter's 8 Steps | 变革八步法 | [phase1](douyin-publish-kotters-8-steps-phase1.md) |
| Maslow's Hierarchy | 需求层次理论 | [phase1](douyin-publish-maslows-hierarchy-phase1.md) |
| Situational Leadership | 情境领导 | [phase1](douyin-publish-situational-leadership-phase1.md) |
| 360 Feedback | 360度反馈 | [phase1](douyin-publish-360-feedback-phase1.md) |
| ORID | 焦点讨论法 | [phase1](douyin-publish-orid-phase1.md) |
| Game Theory | 博弈论 | [phase1](douyin-publish-game-theory-phase1.md) |
| Prisoner's Dilemma | 囚徒困境 | [phase1](douyin-publish-prisoners-dilemma-phase1.md) |
| Nash Equilibrium | 纳什均衡 | [phase1](douyin-publish-nash-equilibrium-phase1.md) |
| Tragedy of the Commons | 公地悲剧 | [phase1](douyin-publish-tragedy-of-the-commons-phase1.md) |
| Incentive Design | 激励设计 | [phase1](douyin-publish-incentive-design-phase1.md) |
| Fogg Behavior Model | 福格行为模型 | [phase1](douyin-publish-fogg-behavior-model-phase1.md) |
| First Principles | 第一性原理 | [phase1](douyin-publish-first-principles-phase1.md) |
| Second-Order Thinking | 二阶思维 | [phase1](douyin-publish-second-order-thinking-phase1.md) |
| Systems Thinking | 系统思维 | [phase1](douyin-publish-systems-thinking-phase1.md) |
| Occam's Razor | 奥卡姆剃刀 | [phase1](douyin-publish-occams-razor-phase1.md) |
| Hanlon's Razor | 汉隆剃刀 | [phase1](douyin-publish-hanlons-razor-phase1.md) |
| Inversion | 反向思考法 | [phase1](douyin-publish-inversion-phase1.md) |
| Abstraction Ladder | 抽象阶梯 | [phase1](douyin-publish-abstraction-ladder-phase1.md) |
| Logical Levels | 逻辑层次模型 | [phase1](douyin-publish-logical-levels-phase1.md) |
| Antifragility | 反脆弱 | [phase1](douyin-publish-antifragility-phase1.md) |
| Bloom's Taxonomy | 布鲁姆认知层级 | [phase1](douyin-publish-blooms-taxonomy-phase1.md) |
| Feynman Technique | 费曼学习法 | [phase1](douyin-publish-feynman-technique-phase1.md) |
| Spaced Repetition | 间隔重复 | [phase1](douyin-publish-spaced-repetition-phase1.md) |
| Ebbinghaus Forgetting Curve | 遗忘曲线 | [phase1](douyin-publish-ebbinghaus-forgetting-curve-phase1.md) |
| Dreyfus Model | 技能进阶模型 | [phase1](douyin-publish-dreyfus-model-phase1.md) |
| Deliberate Practice | 刻意练习 | [phase1](douyin-publish-deliberate-practice-phase1.md) |
| Double Loop Learning | 双环学习 | [phase1](douyin-publish-double-loop-learning-phase1.md) |
| Growth Mindset | 成长型思维 | [phase1](douyin-publish-growth-mindset-phase1.md) |
| Cognitive Bias | 认知偏差模型 | [phase1](douyin-publish-cognitive-bias-phase1.md) |
| Mental Models Latticework | 多元思维模型网格 | [phase1](douyin-publish-mental-models-latticework-phase1.md) |
| Black Swan | 黑天鹅理论 | [phase1](douyin-publish-black-swan-phase1.md) |
| Feedback Loop | 反馈回路 | [phase1](douyin-publish-feedback-loop-phase1.md) |
| Leverage Points | 系统杠杆点 | [phase1](douyin-publish-leverage-points-phase1.md) |
| Dialectics | 辩证法 | [phase1](douyin-publish-dialectics-phase1.md) |
| Paradox Thinking | 悖论思维 | [phase1](douyin-publish-paradox-thinking-phase1.md) |
| Meta-Cognition | 元认知 | [phase1](douyin-publish-meta-cognition-phase1.md) |
| Complex Adaptive Systems | 复杂适应系统 | [phase1](douyin-publish-complex-adaptive-systems-phase1.md) |
| Entropy | 熵增原理 | [phase1](douyin-publish-entropy-phase1.md) |
| Emergence | 涌现 | [phase1](douyin-publish-emergence-phase1.md) |

---

## 7. 相关文档

- [分享链接最佳实践](share-url-best-practices.md) — URL 参数说明
- [可传播认知资产需求](../requirements-planning/spreadable-cognitive-assets-requirements.md) — 竖卡、脚本、落地页规范
