# Project File Map

本文档按“当前仓库实际文件”逐项说明用途，便于维护、交接和清理。

## 根目录文件

| 文件 | 作用 |
| --- | --- |
| `.gitignore` | 忽略 macOS 垃圾文件与本地临时截图（`.tmp-*.png`）。 |
| `README.md` | Cognitive Atlas 项目概览、运行方式、维护命令与结构索引。 |
| `index.html` | 主入口页；保留 query/hash 并重定向到 `cognitive-atlas.html`。 |
| `cognitive-atlas.html` | Cognitive Atlas 品牌入口页；兼容 query/hash 后跳转到 legacy route。 |
| `embed.html` | 嵌入入口页；强制 `simple=1&embed=1` 并保留原 query/hash。 |
| `cognitive-model-3d.html` | legacy route；仍承载主应用 HTML/CSS 容器与控件定义。 |

## 数据与源码

| 文件 | 作用 |
| --- | --- |
| `data/model-library.js` | legacy rows、证据包、参考资源、阶段A准入结果，以及 Cognitive Atlas 关系边定义。 |
| `src/app.js` | 应用编排层：Three.js 场景初始化、Atlas 坐标渲染、状态流串联、过滤与渲染主流程。 |
| `src/domain/model-data.js` | 知识对象整形与准入映射：从 legacy rows 或对象输入构建 v2 运行时数据。 |

## 自动化与脚本

| 文件 | 作用 |
| --- | --- |
| `.github/workflows/model-data-validation.yml` | CI 工作流：在 PR/push(main) 时运行模型数据校验与 E2E 回归。 |
| `scripts/validate-model-data.mjs` | 本地/CI 共用校验脚本：检查 `data/model-library.js` 中类别合法性、重名、坐标 override 范围和配对完整性。 |
| `scripts/validate-model-content.mjs` | 内容级校验脚本：描述长度、证据映射、参考资源完整性。 |
| `scripts/changelog-diff.mjs` | 从 `git diff data/model-library.js` 提取模型变更，生成 changelog 表格行。 |
| `scripts/smoke-e2e.mjs` | 端到端回归脚本（本地静态服务 + Playwright）：覆盖语言、筛选、单元聚焦、相关模型跳转、URL 恢复、嵌入与导出。 |
| `scripts/perf-budget.mjs` | 性能预算基线脚本（100+ 节点）：首屏耗时、平均 FPS、导出耗时。 |

## 源码模块（`src/app3d`）

| 文件 | 作用 |
| --- | --- |
| `src/app3d/i18n.js` | 中英文文案与 Cognitive Atlas v2 坐标轴文本常量。 |
| `src/app3d/filters.js` | 检索文本拼接、单行轴标签、名称缩写、空间单元键排序工具。 |
| `src/app3d/state.js` | 筛选与选择状态初始化模块：关键词、模型/空间多选集合及其初始化状态。 |
| `src/app3d/scene.js` | Three.js 场景通用工具：单元偏移、网格带计算、线段构建、组清理、文字精灵。 |
| `src/app3d/ui.js` | 详情面板与校验面板渲染；Accordion 交互与“展开/收起全部”控制。 |
| `src/app3d/interaction.js` | 交互事件绑定模块：集中绑定筛选、视图、语言、窗口等监听器。 |
| `src/app3d/export.js` | 导出能力模块：导出裁剪范围计算、轴标签缩放、PNG data URL 生成与下载。 |
| `src/app3d/url-state.js` | URL 状态模块：解析 query、应用状态、同步状态回 URL。 |
| `src/app3d/details.js` | 详情渲染编排模块：单元聚焦、相关模型分组、详情 payload 组装。 |
| `src/app3d/panels.js` | 面板层：DOM 解析（resolvePanelElements）、工具栏/详情可见性控制。 |

## 第三方依赖（Vendor）

| 文件 | 作用 |
| --- | --- |
| `vendor/three/three.module.js` | Three.js 核心库（本地 vendored，REVISION `163`）。 |
| `vendor/three/examples/jsm/controls/OrbitControls.js` | Three.js 轨道控制器扩展（相机旋转/缩放/平移交互）。 |

## 业务文档（`docs`）

