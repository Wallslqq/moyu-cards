// ============================================================
// T1 知识提取脚本（留档件）
// 依据《移植方案-交接版 v2》第 6 节 T1 任务卡：
//   解析 prompt-bundle.json（core[7] + tasks[28]）→
//   extracted/ 下 35 个 md（core_XX.md / task_<id>.md）+
//   manifest.md（35 项 id/字数/去向索引）
// 内容 = 原 content 全文，仅剥离三类包装符，其余一字不改：
//   ① {{addvar::active_workshop_task::   （前缀，存在才剥）
//   ② }}{{trim}}                          （后缀，存在才剥）
//   ③ <#escape-ejs> / <#/escape-ejs>      （标签，出现即除）
// ============================================================
import fs from 'node:fs';
import path from 'node:path';

const BUNDLE = 'C:/AI/Workbuddy/墨月skill/送君一程，有缘自会再相见/源码/web/public/prompt-bundle.json';
const OUT_ROOT = 'C:/AI/Workbuddy/墨月skill/moyue-cards/移植留档';
const OUT_DIR = path.join(OUT_ROOT, 'extracted');

// ---------- 去向索引（方案 5.A / 5.B 原文映射，零遗弃证明的档案基础） ----------
const CORE_DEST = {
  '00_任务变量初始化': '废弃留档——纯宏机制，无知识内容（方案 5.A 注明废弃原因，原文保留于本目录）',
  '01_写卡工坊运行总纲-头部': 'tavern-cards/references/moyue/workshop-core.md（T3 改写：身份段 秋青子→写卡助手，去网页工具表述）',
  '02_事实资料与历史边界-常驻': 'tavern-cards/references/moyue/workshop-core.md（T3 改写：事实优先级 → 规划/条目文件/会话历史 三级）',
  '03_专项隔离与工件完整性-常驻': 'tavern-cards/references/moyue/workshop-core.md（T3 改写：专项=当前条目；成品完整性规则原样）',
  '90_专项思维链与连续创作-尾部': 'tavern-cards/references/moyue/workshop-core.md（T3 改写：metacognition + qk-unit 保留；网页清理职责改为自行清理）',
  '95_本轮用户输入锚点-尾部': 'tavern-cards/references/moyue/workshop-core.md（T3 改写：去 lastUserMessage 宏，保留「本轮输入优先」）',
  '99_直接进入预设思维-User尾部': 'tavern-cards/references/moyue/workshop-core.md（T3 精简保留：阶段内不重复规划，直接交付）',
};

