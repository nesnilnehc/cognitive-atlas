# 认知对象插图语义审计

**Date:** 2026-03-09  
**Scope:** 逐个检查 94 个模型插图与概念的语义匹配度

---

## 审计标准

- ✅ 语义还原：图能传达模型核心概念
- ✅ 经典参考：有公认图示的，复刻其结构
- ✅ 项目风格：极简几何、少色、深色底
- ⭕ 术语标注：可选用文本辅助理解

---

## 模型逐个审计

| 模型 | 当前模板 | 概念要点 | 经典图示 | 审计结果 |
|------|----------|----------|----------|----------|
| Black Swan | 同心圆环 | 不可预测、高影响、肥尾 | 正态 vs 肥尾分布 | ✅ 已改为肥尾曲线+术语 |
| Antifragility | 同心圆环 | 从波动中获益 | 凸性响应曲线 | ❌ 需重设计 |
| Feedback Loop | 同心圆环 | 输出影响输入 | 循环箭头 | ✅ 已改为循环+术语 |
| Leverage Points | 同心圆环 | 系统介入点 | Meadows 杠杆层次 | ❌ 需重设计 |
| Dialectics | 同心圆环 | 正反合 | 对立统一图 | ✅ 已改为双圆重叠 |
| Paradox Thinking | 同心圆环 | 矛盾并存 | 双圆重叠 | ❌ 需重设计 |
| Entropy | 同心圆环 | 趋于无序 | 有序→无序 | ❌ 需重设计 |
| Emergence | 同心圆环 | 简单规则→复杂模式 | 自下而上涌现 | ❌ 需重设计 |
| Fogg Behavior Model | 2×2 矩阵 | B=M×A×P | 三要素交汇 | ✅ 已改为三圆交汇 |
| Pareto Principle | 2×2 矩阵 | 80/20 | 柱状图 20:80 | ✅ 已改为柱状+80/20 |
| Eisenhower Matrix | 2×2 矩阵 | 紧急×重要 | 四象限+轴标签 | ✅ 已加术语 |
| BCG Matrix | 2×2 矩阵 | 星/问号/现金牛/狗 | 2×2+标签 | ✅ 已加术语 |
| SWOT | 2×2 矩阵 | S/W/O/T | 四象限 | ⚠️ 可加 S/W/O/T |
| 5 Whys | 鱼骨 | 连续追问 | 链条/阶梯 | ✅ 已改为链条 |
| Swiss Cheese Model | 鱼骨 | 层层防护、孔错开 | 多层切片 | ✅ 已改为多层孔洞 |
| Porter's Five Forces | 2×2 | 五力 | 五力辐射图 | ✅ 已改为五力辐射 |
| PESTLE | 2×2 | 六维 | 六边形/六瓣 | ✅ 已改为六瓣 |
| Abstraction Ladder | 圆环 | 具体↔抽象 | 阶梯 | ✅ 已改为阶梯+术语 |
| PREP/PEEL/STAR/SCQA/FABE... | 线性流 | 表达结构 | 步骤链 | ✅ 可接受 |
| 9-Grid, 5W1H, MECE, Issue Tree... | 已覆盖 | — | — | ✅ 已修正 |
| ... | ... | ... | ... | ... |

---

## 修正优先级

1. **P0**：Black Swan、Swiss Cheese、Porter's Five Forces、Fogg、Pareto、Dialectics
2. **P1**：PESTLE、Entropy、Feedback Loop、Antifragility、Abstraction Ladder
3. **P2**：加术语标注（Eisenhower、BCG、SWOT、OODA、PDCA 等）
