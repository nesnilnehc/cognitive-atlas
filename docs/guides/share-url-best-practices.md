# 分享链接最佳实践

**Date:** 2026-03-06  
**Scope:** Phase 3 分发能力 — 分享 URL 参数说明与使用建议

---

## 1. 分享链接能力

- 当前视图（语言、视角、模型范围、Atlas 单元）会序列化到 URL 参数
- 复制分享链接（顶栏按钮）会生成**短格式** URL，便于分享
- 跨设备打开同一链接可复现相同视图

---

## 2. URL 参数说明

### 模型落地页（单模型聚焦）

| 参数 | 长格式 | 含义 | 示例 |
|------|--------|------|------|
| `mo` | `model` | 模型落地页直达 | `mo=MECE` |

*说明：当 URL 包含 `model` 或 `mo` 时，系统将直接聚焦到该模型，并展开详情面板（包括定义、坐标、关系、参考资料）。此格式适合作为短视频 CTA、外部文章引用的稳定入口。*

### 短格式（分享推荐）

| 参数 | 长格式 | 含义 | 示例 |
|------|--------|------|------|
| `l` | `lang` | 语言 | `l=en` |
| `v` | `view` | 视角 | `v=promo` / `v=x` / `v=y` / `v=z` |
| `m` | `models` | 选中模型（逗号分隔） | `m=MECE,OKR` |
| `c` | `cells` | Atlas 单元（分号分隔） | `c=2\|3\|2;3\|3\|3` |
| `q` | `q` | 模型检索关键词 | `q=mece` |
| `cq` | `cq` | 单元检索关键词 | `cq=组织` |
| `t` | `tab` | 工具栏标签 | `t=models` / `t=visual` |

### 可选开关（默认开启时省略）

| 短格式 | 长格式 | 含义 | 关闭示例 |
|--------|--------|------|----------|
| `ln=0` | `link=0` | 隐藏同类连线 | `ln=0` |
| `g=0` | `grid=0` | 隐藏长方体网格 | `g=0` |
| `n=0` | `neighbor=0` | 关闭最近邻高亮 | `n=0` |
| `tb=0` | `toolbar=0` | 隐藏筛选面板 | `tb=0` |
| `d=0` | `detail=0` | 隐藏详情面板 | `d=0` |

### 嵌入模式

| 参数 | 含义 |
|------|------|
| `embed=1` | 嵌入模式（简化控件） |
| `simple=1` | 极简模式（隐藏 overlay） |

---

## 3. 使用建议

1. **分享默认视图**：直接复制当前 URL，或使用顶栏「复制分享链接」按钮
2. **分享特定模型组合**：在「检索与聚焦」中选择目标模型后复制链接
3. **分享空间聚焦**：进入单元聚焦后复制链接
4. **嵌入博客/文档**：使用 `embed.html?simple=1&embed=1&...` 作为 iframe src

---

## 4. 示例

```
# 默认中文视图
https://example.com/cognitive-model-3d.html

# 英文 + 推广图视角
https://example.com/cognitive-model-3d.html?l=en&v=promo

# 选中 MECE 与 OKR，英文
https://example.com/cognitive-model-3d.html?l=en&m=MECE,OKR

# 单元聚焦 + 嵌入模式
https://example.com/embed.html?simple=1&embed=1&cells=0|3|2

# 单模型落地页直达
https://example.com/cognitive-model-3d.html?model=MECE

# 单模型落地页直达（嵌入模式，英文）
https://example.com/embed.html?simple=1&embed=1&model=MECE&l=en
```

---

## 4. 配套导出能力

| 能力 | 说明 | 用法 |
|------|------|------|
| **竖卡导出** | 9:16 单模型卡（名称、定义、坐标、CTA「详情见评论」） | 聚焦模型后，更多 → 导出竖卡 |
| **脚本模板** | 钩子→定义→例子→关联，含落地页占位符 | `npm run export:script` 或 `npm run export:script -- MECE` |
