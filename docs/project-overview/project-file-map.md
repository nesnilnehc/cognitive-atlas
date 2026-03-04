# Project File Map

本文档按“当前仓库实际文件”逐项说明用途，便于维护、交接和清理。

## 根目录文件

| 文件 | 作用 |
| --- | --- |
| `.gitignore` | 忽略 macOS 垃圾文件与本地临时截图（`.tmp-*.png`）。 |
| `README.md` | 项目概览、运行方式、维护命令与结构索引。 |
| `index.html` | 入口页；保留 query/hash 并重定向到 `cognitive-model-3d.html`。 |
| `cognitive-model-3d.html` | 3D 界面的 HTML/CSS 容器与控件定义；通过 importmap 加载 Three.js 与主模块。 |

## 数据与源码

| 文件 | 作用 |
| --- | --- |
| `data/model-library.js` | 模型原始数据源（`MODEL_LIBRARY_ROWS`），并构建证据包、参考资源、阶段A准入结果与汇总。 |
| `src/app.js` | 应用主逻辑：Three.js 场景构建、节点与网格绘制、筛选、视角控制、详情面板与事件绑定。 |
| `src/layout.js` | 布局与标签规则：按分类分配坐标槽位，生成模型渲染输入（x/y/z、标签、评估信息）。 |

## 自动化与脚本

| 文件 | 作用 |
| --- | --- |
| `.github/workflows/model-data-validation.yml` | CI 工作流：在 PR/push(main) 时运行模型数据校验。 |
| `scripts/validate-model-data.mjs` | 本地/CI 共用校验脚本：检查 `data/model-library.js` 中类别合法性、重名、坐标 override 范围和配对完整性。 |

## 源码模块（`src/app3d`）

| 文件 | 作用 |
| --- | --- |
| `src/app3d/i18n.js` | 中英文文案与坐标轴文本常量。 |
| `src/app3d/filters.js` | 检索文本拼接、单行轴标签、名称缩写、空间单元键排序工具。 |
| `src/app3d/scene.js` | Three.js 场景通用工具：单元偏移、网格带计算、线段构建、组清理、文字精灵。 |
| `src/app3d/ui.js` | 详情面板与校验面板渲染；Accordion 交互与“展开/收起全部”控制。 |

## 第三方依赖（Vendor）

| 文件 | 作用 |
| --- | --- |
| `vendor/three/three.module.js` | Three.js 核心库（本地 vendored，REVISION `163`）。 |
| `vendor/three/examples/jsm/controls/OrbitControls.js` | Three.js 轨道控制器扩展（相机旋转/缩放/平移交互）。 |

## 业务文档（`docs`）

| 文件 | 作用 |
| --- | --- |
| `docs/project-overview/project-file-map.md` | 当前文档：项目逐文件职责清单。 |
| `docs/requirements-planning/model-classification-standard.md` | 模型准入与三维分类的规范标准（v1.1）。 |
| `docs/requirements-planning/20260304-model-admission-classification.md` | 2026-03-04 批次模型准入与三维分类结果总表。 |
| `docs/architecture/20260304-3d-visibility-redesign.md` | 3D 可见性改版方案（概览/聚焦等交互设计）。 |
| `docs/architecture/20260304-model-details-ia-redesign.md` | 详情面板信息架构改版方案（分层折叠结构）。 |

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
