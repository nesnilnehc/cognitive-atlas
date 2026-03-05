# 认知模型数据契约（Data Contract）v1.0

本文档定义了 `data/model-library.js` 中存储的模型数据结构、字段字典及强制校验规则。此契约用于确保模型数据的结构统一与内容质量，为自动化“内容校验”提供唯一的判断基准。

## 1. 核心模型列表 (`window.MODEL_LIBRARY_ROWS`)

每一个模型被定义为数组格式，字段严格按以下顺序排列：

| 索引 | 字段名 | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| 0 | `name` | String | 是 | 模型的英文标准名称，作为全库唯一标识（主键）。 |
| 1 | `aliasZh` | String | 是 | 中文翻译或常用别名。 |
| 2 | `descriptionEn` | String | 是 | 一句话英文定义。要求说明模型的作用核心。 |
| 3 | `category` | Enum | 是 | 顶级分类。可选值: `Expression`, `Structure`, `Diagnosis`, `Strategy`, `Meta`。 |
| 4 | `y` (Override) | Number | 否 | （Y轴：控制深度）特判值。非空时必须是 `1, 2, 3, 4` 之一。 |
| 5 | `z` (Override) | Number | 否 | （Z轴：抽象程度）特判值。非空时必须是 `1, 2, 3, 4` 之一。 |

### 强制内容校验规则 (Content Governance Rules)
1. `descriptionEn` 长度必须 **>= 10 个字符**（防范无意义占位符）。
2. `aliasZh` 长度必须 **>= 2 个字符**。
3. `y` 和 `z` 如果存在，必须成对出现，且值域受限。

---

## 2. 证据包映射 (`window.MODEL_EVIDENCE_PACKS`)

存放支撑模型分类或有效性的经典文献或著作列表。

| 字段特征 | 类型 | 说明 |
|---|---|---|
| Record Key | String | 证据包标识符，例如 `EV-EXP`, `EV-RISK`。 |
| Record Value | String | 引用来源的简略说明，至少应包含作者及代表作品名。 |

### 强制内容校验规则
1. 代码动态绑定的模型证据包 `evidenceByModel` 和分类默认证据包 `evidenceByCategory` 所引用的 Key 必须在 `MODEL_EVIDENCE_PACKS` 中存在对应的值映射（防悬空引用）。

---

## 3. 参考文献扩展库 (`window.MODEL_REFERENCE_RESOURCES`)

为具体的模型提供更详细的参考文献、论文以及出处。键必须是已经存在于 `MODEL_LIBRARY_ROWS` 的模型 `name`。

配置项结构：
- `authors` (Array of Strings): 可选，作者及其归属声明。
- `wikipedia` (Array of Objects): 可选，格式为 `{ title: "...", url: "..." }`
- `books` (Array of Objects): 可选，格式为 `{ title: "...", author: "...", url: "..." }`

### 强制内容校验规则
1. 如果某模型声明了 Reference 详情，则 **必须至少包含 `authors`、`wikipedia` 或 `books` 三个字段中的一个，且引用的数组不得为空（长度 >= 1）**。
2. 凡是包含 `URL` 属性的地方，必须以 `http` 或 `https` 开头（防坏链格式）。
