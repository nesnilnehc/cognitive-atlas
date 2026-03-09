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

| 模型 | 文档 |
|------|------|
| MECE 第一期 | [douyin-publish-mece-phase1.md](douyin-publish-mece-phase1.md) |

---

## 7. 相关文档

- [分享链接最佳实践](share-url-best-practices.md) — URL 参数说明
- [可传播认知资产需求](../requirements-planning/spreadable-cognitive-assets-requirements.md) — 竖卡、脚本、落地页规范
