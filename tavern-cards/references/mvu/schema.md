# 变量结构脚本（schema.ts）

编写时遵循 `references/mvu/zod-rule.yaml` 中的 Zod 4 规则（含墨月增补节）。

## 调用流程

0. （可选，面向新手或结构未定的项目）先走 `references/mvu/design-dialogue.md` 的设计对话层，用大白话逐轮确认需要保存的状态、字段命名与集合结构，再进入下述流程
1. 读取 `创作规划.yaml` 的 `mvu` 段，提取变量结构大纲
2. 向用户展示当前变量结构大纲，询问是否确认或需要补充调整
3. 若项目使用 EJS，读取 entryManifest 中含 EJS note 的条目，确认 schema 将覆盖所有条件引用的 `stat_data.xxx` 路径
4. 确认后调 `schema-agent` 编写 schema.ts

## 加载与 import 约束

`schema.ts` 由 forge 通过 jiti 在 Node 侧加载，运行时已注入全局 `z`（Zod v4）与 `_`（lodash）。

- pack 与 validate-mvu 会做预检（`checkSchemaTsContent`），命中即报错退出并列出违法语句
- 报错原文含「do NOT run `npm install`」「Cannot find module 'zod'」——遇到直接删除对应 import，**不要给项目 `npm install zod`/`lodash`**
- Zod 脚本由 pack 从 schema.ts 自动生成（通过 state.zod 驱动），CDN URL import（`import { registerMvuSchema } from 'https://...'`）自动追加，无需手写

**同一 `z.object({...})` 内不得重复字段键**（含嵌套对象与 `.prefault({...})` 默认值对象）。重复键在运行时会被 JS 静默覆盖——Zod 只保留最后一个，运行时校验检不出来，只有前端 vue-tsc（TS1117）会报。因此，forge 在源码层提前拦截：pack 与 validate-mvu 命中即报错。

## 产出

写入项目目录下的 `schema.ts`，导出 `Schema` 和对应类型。

## 修改纪律（墨月增补）

- 修改已有脚本时保留未要求改变的字段和约束；不把不同写法当作重写理由，已有代码自查以实际错误为依据
- 已保存开局值与新结构冲突时，指出具体字段及需要更新的文件（按 `references/mvu/guide.md`「变更传播矩阵」），不偷改其他文件，也不为了接受错误初值而放宽正确结构
- 空集合也要完整类型：不能因开局为空就写成任意类型，未来项目结构在本文件确定
- 剧情触发、角色知情、单次变化幅度与旧值比较属于更新规则或专门脚本，不伪装成 Schema 能力

## 与墨月 schema.js 形态的差异说明（移植过滤项）

墨月原知识交付的是可直接安装的 `schema.js`：内含 `import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js'`、`export const Schema = z.object({...})` 与 `$(() => { registerMvuSchema(Schema); })` 运行时注册外壳。tavern-cards 采用 `schema.ts` 源码形态并**过滤掉外壳知识**，原因：

1. 本文件顶部禁止任何 `import`（`z`/`_` 为全局注入）；运行外壳由 forge 在 pack 时自动生成——import URL 来自 `state.zod.importUrl`，与墨月手写的 CDN URL 相同。墨月的手写外壳即 forge 自动产物的「手写版」，保留它会造成双重注册且无法通过预检。
2. 实测：含 import 的 schema.ts 会被 `validate-mvu` / `pack` 预检（`checkSchemaTsContent`）直接报错退出；剔除后全链路（validate-mvu → configure → pack）与原生写法产物结构一致。验证记录见 `移植留档/t5-verification-report.md`。

因此：Zod 结构写法（已并入 `zod-rule.yaml` 增补节）全部保留；`registerMvuSchema` 外壳、jsdelivr import、`$(...)` 注册三样不再出现在知识中。
