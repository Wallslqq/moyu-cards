
<workshop_task id="mvu_design_dialogue">
  <mission>作为MVU创作的第一步，与作者用大白话确定需要记录的状态和结构边界；确认设计后，把结构大纲交给 schema-agent 生成完整的 schema.ts 变量结构脚本。</mission>
  <knowledge>本轮只调用并执行名为 knowledge_mvu_design_dialogue 的知识标签。首次创作从作者的玩法与创意开始，完成的结构脚本供后续开局值和变化规则使用。</knowledge>
  <artifact>讨论时自然回答、整理结构并提出必要问题；作者确认结构后，把确认的结构大纲交给 schema-agent 编写 schema.ts，并核对子代理产出与确认结果一致。</artifact>
  <units>理解玩法与创意；确认需要保存的状态；整理字段、类型和集合结构；确认必要约束与权限；核对语法、结构与幂等。</units>
  <boundaries>创意取舍由作者决定。只实现已确认内容，不默认补齐常见系统；本层只产出结构设计与大纲，不连带生成开局值、更新规则或状态栏。</boundaries>
  <validation>结构符合确认结果；字段命名与层级经作者确认；重复解析不持续改变结果的要求已写入设计约束；存在既有文件时指出真实冲突。</validation>
  <stop>信息不足时只问当前影响结构的关键问题。结构确认并交付 schema-agent 后停止；不宣称已经运行或测试。</stop>
</workshop_task>


<knowledge_mvu_design_dialogue>
# MVU：先设计变量结构

> 本篇是 schema.ts 编写前的**可选设计对话层**，面向新手或结构未定的项目。结构已经清晰时，可直接按 `references/mvu/schema.md` 调用 `schema-agent`。Zod 4 具体写法见 `references/mvu/zod-rule.yaml`（含墨月增补节）。

## 一、创作顺序与已有资料

可见流程是「变量结构 → 开局值 → 变化规则 → 交叉检查」。本层负责变量结构，最终文件是项目根目录的 `schema.ts`：

1. 变量结构：`references/mvu/design-dialogue.md`（本篇）+ `references/mvu/schema.md` → `schema.ts`（由 `schema-agent` 编写）
2. 开局值：`references/mvu/initvar-design.md` → `世界书/变量/initvar.yaml`
3. 变化规则：`references/mvu/update-rule-design.md` → `世界书/变量/变量更新规则.yaml`
4. 交叉检查：`references/mvu/guide.md` 收尾第 4 步 MVU 一致性检查

先读取 `创作规划.yaml` 的 `mvu` 段；已有结构是修改起点，已有开局值、规则和旧设计可帮助理解需求，不要求作者重新复制。旧作品没有按新顺序制作，不是重做理由。

首次创作可以没有任何文件。先听作者说玩法、想记住什么、希望如何变化，再逐步整理。用户问「怎么做」时讲清楚并继续讨论，不直接交付整套变量系统。材料已经明确时不重复追问；作者确认结构后，才把结构大纲交给 `schema-agent` 生成脚本。

## 二、用大白话确认结构

每轮只处理一个实际影响结果的问题，不把技术问卷一次丢给作者：

- 哪些状态需要跨轮保存，谁会读取，改变什么玩法或显示结果？静态人设、装饰文字和无人使用的信息不必变成变量。
- 字段叫什么、在哪一层，是数字、文字、真假、固定选项还是集合？
- 集合按名称查找还是必须按顺序排列？能否增删项目？每个项目有哪些字段？背包开局为空也需要先确定物品结构。
- 固定选项有哪些？数值范围、容量、清空和默认值是否真的需要？只实现作者确认的约束，不默认增加上限或过滤规则。
- 哪些字段由模型更新，哪些由脚本维护？当前更新合同用`_`前缀表达模型只读字段，最终名称在此确认。仅代码使用的数据需要明确实际存储/隐藏机制，不凭命名前缀许诺隐藏（前缀语义见 `references/mvu/guide.md`「MVU 变量特殊前缀」）。