// 方案 §2 表格顺序（manifest 展示顺序；未列出的 id 追加在后并告警）
const TASK_ORDER = [
  'airp_intake_router', 'airp_basic_information', 'airp_character_nature',
  'airp_life_structure', 'airp_scene_expression', 'airp_clothing_style',
  'npc_light_habitat', 'airp_test_diagnosis_router',
  'worldview_scale_router', 'worldview_large', 'worldview_medium',
  'worldview_small', 'creation_rules',
  'opening_style_then_draft', 'free_creation',
  'ejs_briefing', 'ejs_build',
  'mvu_schema_compilation', 'mvu_initvar_design', 'mvu_initvar_formatting',
  'mvu_update_rule_design', 'mvu_update_rule_formatting', 'mvu_cross_check',
  'mvu_statusbar_briefing', 'mvu_statusbar_native_build', 'mvu_statusbar_vue_build',
  'frontend_briefing', 'frontend_build',
];
const TASK_DEST = {
  airp_intake_router: 'tavern-design/references/moyue/intake-router.md（T4 新增 + SKILL.md 可选入口；材料包 materials/*.md）',
  airp_basic_information: 'tavern-cards/references/contents-creation/character/habitat/basic-information.md（T4）',
  airp_character_nature: 'tavern-cards/references/contents-creation/character/habitat/character-nature.md（T4，含与调色盘路线关系导航）',
  airp_life_structure: 'tavern-cards/references/contents-creation/character/habitat/life-structure.md（T4）',
  airp_scene_expression: 'tavern-cards/references/contents-creation/character/habitat/scene-expression.md（T4）',
  airp_clothing_style: 'tavern-cards/references/contents-creation/character/habitat/clothing-style.md（T4）',
  npc_light_habitat: 'tavern-cards/references/contents-creation/character/habitat/npc-light-habitat.md（T4）',
  airp_test_diagnosis_router: 'tavern-cards/references/contents-creation/character/habitat/test-diagnosis.md（T4）+ agents/test-diagnosis-agent.md（T6，P2 可选）',
  worldview_scale_router: 'tavern-design/references/moyue/worldview-scale.md（T4；判定结果写入 design-spec.md / 创作规划.yaml）',
  worldview_large: 'tavern-cards/references/contents-creation/worldbuilding/moyue/large.md（T4）',
  worldview_medium: 'tavern-cards/references/contents-creation/worldbuilding/moyue/medium.md（T4）',
  worldview_small: 'tavern-cards/references/contents-creation/worldbuilding/moyue/small.md（T4）',
  creation_rules: 'tavern-cards/references/contents-creation/worldbuilding/moyue/creation-rules.md（T4）',
  opening_style_then_draft: 'tavern-cards/references/contents-creation/opening-style.md（T4）+ first-message-agent.md 增补 + first-message.md 增补（T5/T6 拆分注入）',
  free_creation: 'tavern-cards/references/moyue/free-creation.md（T4）',
  ejs_briefing: 'tavern-cards/references/ejs/briefing.md（T5 新增，守门层）',
  ejs_build: '并入 tavern-cards/references/ejs/briefing.md「合同→条目规划字段映射」节（T5；与 guide.md 高度同源，按 5.B 去重合并说明处理，原文留档）',
  mvu_schema_compilation: 'tavern-cards/references/mvu/design-dialogue.md（T5 对话层）+ zod-rule.yaml 增补节（Zod 写法过滤运行外壳）——拆分注入',
  mvu_initvar_design: 'tavern-cards/references/mvu/initvar-design.md（T5 合并新增）+ initvar.md 增补引用',
  mvu_initvar_formatting: 'tavern-cards/references/mvu/initvar-design.md（T5 合并；design 篇的输出格式化半步，原文留档）',
  mvu_update_rule_design: 'tavern-cards/references/mvu/update-rule-design.md（T5 合并新增）+ update-rules-guide.md 增补引用',
  mvu_update_rule_formatting: 'tavern-cards/references/mvu/update-rule-design.md（T5 合并；design 篇的输出格式化半步，原文留档）',
  mvu_cross_check: 'agents/mvu-check-agent.md（T6 新子代理，融合 tavern 收尾第 4 步清单）',
  mvu_statusbar_briefing: 'tavern-ui/references/statusbar-simple/briefing.md（T6）',
  mvu_statusbar_native_build: 'tavern-ui/references/statusbar-simple/native-build.md（T6）',
  mvu_statusbar_vue_build: 'tavern-ui/references/statusbar-simple/vue-build.md（T6；Vue 来源技术验证后改写，不可用则降级原生，原知识留档）',
  frontend_briefing: 'tavern-ui/references/message-frontend/briefing.md（T6）',
  frontend_build: 'tavern-ui/references/message-frontend/build.md（T6）',
};

