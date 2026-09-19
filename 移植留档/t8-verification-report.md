# T8 全链路验证报告

日期：2026-09-19　|　commit 基线：52fce1d（T7）　|　执行环境：上游 `C:/AI/Workbuddy/tavern_cards`（只读参照）与 fork `C:/AI/Workbuddy/moyu-cards`，双侧 forge 均为仓库原样零改动

## 一、验证目的

对照移植方案第 7 节验收标准，完成 A 线（原版性能回归）与 B 线（墨月新能力）两条全链路实测。

## 二、A 线：fork vs 上游 forge 行为一致性（原版性能回归）

### 2.1 静态一致性（强证据）

| 对象 | 上游 MD5 | fork MD5 | 结论 |
|---|---|---|---|
| `scripts/tavern-cards-forge.mjs` | cf63f3fa7abe3be621229df6a533af13 | 同左 | 逐字节一致 |
| `assets/` 全部 9 文件 | — | — | 逐一 MD5 对比，0 差异 |

forge 是单文件 CLI，脚本与 assets 输入完全一致 → 相同项目输入下行为必然一致。

### 2.2 实测双跑（动态验证）

同一项目定义（T8A：T5 基线 MVU 工件 + 角色两部件条目）在两个独立临时工作区分别用**上游 forge** 与 **fork forge** 跑完整链路：

```
init --mvu → patch(mvu-prereq) → patch(mvu-patch) → patch(条目注册)
→ validate-mvu → configure → pack --output → unpack --file --fresh
```

两侧九步全部成功（pack 输出 "Packed character (JSON)"、unpack 还原 6 entries）。

**产物对比**（归一化：剔除 id/uid/scriptId/avatar/create_date 等非确定性字段后 JSON 逐字节比较）：

| 对比项 | 结果 |
|---|---|
| `tavern-cards-state.json` | **一致** |
| pack 产物 `out.json` | **一致** |

**结论：上游 forge 与 fork forge 全链路产物归一化后逐字节一致，forge 行为零回退。**（configure 时的 "conditional threshold but no scope set" 为两侧一致出现的提示性警告，非差异。）

### 2.3 覆盖命令

init / patch / validate-mvu / configure / pack / unpack / query（T7 断点续接已覆盖 query）——**全部六命令+query 实测通过**。

## 三、B 线：墨月新能力全流程（intake-router → 人物生境 → statusbar-simple → pack）

测试项目 T8B（临时工作区，工件归档 `t8-verification/`）：

### 3.1 流程实录

1. **倾倒与分流（intake-router）**：模拟用户自由倾倒程遥（20 岁海洋大学学生、自由潜水）的材料 → 按七类标签拆分，6 个材料包写入 `materials/*.md`（基础信息/生活结构/人物性情/场景表达/穿衣风格五类非空 + 长期人设外材料移出）——对应 `tavern-design/references/moyue/intake-router.md` 的标签与去向规则
2. **创作规划**：`创作规划.yaml` 记录 `project.character_route: habitat`（路线一次判定，见 3.3）、`ui_mode: simple`、五专项条目规划与状态栏绑定清单
3. **人物生境五专项**：`<程遥_基础信息/穿衣风格/生活结构/人物性情/场景表达>` 五个最终标签条目（内容全部可追溯至材料包，无 AI 补写）
4. **MVU**：简单 schema.ts（状态栏绑定所需）+ initvar + 变量更新规则（含墨月「没有专门规则≠变量失效」表述）
5. **statusbar-simple 原生路线**：按 `native-build.md` 固定骨架填充合同 CSS/DOM，`data-mvu-path`/`data-mvu-progress`/`data-true-text` 绑定 `stat_data.程遥.*`，零自定义 JS
6. **forge 链路**：init → 模板复制 → 素材落位 → patch×3 → validate-mvu → configure → pack 全部成功

### 3.2 产物验证（`out.json`，SillyTavern charactercard JSON）

