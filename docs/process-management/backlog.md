# ModelSpace Backlog

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

### 文档同步（持续）

| 任务 | 优先级 | 来源 |
|------|--------|------|
| 里程碑完成后更新 `docs/architecture` 与 `project-file-map` | high | [Roadmap 风险缓解](../designs/2026-03-05-iteration-roadmap.md#风险与缓解) |

---

## 可选 / 后续（Optional）

### Phase 3：分发能力深化（方案 C）

- 分享能力增强（带筛选/视角参数的 URL 优化）
- 局部截图、主题海报模板

### 架构演进（参考 roadmap 目标架构）

- `core/state`、`core/scene`、`core/interaction` 进一步拆分
- `domain/model-data`、`ui/panels` 独立域

### 3D / 详情改版（Proposed）

- [docs/architecture/20260304-3d-visibility-redesign.md](../architecture/20260304-3d-visibility-redesign.md)
- [docs/architecture/20260304-model-details-ia-redesign.md](../architecture/20260304-model-details-ia-redesign.md)

---

## 维护说明

- 新待办应从 roadmap 或设计文档追溯，并在本表注明 **来源**。
- 完成项打勾后保留在「已完成」区，便于 traceback 与历史追溯。
- 与 [project-file-map](../project-overview/project-file-map.md) 保持同步更新。