| 文件 | 作用 |
| --- | --- |
| `docs/project-overview/project-file-map.md` | 当前文档：项目逐文件职责清单。 |
| `docs/project-overview/goals.md` | 项目目标：核心、战略、数据治理与非目标。 |
| `docs/process-management/backlog.md` | 从 roadmap 抽取的待办清单；支持 traceability 与 execution-alignment。 |
| `docs/process-management/project-board/backlog/` | 结构化工作项（requirement/issue）；capture-work-items 输出目录。 |
| `docs/changelog/model-library-changelog.md` | 模型库变更日志；按模型粒度记录新增/修改/删除。 |
| `docs/requirements-planning/model-classification-standard.md` | legacy 准入与分类标准，兼容旧 3D 版本说明。 |
| `docs/requirements-planning/cognitive-atlas-v2-system-spec.md` | Cognitive Atlas v2 主规范：名称、坐标、类型系统、关系与门禁。 |
| `docs/requirements-planning/20260304-model-admission-classification.md` | 2026-03-04 批次模型准入与三维分类结果总表。 |
| `docs/requirements-planning/spreadable-cognitive-assets-requirements.md` | 可传播认知资产（抖音竖卡、脚本、落地页）与体系化学习需求。 |
| `docs/designs/2026-03-05-iteration-roadmap.md` | 后续迭代路线设计草案（A/B/C 路线、阶段目标、验收标准）。 |
| `docs/designs/2026-03-06-phase3-architecture-evolution.md` | Phase 3 分发深化 & 架构演进规划（可选方向与优先级）。 |
| `docs/architecture/README.md` | Architecture 文档索引；M1–M5 里程碑交付说明与追溯。 |
| `docs/architecture/20260304-3d-visibility-redesign.md` | 3D 可见性改版设计文档（Proposed）。 |
| `docs/architecture/20260304-model-details-ia-redesign.md` | 详情面板信息架构改版设计文档（Proposed）。 |
| `docs/architecture/20260305-design-principles-optimization.md` | 设计原则驱动的可视化优化与后续建议。 |
| `docs/architecture/20260305-m1-module-boundaries-event-flow.md` | M1 工程基线文档：模块边界划分与事件流。 |
| `docs/architecture/20260305-m2-m3-delivery.md` | M2/M3 交付说明：学习路径、相关模型、URL 状态、嵌入入口与导出命名。 |
| `docs/architecture/20260305-m4-quality-baseline.md` | M4 质量基线交付说明：模块解耦、E2E 扩展、性能预算、默认 UI 优化。 |
| `docs/architecture/20260306-m5-week2-implementation-plan.md` | M5 Week 2 变更可追踪：实施规划（changelog 模板、维护规则、可选脚本）。 |
| `docs/architecture/20260306-phase3-3d-optimization-plan.md` | Phase 3 可选项 & 3D / 详情改版：详细优化计划（局部截图、3D 可见性、主题海报）。 |
| `docs/architecture/20260306-domain-model-data-extraction.md` | domain/model-data 抽离：架构演进首项，模型解析与准入映射迁入 domain 模块。 |
| `docs/architecture/20260306-core-state-completion.md` | core/state 补全：视角/相机状态逻辑迁入 state.js。 |
| `docs/architecture/20260306-core-scene-lifecycle.md` | core/scene 生命周期：场景、渲染器、渲染循环集中管理。 |
| `docs/architecture/20260306-ui-panels-unification.md` | ui/panels 面板层统一：DOM 解析与可见性控制迁入 panels.js。 |
| `docs/guides/share-url-best-practices.md` | 分享链接最佳实践：URL 参数说明、短格式、嵌入建议。 |
| `docs/guides/douyin-publish-template.md` | 抖音发布模板：通用模板、占位符、checklist。 |
| `docs/guides/douyin-publish-mece-phase1.md` | MECE 第一期发布内容：可直接拷贝的标题、话题、评论置顶。 |
| `docs/architecture/promo-export-flow.md` | README 推广图导出与更新流程。 |
| `docs/calibration/2026-03-06-cognitive-loop.md` | 项目认知循环报告；治理周期诊断与推荐任务。 |
| `docs/calibration/2026-03-09-cognitive-loop.md` | 2026-03-09 scope-change 认知循环报告；落地方案驱动治理更新。 |
| `docs/calibration/2026-03-06-repair-loop-report.md` | 修复循环报告；自动化测试与缺陷修复记录。 |
| `docs/calibration/2026-03-09-repair-loop-report.md` | 2026-03-09 修复循环报告；治理变更后 CI 全绿。 |

## 已清理的临时截图（2026-03-04）

下列文件为 UI 调优过程中的本地截图，已在 2026-03-04 清理；规则仍由 `.gitignore` 中的 `.tmp-*.png` 覆盖：

- `.tmp-cell-overview-mode.png`
- `.tmp-cognitive-debug-2.png`
- `.tmp-cognitive-debug-3.png`
- `.tmp-cognitive-debug-zinvert.png`
- `.tmp-cognitive-debug.png`
- `.tmp-cognitive-origin-centered.png`
- `.tmp-cognitive-origin-default.png`
- `.tmp-compact-not-too-tight.png`
- `.tmp-cuboid-grid.png`
- `.tmp-data-file-cell-focus.png`
- `.tmp-default-view-top-expression.png`
- `.tmp-final-i18n-controls.png`
- `.tmp-final-restructured-controls.png`
- `.tmp-language-discoverable.png`
- `.tmp-language-switch.png`
- `.tmp-no-dimension-filters.png`
- `.tmp-no-overlap-same-cell.png`
- `.tmp-no-view-switch-centered.png`
- `.tmp-proper-name-mode.png`
- `.tmp-tag-mode-no-overlap.png`
- `.tmp-toolbar-redesign.png`
- `.tmp-typical-plus-count.png`
- `.tmp-ui-i18n-en.png`
