# 认知对象插图设计规范

**Date:** 2026-03-09  
**Status:** Draft  
**Scope:** 为 v2 知识对象设计 illustration 资产

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| 语义可视化 | 图应直接传达该模型的核心概念，而非装饰 |
| 极简几何 | 矢量风格、少色、易在竖卡/详情中复用 |
| 可追溯 | 每张图标注参考来源（书籍/论文/维基） |

---

## 2. Schema 草案

```yaml
illustration:
  url: string          # 图片 URL（相对 docs/assets 或 CDN）
  alt: string          # 无障碍描述
  source: string       # 来源简述，如 "McKinsey; Osterwalder"
  license: string      # CC0 / CC-BY / Fair Use 等
```

---

## 3. MECE 插图设计

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

## 4. 示例资产

| 模型 | 路径 | 说明 |
|------|------|------|
| MECE | `docs/assets/illustrations/mece.png` | 四方格非重叠分区，ME+CE 视觉隐喻 |

### 预览

MECE 插图：深色背景，中心方形被分为四块互不重叠的色块（青/橙/紫/灰），合起来覆盖整个方形，体现「相互独立、完全穷尽」。
