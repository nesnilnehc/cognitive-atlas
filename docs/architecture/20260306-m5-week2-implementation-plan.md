# ModelSpace M5 Week 2：变更可追踪 — 实施规划

**Date:** 2026-03-06  
**Status:** Implemented  
**Scope:** 最小闭环实施规划（规划文档 + 已执行）  
**Traceability:** [M5 设计](../designs/2026-03-05-m5-content-operations.md) → [Backlog](../process-management/backlog.md)

---

## 1. 当前状态

### M5 Week 1：已完成 ✅

| 交付物 | 状态 |
|--------|------|
| `docs/requirements-planning/model-data-contract-v1.md` | 已存在 |
| `docs/requirements-planning/model-admission-template.md` | 已存在 |
| `scripts/validate-model-content.mjs` | 已实现（描述长度、证据映射、参考资源） |
| `npm run validate:content` | 已接入 |
| CI 内容校验 | 已接入 `.github/workflows/model-data-validation.yml`，失败会阻断合并 |

### M5 Week 2：待办 → 已完成 ✅

1. **变更日志模板与维护规则**（high）— 已完成
2. **变更摘要脚本**（medium，可选）— 已完成 `scripts/changelog-diff.mjs`
3. **CI 阻断确认**（low）— 已文档化：内容校验失败会阻断 PR 合并（见 README Contributing）

---

## 2. 实施顺序与任务拆解

### Task 1：变更日志模板与维护规则

**目标：** 建立 `docs/changelog/model-library-changelog.md`，并约定何时、如何维护。

**实施步骤：**

| 步骤 | 动作 | 产出 |
|------|------|------|
| 1.1 | 创建 `docs/changelog/` 目录 | 目录存在 |
| 1.2 | 编写 changelog 模板（表头、单条格式、示例） | `model-library-changelog.md` |
| 1.3 | 在 changelog 内或 `docs/process-management/` 补充维护规则 | 维护规则文档化 |
| 1.4 | 更新 project-file-map | 新文件纳入清单 |

**Changelog 单条格式（建议）：**

```markdown
| 日期 | 模型 | 变更类型 | 原因/摘要 |
|------|------|----------|-----------|
| YYYY-MM-DD | ModelName | added \| modified \| removed | 简要说明 |
```

**维护规则要点：**

- 每次对 `data/model-library.js` 的 **新增/修改/删除** 模型，须在合并前于 changelog 追加一条记录
- 变更类型：`added` | `modified` | `removed`
- 可选：PR 模板中增加 checklist「已更新 model-library-changelog」

**验收标准：**

- [ ] `docs/changelog/model-library-changelog.md` 存在且格式一致
- [ ] 维护规则清晰可执行
- [ ] project-file-map 已更新

---

### Task 2：变更摘要脚本（可选）

**目标：** 辅助从 `git diff` 提取模型级变化，生成可粘贴到 changelog 的摘要。

**实施步骤：**

| 步骤 | 动作 | 产出 |
|------|------|------|
| 2.1 | 新建 `scripts/changelog-diff.mjs` | 脚本文件 |
| 2.2 | 解析 `git diff data/model-library.js`，识别增/改/删的模型名 | 输出 markdown 表格行 |
| 2.3 | 接入 `npm run changelog:diff`（可选） | 方便本地使用 |

**实现思路（最小）：**

- 使用 `child_process.execSync('git diff --no-color data/model-library.js')` 获取 diff
- 正则匹配 `+` 行中的 `"ModelName"` → added
- 正则匹配 `-` 行与 `+` 行中同名模型 → modified
- 正则匹配仅 `-` 行 → removed
- 输出 `| YYYY-MM-DD | ModelName | added/modified/removed | (manual) |`

**验收标准：**

- [ ] 脚本能识别至少 added/modified/removed 三种变更
- [ ] 输出可直接粘贴到 changelog
- [ ] 不强制依赖，人工维护 changelog 仍可行

**取舍：** 若工期紧，可跳过；人工维护 changelog 在模型量 <200 时可行。

---

### Task 3：CI 阻断确认与文档化

**目标：** 确认 CI 已对内容校验失败阻断合并，并在文档中明确。

**实施步骤：**

| 步骤 | 动作 | 产出 |
|------|------|------|
| 3.1 | 确认 `validate:content` 步骤失败时整个 job 失败 | 现状确认 |
| 3.2 | 在 M5 设计或本实施规划中注明「CI 已阻断」 | 文档更新 |

**现状：** `.github/workflows/model-data-validation.yml` 中 `Validate model data (Content Governance)` 为独立 step，失败会导致 job 失败，即 **已阻断**。已在 README Contributing 中注明「CI failures block merge」。

**验收标准：**

- [x] 文档中明确写出「内容校验失败会阻断 PR 合并」（README Contributing）
- [x] 在 README 中说明 PR 前须通过 `npm run validate:content`

---

## 3. 最小闭环范围（推荐）

**必做（Week 2 核心）：**

- Task 1：变更日志模板 + 维护规则

**建议做：**

- Task 3：CI 阻断确认与文档化（工作量极小）

**可选：**

- Task 2：变更摘要脚本（可按需后续补充）

---

## 4. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 开发者忘记更新 changelog | PR 模板增加「已更新 model-library-changelog」checklist；或后续通过 CI 检查 changelog 与 diff 一致性（YAGNI 阶段可不做） |
| 历史变更难以追溯 | 可追加一条「2026-03-06 及之前变更统一记为初始版本」，不强制补齐历史 |

---

## 5. 完成后产出

- `docs/changelog/model-library-changelog.md`（模板 + 维护规则）
- `docs/process-management/changelog-maintenance-rules.md`（可选，也可写在 changelog 顶部）
- `scripts/changelog-diff.mjs`（可选）
- `docs/project-overview/project-file-map.md` 更新
- M5 设计文档或 backlog 状态更新为「M5 Week 2 完成」

---

## 6. 下一步

1. 确认本实施规划无异议  
2. 执行 Task 1（约 30 分钟）  
3. 执行 Task 3（约 5 分钟）  
4. 按需决定是否实施 Task 2