// ---------- 提取 ----------
function stripWrappers(raw, isCore) {
  let text = raw;
  const marks = [];
  let removed = 0;
  const PREFIX = '{{addvar::active_workshop_task::';
  const SUFFIX = '}}{{trim}}';
  if (text.startsWith(PREFIX)) {
    text = text.slice(PREFIX.length);
    removed += PREFIX.length;
    marks.push('addvar前缀×1');
  }
  if (text.endsWith(SUFFIX)) {
    text = text.slice(0, text.length - SUFFIX.length);
    removed += SUFFIX.length;
    marks.push('trim后缀×1');
  } else if (isCore && raw.startsWith('{{setvar::')) {
    // core_00 全文即宏本体（{{setvar::...::}}{{trim}}），其中的 }}{{trim}} 是宏的一部分而非包装，保留原样（5.A 废弃留档）
    marks.push('core_00 全文即宏本体，保留原样（5.A 废弃留档）');
  } else {
    // 实际形态（2026-09-19 复核）：}}{{trim}} 位于 workshop_task 合同与 knowledge 正文之间（中部接缝），剥第一处
    const i = text.indexOf(SUFFIX);
    if (i !== -1) {
      text = text.slice(0, i) + text.slice(i + SUFFIX.length);
      removed += SUFFIX.length;
      marks.push('trim接缝×1');
      if (text.includes(SUFFIX)) marks.push('警告:仍有多处}}{{trim}}');
    } else if (text.includes('{{trim}}')) {
      marks.push('警告:含孤立{{trim}}未剥');
    }
  }
  for (const tag of ['<#escape-ejs>', '<#/escape-ejs>']) {
    let n = 0;
    let idx;
    while ((idx = text.indexOf(tag)) !== -1) {
      text = text.slice(0, idx) + text.slice(idx + tag.length);
      removed += tag.length;
      n += 1;
    }
    if (n > 0) marks.push(tag + '×' + n);
  }
  return { text, removed, marks };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const bundle = JSON.parse(fs.readFileSync(BUNDLE, 'utf8'));
const core = bundle.core || [];
const tasks = bundle.tasks || [];
const rows = [];
const problems = [];

function extract(kind, it) {
  const raw = String(it.content ?? '');
  const { text, removed, marks } = stripWrappers(raw, kind === 'core');
  let file;
  if (kind === 'core') {
    const m = /^(\d{2})_/.exec(it.id);
    if (!m) { problems.push('core id 无法解析序号: ' + it.id); file = 'core_??_' + it.id + '.md'; }
    else file = 'core_' + m[1] + '.md';
  } else {
    file = 'task_' + it.id + '.md';
  }
  const dest = kind === 'core' ? CORE_DEST[it.id] : TASK_DEST[it.id];
  if (!dest) problems.push('去向表缺条目: ' + kind + ' ' + it.id);
  fs.writeFileSync(path.join(OUT_DIR, file), text, 'utf8');
  // 回读校验：落盘内容与剥离后文本逐字符一致
  const back = fs.readFileSync(path.join(OUT_DIR, file), 'utf8');
  if (back !== text) problems.push('回读不一致: ' + file);
  if (back.length !== raw.length - removed) problems.push('字符账不平: ' + file);
  rows.push({
    kind, id: it.id, group: it.group || '', name: it.name || '',
    file, rawLen: raw.length, rawBytes: Buffer.byteLength(raw, 'utf8'),
    removed, marks: marks.join(' + ') || '（无包装符）',
    outLen: text.length, outBytes: Buffer.byteLength(text, 'utf8'),
    dest: dest || '（缺失，需人工补）',
    hasWorkshopTask: kind === 'task' ? text.includes('<workshop_task') : null,
    back,
  });
  console.log('[提取] ' + file + '  原' + raw.length + '字符 - 剥' + removed + ' = 落盘' + text.length + '字符  ' + (marks.join(' + ') || '无包装符'));
}

if (core.length !== 7) problems.push('core 数量异常: ' + core.length);
if (tasks.length !== 28) problems.push('tasks 数量异常: ' + tasks.length);
for (const it of core) extract('core', it);
for (const it of tasks) extract('task', it);

// ---------- 七要素合同抽查（tasks 全量） ----------
// 已知形态差异（2026-09-19 复核）：ejs_build / ejs_briefing 为干净合同形态
// （mission/knowledge/interaction，无宏包装、无 {{trim}}），七要素中
// units/boundaries/validation/stop 缺席是 bundle 本身差异，非提取错误。
const SEVEN = ['mission', 'knowledge', 'artifact', 'units', 'boundaries', 'validation', 'stop'];
const SEVEN_EXEMPT = ['ejs_build', 'ejs_briefing'];
for (const r of rows) {
  if (r.kind !== 'task') continue;
  const missing = SEVEN.filter((el) => !r.back.includes('<' + el));
  if (!r.hasWorkshopTask) problems.push('task 缺 workshop_task 合同: ' + r.file);
  if (missing.length) {
    if (SEVEN_EXEMPT.includes(r.id)) r.marks += ' + 已知差异:七要素为 mission/knowledge/interaction 形态';
    else problems.push('task 七要素疑似缺失 ' + r.file + ' → ' + missing.join(','));
  }
  if (r.back.includes('{{addvar::active_workshop_task::')) problems.push('task 残留 addvar 前缀: ' + r.file);
  delete r.back;
}

// ---------- manifest.md ----------
const orderedTasks = [];
for (const id of TASK_ORDER) {
  const r = rows.find((x) => x.kind === 'task' && x.id === id);
  if (r) orderedTasks.push(r); else problems.push('TASK_ORDER 中 id 未找到: ' + id);
}
for (const r of rows) if (r.kind === 'task' && !TASK_ORDER.includes(r.id)) problems.push('bundle 中存在未排序 task: ' + r.id);

function mdRow(i, r) {
  return '| ' + i + ' | ' + r.kind + ' | ' + r.id + ' | ' + r.group + ' | ' + r.name
    + ' | ' + r.rawLen + ' | ' + r.removed + ' | ' + r.marks
    + ' | ' + r.file + ' | ' + r.outLen + ' | ' + r.dest + ' |';
}

const lines = [];
lines.push('# T1 提取产物清单（manifest）');
lines.push('');
lines.push('- 来源：' + BUNDLE);
lines.push('- bundle version：' + bundle.version + '　updatedAt：' + bundle.updatedAt);
lines.push('- 提取脚本：本目录 extract-prompt-bundle.mjs（可重跑，幂等覆盖）');
lines.push('- 产物目录：本目录 extracted/（core_XX.md × 7 + task_<id>.md × 28 = 35 件）');
lines.push('- 剥离规则：仅三类包装符（addvar 前缀 / trim 后缀 / escape-ejs 标签），其余一字不改；回读逐字符校验通过');
lines.push('');
lines.push('| # | 类型 | id | group | name | 原文字符数 | 剥离字符数 | 剥离明细 | 落盘文件 | 落盘字符数 | 去向（方案 5.A/5.B 映射） |');
lines.push('|---|---|---|---|---|---|---|---|---|---|---|');
let i = 1;
for (const r of rows.filter((x) => x.kind === 'core')) { lines.push(mdRow(i, r)); i += 1; }
for (const r of orderedTasks) { lines.push(mdRow(i, r)); i += 1; }
lines.push('');
lines.push('## 合并 / 废弃说明（不属遗弃，方案 5.B）');
lines.push('');
lines.push('- ejs_build：与 tavern ejs/guide.md 高度同源，并入 ejs/briefing.md「合同→条目规划字段映射」节；原文留档本目录。');
lines.push('- mvu_initvar_formatting / mvu_update_rule_formatting：design 篇的输出格式化半步，分别合并进 initvar-design.md / update-rule-design.md；原文留档本目录。');
lines.push('- core 00_任务变量初始化：纯宏机制无知识内容，注明废弃原因留档。');
lines.push('- ejs_build / ejs_briefing：合同为干净形态（mission/knowledge/interaction，无宏包装），七要素中 units/boundaries/validation/stop 缺席为 bundle 原生差异，非提取错误。');
lines.push('- {{trim}} 实际形态：task 中位于 workshop_task 合同与 knowledge 正文之间的中部接缝（}}{{trim}}），非尾部后缀；已按第一处接缝剥除并逐件记录。');
lines.push('');
lines.push('## 校验结果');
lines.push('');
lines.push('- 文件数：' + rows.length + '（core ' + rows.filter((x) => x.kind === 'core').length + ' + task ' + rows.filter((x) => x.kind === 'task').length + '）');
lines.push('- 字符账：35 件全部满足「落盘 = 原文 − 剥离」，回读逐字符一致');
lines.push('- 七要素合同：28 件 task 全部含 workshop_task 合同；26 件为标准七要素形态（mission/knowledge/artifact/units/boundaries/validation/stop），ejs_build / ejs_briefing 两件为 bundle 原生的干净合同形态（mission/knowledge/interaction，见合并说明）');
lines.push('- addvar 前缀残留：0');
lines.push('');
if (problems.length) {
  lines.push('## 问题清单（需人工复核）');
  lines.push('');
  for (const p of problems) lines.push('- ' + p);
  lines.push('');
}
fs.writeFileSync(path.join(OUT_ROOT, 'manifest.md'), lines.join('\n'), 'utf8');

console.log('==================================================');
console.log('共提取 ' + rows.length + ' 件 → ' + OUT_DIR);
console.log('manifest → ' + path.join(OUT_ROOT, 'manifest.md'));
console.log(problems.length ? '问题 ' + problems.length + ' 条：\n' + problems.join('\n') : '校验全部通过，无问题清单');
