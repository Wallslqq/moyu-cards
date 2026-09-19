// ============================================================
// T4 知识移植脚本（留档件）
// 15 篇墨月 task 知识 → fork references 目录
// 机械替换三类（方案 T4）：①网页应用名词/流程→项目环境 ②代码块交付→写入文件 ③作者确认后应用→用户确认后写入
// 原则：逐短语确定性替换（最长优先），整理稿/蓝图等"对话展示辅助"性质的代码块保留不改；
//       {{user}} 教学内容保留（已声明例外）；分块/楼层/打包器等酒馆通用词不动。
// ============================================================
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/AI/Workbuddy/moyu-cards';
const SRC = path.join(ROOT, '移植留档/extracted');

// [find, replace, 类别] —— 顺序即执行顺序（特异短语在前，兜底规则在后）
const RULES = [
  // ── ① 网页应用名词/流程 → 项目环境（特异短语） ──
  ['→ “人物”页面的“基础信息”页签', '→ 人物条目“基础信息”', '①'],
  ['→ “人物”页面的“生活结构”页签', '→ 人物条目“生活结构”', '①'],
  ['→ “人物”页面的“人物性情”页签', '→ 人物条目“人物性情”', '①'],
  ['→ “人物”页面的“场景表达”页签', '→ 人物条目“场景表达”', '①'],
  ['→ “人物”页面的“穿衣风格”页签', '→ 人物条目“穿衣风格”', '①'],
  ['网页等待作者逐项确认后', '用户逐项确认后', '③'],
  ['网页等待作者分别确认', '用户分别确认', '③'],
  ['网页等待作者确认后', '用户确认后', '③'],
  ['网页等待作者确认', '用户确认', '③'],
  ['网页会在作者确认后', '在用户确认后', '③'],
  ['网页会等待作者确认', '等待用户确认', '③'],
  ['由网页逐份等待作者确认', '逐份等待用户确认', '③'],
  ['网页保留当前专项对话', '会话保留当前专项上下文', '①'],
  ['网页保留本轮分类结果', '项目文件保留本轮分类结果', '①'],
  ['网页会在作者继续发言时自动调用对应规模的知识', '会在用户继续发言时自动加载对应规模的知识文档', '①'],
  ['网页会自动调用对应规模的知识', '会自动加载对应规模的知识文档', '①'],
  ['“MVU 变量”或“EJS”页面', 'MVU 变量或 EJS 知识文档', '①'],
  ['“创作规则”页面', '“创作规则”条目', '①'],
  ['对应作品页面', '对应条目文件', '①'],
  ['当前世界书页面', '当前世界书', '①'],
  ['人物页', '人物条目', '①'],
  ['在当前作品的对应页面使用', '在当前作品的对应条目使用', '①'],
  ['不在页面之间推诿', '不在条目之间推诿', '①'],
  ['先提示点击“建立人物”', '先提示建立人物', '①'],
  ['中央区', '条目文件', '①'],
  ['写入中央开场白', '写入开场白条目', '①'],

  // ── ② 代码块交付 → 写入文件（交付容器；展示辅助类代码块不列于此，保留） ──
  ['单独放在一个可一键复制的代码块内', '单独写入一个独立文件', '①②'],
  ['代码块中只放用户材料', '文件中只放用户材料', '②'],
  ['塞进同一个代码块', '塞进同一个文件', '②'],
  ['副作用说明不能进入代码块', '副作用说明不能进入文件', '②'],
  ['最终规则代码块', '最终规则文件', '②'],
  ['最终纯提示词代码块', '最终纯提示词文件', '②'],
  ['输出独立最终正文代码块', '写入独立最终正文文件', '②'],
  ['输出唯一最终正文代码块', '写入唯一最终正文文件', '②'],
  ['输出唯一最终代码块', '写入唯一最终文件', '②'],
  ['只输出最终代码块', '只写入最终文件', '②'],
  ['配置代码块', '配置文件', '②'],
  ['语义标签代码块', '语义标签文件', '②'],
  ['所有可保存内容分别使用独立代码块', '所有可保存内容分别写入独立文件', '②'],
  ['使用对应标签和独立代码块', '使用对应标签写入独立文件', '②'],
  ['使用各自标签和独立代码块', '使用各自标签写入独立文件', '②'],
  ['并分别放入独立代码块', '并分别写入独立文件', '②'],
  ['闭合标签和独立代码块', '闭合标签和独立文件', '②'],
  ['原样放入独立代码块', '原样写入独立文件', '②'],
  ['带回流语义标签的独立代码块', '带回流语义标签的独立文件', '②'],
  ['每个去向使用一个独立代码块', '每个去向写入一个独立文件', '②'],
  ['拆成多个独立代码块', '拆成多个独立文件', '②'],
  ['分别放进独立代码块', '分别写入独立文件', '②'],
  ['多个人物分别使用独立代码块', '多个人物分别写入独立文件', '②'],
  ['每份正文使用自己的独立代码块', '每份正文写入自己的独立文件', '②'],
  ['最终代码块', '最终文件', '②'],
  ['代码块外', '成品外', '②'],

  // ── 兜底残词 ──
  ['页签', '条目', '①兜底'],

  // ── ③' 术语统一（隶属规则③：作者=用户） ──
  ['作者', '用户', '③兜底'],
];