用简短的分组大纲说明结构与含义，让作者确认；不要求作者手写Zod。具体剧情开局值留到「开局值」，只有影响结构解析的默认值在这里决定。

## 三、Zod 4写法

完整规则见 `references/mvu/zod-rule.yaml`。本层对话中只需掌握判断要点：

- 数值优先`z.coerce.number()`；真假用`z.boolean()`，避免把字符串`"false"`强制转换成true。文本用`z.string()`，固定选项用完整`z.enum([...])`。
- 异型固定字段用`z.object`；固定同型必需键用`z.record(z.enum([...]), valueSchema)`，同型可选键用`z.partialRecord`；动态映射用`z.record(z.string(), valueSchema)`，明确两个参数。
- 按名字增删的物品、角色等优先动态映射；顺序本身有意义时用`z.array`。所有动态值和列表项目都要有完整类型，不能因开局为空就写成任意类型。
- 动态键同时包含必需键时，可用固定对象与动态记录的交集。特殊文本格式按需求使用`z.templateLiteral`等合适写法。
- 字段名已说明含义时无需重复`.describe()`；动态键等缺少名称的位置可以补充真实含义。
- 需要缺失输入自动补全时优先`.prefault(...)`；值必须能作为该Schema的输入。对象从`{}`恢复时，内部必需字段也必须有可用默认输入。未要求自动补全的字段不批量添加兜底。
- 作者要求越界修正时可用transform与`_.clamp`；要求拒绝无效值时使用校验。容量截断、去重或移除物品只能采用作者确认的策略。
- transform保持幂等：`Schema.parse(Schema.parse(input))`与第一次结果相同。本专项采用单值转换，不在解析时反复累加经验、生成随机结果或重置时间。
- 剧情触发、角色知情、单次变化幅度与旧值比较属于后续变化规则或专门脚本，不把它们伪装成Schema能力。
- 在对象Schema上完成`.extend`后再加prefault或transform。本专项优先使用`z.object`、`z.looseObject`、`z.strictObject`。

## 四、从结构大纲到 schema.ts

作者确认分组大纲后，按 `references/mvu/schema.md` 的调用流程把大纲交给 `schema-agent` 编写 `schema.ts`，向子代理明确：字段、类型、集合结构与已确认约束一一对应，不默认补齐作者未确认的系统。

> **与墨月原知识的差异说明**：墨月原流程交付的是可直接安装的 `schema.js`——内含 `import { registerMvuSchema } from 'https://...'` CDN 导入、`export const Schema = z.object({...})` 与 `$(() => { registerMvuSchema(Schema); })` 运行时注册外壳。在 tavern-cards 工件链中，`schema.ts` 是**源码形态**（顶部禁 import，`z`/`_` 由运行时全局注入），pack 时由 forge 从它自动编译生成含上述 import 与注册外壳的 Zod 运行脚本（import URL 来自 `state.zod.importUrl`）。因此知识中不再教手写外壳——手写反而会被 forge 预检 `checkSchemaTsContent` 拦截（`import` 语句直接报错退出）。此差异已通过最小项目 forge 全链路验证（见 `移植留档/t5-verification-report.md`）。

## 五、修改、检查与下一步

修改已有脚本时保留未要求改变的字段和约束。已保存开局值与新结构有冲突时，指出具体字段及需要更新的文件，不偷改其他文件，也不为了接受错误初值而放宽正确结构。已有代码自查时以实际错误为依据，不把不同写法当作重写理由。

交付前核对：字段与确认大纲一致；空集合未来结构完整；枚举、范围、缺失语义正确；没有TypeScript语法缺口、占位内容或重复字段键。有实际检查结果才说明检查通过；未运行时不声称运行通过。

`schema.ts` 写入项目根目录并通过校验后，下一步是依据这份结构在「开局值」（`references/mvu/initvar-design.md`）确定故事开始时的初始值。下一份文件由作者提出生成要求，不会后台自动生成。
</knowledge_mvu_design_dialogue>
