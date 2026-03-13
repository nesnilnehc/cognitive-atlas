#!/usr/bin/env node
/**
 * Generate douyin-publish-{slug}-phase1.md for all models.
 * Uses problemTarget/whenToUse from model-mece-extensions for hooks; model-specific hashtags.
 *
 * Usage: node scripts/generate-douyin-publish-guides.mjs
 * Output: docs/guides/douyin-publish-{slug}-phase1.md
 */
import fs from "node:fs";
import vm from "node:vm";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "data/model-library.js");
const extPath = join(root, "data/model-mece-extensions.js");
const guidesDir = join(root, "docs/guides");
const baseUrl = "https://cognitive-atlas.nesnilnehc.top";

function loadData() {
  const content = fs.readFileSync(dataPath, "utf8");
  const extContent = fs.readFileSync(extPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(extContent, sandbox);
  vm.runInContext(content, sandbox);
  return {
    rows: sandbox.window.MODEL_LIBRARY_ROWS || [],
    mece: sandbox.window.MODEL_MECE_EXTENSIONS || {},
  };
}

function toSlug(name) {
  return name
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/** Manual hook overrides when problemTarget-derived hook is insufficient */
const HOOK_OVERRIDES = {
  OKR: ["目标难落地？OKR 帮你对齐关键成果", "团队各干各的？OKR 帮你战略对齐"],
  "5 Whys": ["根因找不到？五问帮你挖到底", "问题反复出？五问根因法一次捋清"],
  "5W1H": ["策划总漏项？六问帮你补全维度", "交接说不清？5W1H 一次问全"],
  SWOT: ["优劣势看不清？SWOT 四象限帮你梳理", "战略分析入门，从 SWOT 开始"],
  PDCA: ["改进行动没闭环？PDCA 帮你迭代", "计划执行检查处理，持续改进四步法"],
  "Eisenhower Matrix": ["事情太多？四象限帮你排优先级", "紧急重要傻傻分不清？四象限搞定"],
  "Pareto Principle": ["精力分散？80/20 法则帮你聚焦", "帕累托法则：少数关键决定多数结果"],
  "First Principles": ["被惯性思维困住？第一性原理破局", "马斯克都在用的第一性原理思考"],
  "Design Thinking": ["创新没思路？设计思维以人为本", "设计思维：从用户出发做产品"],
  "Lean Startup": ["试错成本高？精益创业快速验证", "精益创业：用最小成本验证假设"],
  "Issue Tree": ["问题拆不干净？问题树帮你分层", "大问题不知从何入手？问题树帮你拆解"],
  "Fishbone Diagram": ["根因散乱？鱼骨图帮你归类", "因果乱成一团？石川图系统梳理"],
  "Feynman Technique": ["学完就忘？费曼学习法帮你真懂", "费曼学习法：能讲清楚才是真学会"],
  "Growth Mindset": ["怕失败？成长型思维让你敢试", "成长型思维：能力是可以发展的"],
  MECE: ["拆解重叠又遗漏？MECE 帮你不重不漏", "问题拆得乱？麦肯锡 MECE 一次捋清"],
  PREP: ["表达没重点？PREP 帮你理清", "沟通逻辑乱？观点先行结构帮你搭框架"],
  PEEL: ["论证不连贯？PEEL 帮你搭结构", "段落缺证据？段落论证结构帮你补全"],
  STAR: ["讲不清成果？STAR 帮你结构化", "面试流水账？情境行为结果模型帮你突出价值"],
  SCQA: ["开篇抓不住人？SCQA 帮你吸睛", "提案没推进力？情境冲突提问模型帮你开场"],
  FABE: ["产品自嗨没转化？FABE 帮你说服", "功能说不清价值？特性优势利益模型帮你"],
  AIDA: ["转化漏斗没规划？AIDA 帮你设计", "营销没心理路线？注意兴趣欲望行动模型帮你"],
  PAS: ["受众感觉还行？PAS 帮你制造紧迫", "文案没购买动力？问题激化解决模型帮你"],
  "Hero's Journey": ["故事没共鸣？英雄之旅帮你打动人心", "发布平淡？用叙事弧线建立情感连接"],
  "4MAT": ["学员抵触或听不懂？4MAT 帮你覆盖全类型", "培训缺 Why 和 How？四象限学习模型帮你"],
  "Elevator Pitch": ["30秒说不清自己？电梯演讲帮你提炼", "路演开场没亮点？电梯演讲模型帮你抓人"],
  "Yes And": ["头脑风暴总否定？Yes And 帮你共创", "创意被扼杀？即兴接纳贡献法帮你破冰"],
  "Value Proposition Canvas": ["功能没人买单？价值主张画布帮你对齐", "自嗨造不出爆款？价值主张画布验真伪"],
};

/** Model-specific hashtag suffixes (beyond category tags). Base #思维模型 #认知工具箱 + nameTag always included. */
const HASHTAG_OVERRIDES = {
  "Fishbone Diagram": "#石川图 #质量管理 #因果分析",
  "5 Whys": "#丰田 #根因分析",
  MECE: "#麦肯锡 #结构化思维",
  "Issue Tree": "#麦肯锡 #问题拆解",
  "Decision Tree": "#期望值 #概率决策",
  "9-Grid Thinking": "#九宫格 #TRIZ",
  "5W1H": "#六问法 #任务委派",
  "P.A.R.A.": "#知识管理 #GTD",
  "Elevator Pitch": "#电梯演讲 #路演 #自我介绍",
  "Hero's Journey": "#品牌故事 #叙事结构",
  "4MAT": "#教学设计 #学习风格",
  "Yes And": "#即兴喜剧 #头脑风暴",
  STAR: "#面试 #简历 #结构化表达",
  FABE: "#销售技巧 #产品说服",
  AIDA: "#营销漏斗 #转化率",
  PAS: "#痛点营销 #文案",
  FMEA: "#风险管理 #质量工程",
  "Chaos Engineering": "#韧性测试 #Netflix",
  "Red Teaming": "#渗透测试 #压力测试",
  "Swiss Cheese Model": "#纵深防御 #安全文化",
  "Eisenhower Matrix": "#时间管理 #优先级",
  RICE: "#产品优先级 #需求排序",
  "Cost-Benefit Analysis": "#成本收益 #投资决策",
  "OODA Loop": "#决策循环 #敏捷",
  "Pros and Cons": "#利弊分析 #选择困难",
  "Regret Minimization": "#长期思维 #贝索斯",
  PESTLE: "#宏观分析 #战略规划",
  "Porter's Five Forces": "#五力模型 #行业分析",
  "Generic Strategies": "#波特 #竞争战略",
  VRIO: "#核心竞争力 #资源分析",
  "BCG Matrix": "#波士顿矩阵 #产品组合",
  "Blue Ocean Strategy": "#蓝海 #价值创新",
  "Ansoff Matrix": "#市场渗透 #增长策略",
  "Value Proposition Canvas": "#产品市场匹配 #用户痛点",
  AARRR: "#增长黑客 #用户增长",
  SCAMPER: "#创新方法 #头脑风暴",
  TRIZ: "#发明原理 #工程创新",
  "Minimum Viable Product": "#MVP #精益创业",
  OKR: ["#目标管理", "#谷歌", "#对齐"],
  KPI: "#绩效考核 #量化指标",
  RACI: "#责任矩阵 #项目协作",
  "Tuckman Model": "#团队建设 #阶段理论",
  "Kotter's 8 Steps": "#变革管理 #领导力",
  "Maslow's Hierarchy": "#需求理论 #动机",
  "Situational Leadership": "#情境领导 #辅导",
  "360 Feedback": "#绩效反馈 #多源评估",
  ORID: "#焦点讨论 #引导",
  "Game Theory": "#博弈论 #策略",
  "Fogg Behavior Model": "#行为设计 #习惯养成",
  "Second-Order Thinking": "#二阶思维 #长期主义",
  "Occam's Razor": "#奥卡姆剃刀 #简洁",
  "Hanlon's Razor": "#汉隆剃刀 #归因",
  Inversion: "#反向思考 #查理芒格",
  "Abstraction Ladder": "#抽象阶梯 #认知层级",
  "Logical Levels": "#逻辑层次 #问题框架",
  Antifragility: "#反脆弱 #塔勒布",
  "Bloom's Taxonomy": "#认知层级 #教学设计",
  "Spaced Repetition": "#间隔重复 #记忆",
  "Ebbinghaus Forgetting Curve": "#遗忘曲线 #复习",
  "Dreyfus Model": "#技能进阶 #新手到专家",
  "Deliberate Practice": "#刻意练习 #一万小时",
  "Double Loop Learning": "#双环学习 #假设检验",
  "Cognitive Bias": "#认知偏差 #批判思维",
  "Mental Models Latticework": "#多元思维 #查理芒格",
  "Black Swan": "#黑天鹅 #塔勒布",
  "Feedback Loop": "#反馈回路 #系统思维",
  "Leverage Points": "#系统杠杆 #梅多斯",
  "Meta-Cognition": "#元认知 #思考思考",
};

/** Derive hooks from problemTarget. Returns [hook1, hook2] */
function deriveHooksFromMece(problemTarget, whenToUse, name, aliasZh, category) {
  const short = (s, max = 35) => (s.length > max ? s.slice(0, max - 1) : s);
  const pt = String(problemTarget || "").trim();
  if (!pt) return null;

  const catVerbs = {
    Expression: ["理清", "结构化"],
    Structure: ["捋清", "补全"],
    Diagnosis: ["追问", "归类", "排查"],
    Strategy: ["量化", "排序", "破局"],
    Meta: ["破局", "升级"],
  };
  const verb = (catVerbs[category] || ["理清"])[0];

  let pain = "";
  let m;
  if ((m = pt.match(/^在[^，。]+[，。]\s*(.+?)(?:[，。]|$)/))) {
    pain = m[1];
  } else if ((m = pt.match(/无法([^，。]+)/))) {
    pain = m[1].replace(/[，、].*$/, "");
  } else if ((m = pt.match(/缺乏([^，。]+)/))) {
    pain = "缺乏" + m[1].replace(/[，、].*$/, "");
  } else if ((m = pt.match(/只停留在([^，。]+)/))) {
    pain = m[1] + "不够深";
  } else if ((m = pt.match(/导致([^，。]+)/))) {
    pain = m[1];
  } else {
    pain = pt.replace(/[，。].*$/, "");
  }
  pain = pain.replace(/(重叠|交叉|遗漏).*$/, "重叠又遗漏").replace(/，.*$/, "").slice(0, 12);
  if (pain.length < 2) return null;

  const q = pain.endsWith("？") ? pain : pain + "？";
  const hook1 = short(`${q}${aliasZh}帮你${verb}`);
  const hook2 = short(`${aliasZh}：${pt.slice(0, 18)}…`);
  return [hook1, hook2];
}

/** Derive title hooks: HOOK_OVERRIDES > mece-derived > category template */
function getHooks(name, aliasZh, descriptionEn, category, mece) {
  if (HOOK_OVERRIDES[name]) return HOOK_OVERRIDES[name];
  if (mece?.problemTarget) {
    const derived = deriveHooksFromMece(mece.problemTarget, mece.whenToUse, name, aliasZh, category);
    if (derived) return derived;
  }
  const short = (s, max = 35) => (s.length > max ? s.slice(0, max - 1) : s);
  const catHooks = {
    Expression: [`表达没逻辑？用${name}结构化`, `讲不清？${aliasZh}帮你搭框架`],
    Structure: [`分析缺维度？${aliasZh}帮你补全`, `问题拆得乱？${aliasZh}一次捋清`],
    Diagnosis: [`根因找不到？${aliasZh}帮你追问`, `失效防不住？用${aliasZh}系统排查`],
    Strategy: [`决策没依据？${aliasZh}帮你量化`, `优先级乱？${aliasZh}帮你排序`],
    Meta: [`思维卡住了？${aliasZh}帮你破局`, `认知升级，从${aliasZh}开始`],
  };
  const cat = catHooks[category];
  return cat ? [short(cat[0]), short(cat[1])] : [short(`${aliasZh}，帮你一次捋清`), short(`${name}：${aliasZh}，思维升级必备`)];
}

function generateHashtags(name, aliasZh, category) {
  const base = "#思维模型 #认知工具箱";
  const nameTag = `#${name.replace(/\s+/g, "").replace(/'/g, "")}`;
  const override = HASHTAG_OVERRIDES[name];
  const extra = Array.isArray(override) ? override.join(" ") : override;
  if (extra) return `${base} ${nameTag} ${extra}`;
  const catTags = {
    Expression: "#表达 #结构化表达",
    Structure: "#结构化思维 #问题分析",
    Diagnosis: "#根因分析 #诊断方法",
    Strategy: "#战略分析 #决策思维",
    Meta: "#元认知 #思维升级",
  };
  return `${base} ${nameTag} ${catTags[category] || "#认知"}`;
}

/** Derive content for one model */
function deriveContent(row, mece) {
  const [name, aliasZh, descriptionEn, category] = row;
  const slug = toSlug(name);
  const encodedName = encodeURIComponent(name);
  const hooks = getHooks(name, aliasZh, descriptionEn, category, mece);
  const short = (s, max = 35) => (s.length > max ? s.slice(0, max - 1) : s);
  return {
    slug,
    name,
    aliasZh,
    encodedName,
    title1: short(hooks[0]),
    title2: short(hooks[1] || hooks[0]),
    hashtags: generateHashtags(name, aliasZh, category),
    commentUrl: `${baseUrl}/cognitive-model-3d.html?model=${encodedName}`,
  };
}

function generateMarkdown(data) {
  return `# ${data.name} 第一期 — 抖音发布内容

**Date:** 2026-03-09  
**Scope:** ${data.aliasZh} 竖卡首发 — 可直接拷贝

---

默认落地页：\`${baseUrl}\`。模板说明见 [抖音发布模板](douyin-publish-template.md)。

---

## 标题（选一，≤35 字）

\`\`\`
${data.title1}
\`\`\`

或

\`\`\`
${data.title2}
\`\`\`

---

## 话题

\`\`\`
${data.hashtags}
\`\`\`

---

## 评论置顶

\`\`\`
完整定义、用法和关联模型戳这里 →
${data.commentUrl}
\`\`\`
`;
}

function main() {
  const { rows, mece } = loadData();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const [name] = row;
    const slug = toSlug(name);
    if (slug === "mece") {
      skipped++;
      continue;
    }
    const data = deriveContent(row, mece[name]);
    const outPath = join(guidesDir, `douyin-publish-${slug}-phase1.md`);
    const md = generateMarkdown(data);
    fs.writeFileSync(outPath, md, "utf8");
    created++;
    console.log(`Created: douyin-publish-${slug}-phase1.md`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (MECE exists).`);
}

main();