| 检查项 | 结果 |
|---|---|
| 世界书条目 | 9 条 = 5 人物生境 + 4 MVU，全部含生境标签 ✓ |
| Zod 运行脚本 | tavern_helper.scripts 含 MVU + Zod；头部 `registerMvuSchema` import、尾部注册调用、含程遥 Schema 定义 ✓ |
| 状态栏正则脚本 | regex_scripts 数组含「状态栏界面」，`replace_file` 已展开为 6066 字符内联 HTML ✓ |
| 状态栏绑定 | 姓名/体力进度/布尔双文本绑定逐字对应；无 @qk-slot 残留 ✓ |
| 浏览器渲染（Chrome headless） | DOM 6225 字符非白屏；无酒馆环境正确显示「状态栏初始化失败」错误态（符合 native-build.md 落盘验证要求）✓ |

### 3.3 路线不混用字段（验收标准第 7 节）

- B 线创作规划已实测 `project.character_route: habitat` 字段可用
- **发现缺口**：T7 织入时 SKILL.md/planning-yaml.md 均未记载该字段 → 本次在 `tavern-cards/SKILL.md` 人物条目创作路线判定段增补一句：「同一项目内不混用两条路线：入口一次判定，结果写入 `创作规划.yaml` 的 `project.character_route`（`palette` / `habitat`，缺省视为 `palette`）」。属增补性修改，不触碰原三档语义与任何强制点。

## 四、过程中发现与处理（经验沉淀）

1. **JSON Patch 多级 add 限制**：注册新条目组需一次 add 整组对象（`/entryManifest/角色` 整体），不能先 add 父路径再 add 子路径——forge 用的是严格 RFC 6902（不能为中间节点自动创建）。
2. **init 时序**：init 会创建/规整项目目录，mvu-templates 复制与工件写入必须在 init 之后（T5 已踩过，T8 再次确认）。
3. **configure 的 required 配对**：角色类型 basic 与 personality 均 required，注册条目需成对，否则 configure 报「required part 条目数不一致」。
4. **pack 形态转换**：state 中的对象形态 regex_scripts/tavern_helper.scripts 在 pack 产物中转为数组；`replace_file` 引用展开为内联 `replaceString`（产物自包含）。
5. **环境坑（新增）**：本机环境下 `fs.cpSync(src, dst, {recursive:true})` 向「父路径含中文且子目录不存在」的目标复制时可能静默不生效——目录类复制改用 `mkdirSync + copyFileSync` 逐文件执行。

## 五、验收对照（第 7 节清单核销）

**原版性能不回退（原则 2）**
- [x] README 五项安装测试全部通过（T7；活体消息测试待用户新会话确认）
- [x] forge 全命令行为与上游一致（本报告 2.1/2.2/2.3）
- [x] 三道防线强制步骤表述与强制位不变（T7 diff 复核：忽略空白后 cards +33/-3、design +10/-0、ui +18/-0，删除行均为目录树连接符）
- [x] 原有创作路线文档内容 diff = 0（T6/T7 分项复核 + T7 commit diff 确认）
- [x] 现有项目 resume 流程可用（T7：InternationalStudent 只读零报错）

**墨月知识零遗弃（原则 3）**
- [x] 35 项全部有去向（T1 manifest + T3/T4/T5/T6 归档）
- [x] 七要素合同原文保留（T4 验收逐篇 diff）

**兼容性（原则 4）**
- [x] 同一项目两条人物路线不混用，创作规划有路线记录字段（本报告 3.3：字段实测 + SKILL.md 增补）
- [x] MVU 增补前后 validate-mvu/pack 输出一致（T5）
- [x] ui_mode 原三档语义不变（T6）
- [x] B 线全流程跑通：倾倒 → 七类材料包 → 五专项条目 → simple 状态栏 → pack 成卡（本报告第三节）

## 六、归档清单（`移植留档/t8-verification/`）

- `t8a-packed-upstream.json` / `t8a-packed-fork.json` —— A 线双跑 pack 产物（归一化后一致）
- `t8a-state-upstream.json` / `t8a-state-fork.json` —— A 线双跑 state
- `t8b-packed.json` / `t8b-state.json` —— B 线成卡产物与项目 state
- `t8b-statusbar.html` —— B 线原生状态栏成品
- `t8b-materials/` —— 六个七类标签材料包（intake-router 产物形态实例）

**T8 结论：A/B 双线全部通过，移植方案 T1–T8 全部完成，四原则验收清单全项核销。**