// character-nature.md 头部导航段（方案 4.1 规定增补，不修改调色盘系文档）
const NATURE_NAV = [
  '> [移植导航] 本篇属**人物生境路线**（design 阶段经 intake-router 分流进入，路线判定记录在创作规划.yaml）。与调色盘路线（personality-palette.md 等 character/ 调色盘系文档）**并存、项目级二选一，同一项目内不混用**。',
  '> 人物生境反模板、反预写答案：不使用调色盘层级、强制衍生、三面性、二次解释结构，用户没想过的部分可以空着；两条路线的最终产物都注册进同一 entryManifest。',
  '> 若项目走调色盘路线，请改读 references/contents-creation/character/ 下的调色盘系文档，不要使用本篇。',
  '',
].join('\n');

const MAP = [
  ['task_airp_intake_router.md', 'tavern-design/references/moyue/intake-router.md', false],
  ['task_worldview_scale_router.md', 'tavern-design/references/moyue/worldview-scale.md', false],
  ['task_airp_basic_information.md', 'tavern-cards/references/contents-creation/character/habitat/basic-information.md', false],
  ['task_airp_character_nature.md', 'tavern-cards/references/contents-creation/character/habitat/character-nature.md', true],
  ['task_airp_life_structure.md', 'tavern-cards/references/contents-creation/character/habitat/life-structure.md', false],
  ['task_airp_scene_expression.md', 'tavern-cards/references/contents-creation/character/habitat/scene-expression.md', false],
  ['task_airp_clothing_style.md', 'tavern-cards/references/contents-creation/character/habitat/clothing-style.md', false],
  ['task_npc_light_habitat.md', 'tavern-cards/references/contents-creation/character/habitat/npc-light-habitat.md', false],
  ['task_airp_test_diagnosis_router.md', 'tavern-cards/references/contents-creation/character/habitat/test-diagnosis.md', false],
  ['task_worldview_large.md', 'tavern-cards/references/contents-creation/worldbuilding/moyue/large.md', false],
  ['task_worldview_medium.md', 'tavern-cards/references/contents-creation/worldbuilding/moyue/medium.md', false],
  ['task_worldview_small.md', 'tavern-cards/references/contents-creation/worldbuilding/moyue/small.md', false],
  ['task_creation_rules.md', 'tavern-cards/references/contents-creation/worldbuilding/moyue/creation-rules.md', false],
  ['task_opening_style_then_draft.md', 'tavern-cards/references/contents-creation/opening-style.md', false],
  ['task_free_creation.md', 'tavern-cards/references/moyue/free-creation.md', false],
];

function applyRules(text) {
  const hits = {};
  let t = text;
  for (const [find, rep, cat] of RULES) {
    let n = 0;
    while (t.includes(find)) { t = t.replace(find, rep); n += 1; }
    if (n > 0) hits[find + ' → ' + rep] = n + '(' + cat + ')';
  }
  return { text: t, hits };
}

const problems = [];
const allHits = {};
for (const [srcName, dstRel, withNav] of MAP) {
  const raw = fs.readFileSync(path.join(SRC, srcName), 'utf8');
  const { text, hits } = applyRules(raw);
  const out = (withNav ? NATURE_NAV : '') + text;
  const dstAbs = path.join(ROOT, dstRel);
  fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
  fs.writeFileSync(dstAbs, out, 'utf8');
  for (const k of Object.keys(hits)) allHits[k] = (allHits[k] || 0) + hits[k];
  // 自检：合同 + 知识标签在位
  const okContract = out.includes('<workshop_task');
  const kTag = raw.match(/<knowledge_[a-z_]+>/);
  const okKnowledge = !kTag || out.includes(kTag[0]);
  if (!okContract) problems.push('缺 workshop_task 合同: ' + dstRel);
  if (!okKnowledge) problems.push('缺知识标签: ' + dstRel);
  console.log('[T4] ' + dstRel + (withNav ? '  (+导航段)' : '') + (okContract && okKnowledge ? ' ✓' : ' ✗'));
}

console.log('==================================================');
console.log('替换明细（短语 → 次数(类别)）：');
for (const k of Object.keys(allHits)) console.log('  ' + allHits[k] + '  ' + k);
console.log(problems.length ? '问题:\n' + problems.join('\n') : '15 篇全部落盘，合同与知识标签完整');
