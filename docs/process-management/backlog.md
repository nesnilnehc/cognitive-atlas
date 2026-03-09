# Cognitive Atlas Backlog

本文件从 roadmap 与设计文档抽取可追溯待办，支持 execution-alignment 的 traceback。

**Traceability：** Roadmap → [docs/designs/2026-03-05-iteration-roadmap.md](../designs/2026-03-05-iteration-roadmap.md)

---

## 状态图例

| 状态 | 含义 |
|------|------|
| done | 已完成 |
| in-progress | 进行中 |
| todo | 待办 |
| optional | 可选 / 后续 |

---

## 已完成（Done）

### M1：工程基线稳固

- [x] 导出能力抽离到 `src/app3d/export.js`
- [x] 交互监听集中到 `src/app3d/interaction.js`
- [x] 筛选与选择状态抽离到 `src/app3d/state.js`
- [x] `scripts/smoke-e2e.mjs` 与 `npm run smoke:e2e`
- [x] smoke:e2e 接入 GitHub Actions
- [x] M1 模块边界与事件流文档

### M2：学习体验增强

- [x] 单元聚焦学习路径
- [x] 详情面板相关模型分组（同单元/同类别/最近邻）

### M3：分发能力

- [x] URL 参数恢复与状态同步
- [x] `embed.html` 轻量嵌入入口
- [x] 导出文件名按单元/类别自动命名

### M4：质量基线

- [x] URL 状态与详情编排抽离（`url-state.js`, `details.js`）
- [x] E2E 回归扩展（语言、筛选、URL、聚焦、嵌入、导出）
- [x] 性能预算基线 `perf-budget.mjs`
- [x] UI 默认优化（连线默认关、筛选分组折叠）

### M5 Week 1（契约与门禁基线）

- [x] 数据契约 `docs/requirements-planning/model-data-contract-v1.md`
- [x] 准入模板 `docs/requirements-planning/model-admission-template.md`
- [x] `scripts/validate-model-content.mjs` 与 `npm run validate:content`
- [x] CI 集成内容校验

### M5 Week 2（变更可追踪）

- [x] 建立 `docs/changelog/model-library-changelog.md` 模板与维护规则
- [x] 脚本 `scripts/changelog-diff.mjs` 与 `npm run changelog:diff`
- [x] CI 阻断确认与文档化（README Contributing）

---

## 待办（Todo）

### 下一冲刺方向（已决策：架构演进优先）

| 优先级 | 方向 | 范围 | rationale |
|--------|------|------|------------|
| **1 todo** | 架构演进 | domain/model-data → core/state → core/scene → ui/panels | [Roadmap](../designs/2026-03-05-iteration-roadmap.md)：先治理工程结构再叠加功能；[Phase3 规划](../designs/2026-03-06-phase3-architecture-evolution.md) 推荐 domain 先行、与 M5 数据治理对齐 |
| 2 todo | Phase 3 可传播认知资产 | 抖音竖卡、脚本模板、落地页 URL；体系化学习路径与手册导出 | [2026-03-09 落地方案](project-board/backlog/) |
| 3 optional | 3D / 详情改版 | 可见性、信息架构优化 | Proposed，择机落地 |

首项建议：`domain/model-data` 抽离（与 M5 数据治理强相关，抽离后便于测试与扩展）。

---

### 文档同步（持续）

| 任务 | 优先级 | 来源 |
|------|--------|------|
| [x] 2026-03-06：M5 完成后更新 `docs/architecture` 与 `project-file-map` | 已完成 | [Roadmap 风险缓解](../designs/2026-03-05-iteration-roadmap.md#风险与缓解) |
| 下一里程碑完成后更新 `docs/architecture` 与 `project-file-map` | high | 同上（持续） |

---

## 可选 / 后续（Optional）

### Phase 3：可传播认知资产 + 体系化学习（2026-03-09 更新）

- [x] 分享能力增强（短格式 URL、复制分享链接、分享最佳实践文档） — 已实现
- [x] 局部截图（当前视口模式） — 已实现
- [x] **G 落地页 URL 规范** — [2026-03-09-model-landing-page-url-spec](project-board/backlog/2026-03-09-model-landing-page-url-spec.md)
- [x] **D 抖音竖卡** — [2026-03-09-douyin-card-export](project-board/backlog/2026-03-09-douyin-card-export.md)
- [x] **E 创作者脚本模板** — [2026-03-09-creator-script-template-export](project-board/backlog/2026-03-09-creator-script-template-export.md)
- [ ] **学习路径与练习设计** — [2026-03-09-learning-path-practice-design](project-board/backlog/2026-03-09-learning-path-practice-design.md)
- [ ] **学习手册 Markdown 导出** — [2026-03-09-learning-handbook-markdown-export](project-board/backlog/2026-03-09-learning-handbook-markdown-export.md)
- 局部截图（cell 裁剪）、主题海报模板 — 降级，按需求择机
- [x] 更新 Phase 3 设计：可传播认知资产 — 已纳入 [Phase 3 规划](../designs/2026-03-06-phase3-architecture-evolution.md)

### 架构演进（已提升为 todo）

- [x] **domain/model-data**（medium）— 模型解析、准入映射、校验聚合，已抽离至 `src/domain/model-data.js`
- [x] **core/state** 补全（small）— 剩余状态逻辑已迁入（createCameraViewDirections、baseCameraCenter 初始化）
- [x] **core/scene**（medium）— Three.js 生命周期已集中管理（createSceneContext、createRenderLoop）
- [x] **ui/panels**（medium）— 面板层已统一（resolvePanelElements、setToolbarHidden/setInfoHidden 迁入 panels.js）
- 详见 [Phase3 & 架构演进规划](../designs/2026-03-06-phase3-architecture-evolution.md)

### 3D / 详情改版（部分完成）

- [docs/architecture/20260304-3d-visibility-redesign.md](../architecture/20260304-3d-visibility-redesign.md) — Proposed（待实施）
- [docs/architecture/20260304-model-details-ia-redesign.md](../architecture/20260304-model-details-ia-redesign.md) — Phase 1–3 已完成（默认展开、展开/收起全部、section 会话记忆）
- [docs/architecture/20260306-phase3-3d-optimization-plan.md](../architecture/20260306-phase3-3d-optimization-plan.md) — 详细优化计划（局部截图、3D 可见性、主题海报）

---

## 维护说明

- 新待办应从 roadmap 或设计文档追溯，并在本表注明 **来源**。
- 完成项打勾后保留在「已完成」区，便于 traceback 与历史追溯。
- 与 [project-file-map](../project-overview/project-file-map.md) 保持同步更新。
