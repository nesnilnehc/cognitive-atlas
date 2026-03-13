# 认知对象插图设计规范

**Date:** 2026-03-09  
**Status:** Draft  
**Scope:** 为 v2 知识对象设计 illustration 资产

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| 语义还原 | 图应尽可能还原认知对象的本质含义，而非仅按 category 套用模板 |
| 经典参考 | 若该模型有公认的经典图示（如 Maslow 金字塔、Ishikawa 鱼骨、BCG 四象限），可参考其结构进行复刻 |
| 项目复刻 | 参考图仅作结构参考；视觉实现需符合本规范（极简几何、少色、深色底），与 Atlas 风格一致 |
| 极简几何 | 矢量风格、少色、易在竖卡/详情中复用 |
| 可追溯 | 每张图标注参考来源（书籍/论文/维基） |
| 术语标注 | 可选的文本标签（如 ME/CE、80/20、OODA）帮助用户理解，非必须 |

---

## 2. 格式选择：SVG vs 位图

| 格式 | 用途 | 说明 |
|------|------|------|
| **SVG** | 程序化生成、需缩放、竖卡/详情 | 矢量、体积小、可编辑、支持文本；推荐为主要产出格式 |
| **PNG** | 人工精修、OG 图、需要复杂渐变/纹理 | 位图、显示一致性好；MECE 等手工设计资产可保留 PNG |

**结论**：illustration 为概念层命名；实现层以 SVG 为主，PNG 为辅。新增资产优先 SVG。

---

## 3. Schema 草案

```yaml
illustration:
  url: string          # 图片 URL（相对 docs/assets 或 CDN）
  alt: string          # 无障碍描述
  source: string       # 来源简述，如 "McKinsey; Osterwalder"
  license: string      # CC0 / CC-BY / Fair Use 等
```

---

## 4. MECE 插图设计

### 概念要点

- **Mutually Exclusive**：类别互不重叠  
- **Collectively Exhaustive**：类别合起来覆盖全集  

### 视觉方案

- **主体**：一个完整矩形，被划分为 3–4 个不重叠子块  
- **视觉隐喻**：拼图 / 分区图，无 gaps、无 overlaps  
- **配色**：深色背景，子块用低饱和色区分（与 Atlas 风格一致）  
- **可选标注**：ME | CE，或留白  

### 参考来源

- McKinsey 麦肯锡结构化思维  
- 《金字塔原理》Barbara Minto  

---

## 5. 示例资产

| 模型 | 路径 | 说明 |
|------|------|------|
| MECE | `docs/assets/illustrations/mece.svg` | 四方格非重叠分区，ME+CE 视觉隐喻 |
| Fishbone Diagram | `docs/assets/illustrations/fishbone-diagram.svg` | Ishikawa 鱼骨图：鱼头（Effect）朝右，6 个对称的主分支原因向左分支 |

### 预览

MECE 插图：深色背景，中心方形被分为四块互不重叠的色块（青/橙/紫/灰），合起来覆盖整个方形，体现「相互独立、完全穷尽」。

Fishbone 插图：深色背景，脊骨自左至右，鱼头（Effect）在右；包含 6 个对称的主干分类（Measurements, Environment, Materials, Methods, Personnel, Machines），从主脊骨向上下两侧延伸，带水平次枝干表示根因细分。结构对齐维基百科的标准 Ishikawa 布局。参考 [Ishikawa diagram - Wikipedia](https://en.wikipedia.org/wiki/Ishikawa_diagram)。
