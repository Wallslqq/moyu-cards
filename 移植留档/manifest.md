# T1 提取产物清单（manifest）

- 来源：C:/AI/Workbuddy/墨月skill/送君一程，有缘自会再相见/源码/web/public/prompt-bundle.json
- bundle version：0ee85c5864004a51　updatedAt：2026-09-12T14:08:15.551Z
- 提取脚本：本目录 extract-prompt-bundle.mjs（可重跑，幂等覆盖）
- 产物目录：本目录 extracted/（core_XX.md × 7 + task_<id>.md × 28 = 35 件）
- 剥离规则：仅三类包装符（addvar 前缀 / trim 后缀 / escape-ejs 标签），其余一字不改；回读逐字符校验通过

| # | 类型 | id | group | name | 原文字符数 | 剥离字符数 | 剥离明细 | 落盘文件 | 落盘字符数 | 去向（方案 5.A/5.B 映射） |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | core | 00_任务变量初始化 | 核心 | 00_任务变量初始化 | 44 | 0 | core_00 全文即宏本体，保留原样（5.A 废弃留档） | core_00.md | 44 | 废弃留档——纯宏机制，无知识内容（方案 5.A 注明废弃原因，原文保留于本目录） |
| 2 | core | 01_写卡工坊运行总纲-头部 | 核心 | 01_写卡工坊运行总纲-头部 | 278 | 0 | （无包装符） | core_01.md | 278 | tavern-cards/references/moyue/workshop-core.md（T3 改写：身份段 秋青子→写卡助手，去网页工具表述） |
| 3 | core | 02_事实资料与历史边界-常驻 | 核心 | 02_事实资料与历史边界-常驻 | 385 | 0 | （无包装符） | core_02.md | 385 | tavern-cards/references/moyue/workshop-core.md（T3 改写：事实优先级 → 规划/条目文件/会话历史 三级） |
| 4 | core | 03_专项隔离与工件完整性-常驻 | 核心 | 03_专项隔离与工件完整性-常驻 | 327 | 0 | （无包装符） | core_03.md | 327 | tavern-cards/references/moyue/workshop-core.md（T3 改写：专项=当前条目；成品完整性规则原样） |
| 5 | core | 90_专项思维链与连续创作-尾部 | 核心 | 90_专项思维链与连续创作-尾部 | 1469 | 27 | <#escape-ejs>×1 + <#/escape-ejs>×1 | core_90.md | 1442 | tavern-cards/references/moyue/workshop-core.md（T3 改写：metacognition + qk-unit 保留；网页清理职责改为自行清理） |
| 6 | core | 95_本轮用户输入锚点-尾部 | 核心 | 95_本轮用户输入锚点-尾部 | 264 | 0 | （无包装符） | core_95.md | 264 | tavern-cards/references/moyue/workshop-core.md（T3 改写：去 lastUserMessage 宏，保留「本轮输入优先」） |
| 7 | core | 99_直接进入预设思维-User尾部 | 核心 | 99_直接进入预设思维-User尾部 | 416 | 0 | （无包装符） | core_99.md | 416 | tavern-cards/references/moyue/workshop-core.md（T3 精简保留：阶段内不重复规划，直接交付） |
| 8 | task | airp_intake_router | 人物生境 | 🧭_人设起点-原始构想整理与分流 | 3470 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_intake_router.md | 3428 | tavern-design/references/moyue/intake-router.md（T4 新增 + SKILL.md 可选入口；材料包 materials/*.md） |
| 9 | task | airp_basic_information | 人物生境 | 🪪_人物生境-基础信息 | 4913 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_basic_information.md | 4871 | tavern-cards/references/contents-creation/character/habitat/basic-information.md（T4） |
| 10 | task | airp_character_nature | 人物生境 | 🫀_人物生境-人物性情 | 5558 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_character_nature.md | 5516 | tavern-cards/references/contents-creation/character/habitat/character-nature.md（T4，含与调色盘路线关系导航） |
| 11 | task | airp_life_structure | 人物生境 | 🏠_人物生境-生活结构 | 5124 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_life_structure.md | 5082 | tavern-cards/references/contents-creation/character/habitat/life-structure.md（T4） |
| 12 | task | airp_scene_expression | 人物生境 | 🎭_人物生境-场景表达 | 5405 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_scene_expression.md | 5363 | tavern-cards/references/contents-creation/character/habitat/scene-expression.md（T4） |
| 13 | task | airp_clothing_style | 人物生境 | 👗_人物生境-穿衣风格 | 2757 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_clothing_style.md | 2715 | tavern-cards/references/contents-creation/character/habitat/clothing-style.md（T4） |
| 14 | task | npc_light_habitat | 人物生境 | 👥_NPC-轻量人物生境 | 2790 | 42 | addvar前缀×1 + trim接缝×1 | task_npc_light_habitat.md | 2748 | tavern-cards/references/contents-creation/character/habitat/npc-light-habitat.md（T4） |
| 15 | task | airp_test_diagnosis_router | 人物生境 | 🧪_人设实测-结果分析与回流 | 5830 | 42 | addvar前缀×1 + trim接缝×1 | task_airp_test_diagnosis_router.md | 5788 | tavern-cards/references/contents-creation/character/habitat/test-diagnosis.md（T4）+ agents/test-diagnosis-agent.md（T6，P2 可选） |
| 16 | task | worldview_scale_router | 世界观 | 🧭_世界观规模判断与分流 | 3803 | 42 | addvar前缀×1 + trim接缝×1 | task_worldview_scale_router.md | 3761 | tavern-design/references/moyue/worldview-scale.md（T4；判定结果写入 design-spec.md / 创作规划.yaml） |
| 17 | task | worldview_large | 世界观 | 🌌_大型世界观 | 6630 | 42 | addvar前缀×1 + trim接缝×1 | task_worldview_large.md | 6588 | tavern-cards/references/contents-creation/worldbuilding/moyue/large.md（T4） |
| 18 | task | worldview_medium | 世界观 | 🌐_中型世界观 | 5211 | 42 | addvar前缀×1 + trim接缝×1 | task_worldview_medium.md | 5169 | tavern-cards/references/contents-creation/worldbuilding/moyue/medium.md（T4） |
| 19 | task | worldview_small | 世界观 | 🌱_小型世界观 | 4255 | 42 | addvar前缀×1 + trim接缝×1 | task_worldview_small.md | 4213 | tavern-cards/references/contents-creation/worldbuilding/moyue/small.md（T4） |
| 20 | task | creation_rules | 世界观 | 📐_规则-纯提示词 | 6365 | 42 | addvar前缀×1 + trim接缝×1 | task_creation_rules.md | 6323 | tavern-cards/references/contents-creation/worldbuilding/moyue/creation-rules.md（T4） |
| 21 | task | opening_style_then_draft | 通用创作 | 🎬_开场白-文风与成稿 | 2773 | 42 | addvar前缀×1 + trim接缝×1 | task_opening_style_then_draft.md | 2731 | tavern-cards/references/contents-creation/opening-style.md（T4）+ first-message-agent.md 增补 + first-message.md 增补（T5/T6 拆分注入） |
| 22 | task | free_creation | 通用创作 | 🧰_自由创作助手 | 2602 | 42 | addvar前缀×1 + trim接缝×1 | task_free_creation.md | 2560 | tavern-cards/references/moyue/free-creation.md（T4） |
| 23 | task | ejs_briefing | EJS | 🧭_EJS-工件设计 | 2133 | 0 | （无包装符） + 已知差异:七要素为 mission/knowledge/interaction 形态 | task_ejs_briefing.md | 2133 | tavern-cards/references/ejs/briefing.md（T5 新增，守门层） |
| 24 | task | ejs_build | EJS | ⚙️_EJS-工件创作 | 2133 | 0 | （无包装符） + 已知差异:七要素为 mission/knowledge/interaction 形态 | task_ejs_build.md | 2133 | 并入 tavern-cards/references/ejs/briefing.md「合同→条目规划字段映射」节（T5；与 guide.md 高度同源，按 5.B 去重合并说明处理，原文留档） |
| 25 | task | mvu_schema_compilation | MVU | 🧬_MVU-变量结构脚本 | 3082 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_schema_compilation.md | 3040 | tavern-cards/references/mvu/design-dialogue.md（T5 对话层）+ zod-rule.yaml 增补节（Zod 写法过滤运行外壳）——拆分注入 |
| 26 | task | mvu_initvar_design | MVU | 🌱_MVU-初始变量设计 | 1751 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_initvar_design.md | 1709 | tavern-cards/references/mvu/initvar-design.md（T5 合并新增）+ initvar.md 增补引用 |
| 27 | task | mvu_initvar_formatting | MVU | 🧾_MVU-初始变量格式化 | 1589 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_initvar_formatting.md | 1547 | tavern-cards/references/mvu/initvar-design.md（T5 合并；design 篇的输出格式化半步，原文留档） |
| 28 | task | mvu_update_rule_design | MVU | ⚖️_MVU-变量规则设计 | 1931 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_update_rule_design.md | 1889 | tavern-cards/references/mvu/update-rule-design.md（T5 合并新增）+ update-rules-guide.md 增补引用 |
| 29 | task | mvu_update_rule_formatting | MVU | 📐_MVU-变量规则格式化 | 1869 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_update_rule_formatting.md | 1827 | tavern-cards/references/mvu/update-rule-design.md（T5 合并；design 篇的输出格式化半步，原文留档） |
| 30 | task | mvu_cross_check | MVU | 🔍_MVU-三文件交叉检查 | 1531 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_cross_check.md | 1489 | agents/mvu-check-agent.md（T6 新子代理，融合 tavern 收尾第 4 步清单） |
| 31 | task | mvu_statusbar_briefing | MVU | 🧭_MVU-状态栏需求判定 | 5185 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_statusbar_briefing.md | 5143 | tavern-ui/references/statusbar-simple/briefing.md（T6） |
| 32 | task | mvu_statusbar_native_build | MVU | 🪶_MVU-原生状态栏创作 | 7045 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_statusbar_native_build.md | 7003 | tavern-ui/references/statusbar-simple/native-build.md（T6） |
| 33 | task | mvu_statusbar_vue_build | MVU | 🧩_MVU-Vue状态栏创作 | 7720 | 42 | addvar前缀×1 + trim接缝×1 | task_mvu_statusbar_vue_build.md | 7678 | tavern-ui/references/statusbar-simple/vue-build.md（T6；Vue 来源技术验证后改写，不可用则降级原生，原知识留档） |
| 34 | task | frontend_briefing | 前端 | 🧭_前端-需求与实现方案 | 8287 | 42 | addvar前缀×1 + trim接缝×1 | task_frontend_briefing.md | 8245 | tavern-ui/references/message-frontend/briefing.md（T6） |
| 35 | task | frontend_build | 前端 | 🎨_前端-正式创作 | 3765 | 42 | addvar前缀×1 + trim接缝×1 | task_frontend_build.md | 3723 | tavern-ui/references/message-frontend/build.md（T6） |

## 合并 / 废弃说明（不属遗弃，方案 5.B）

- ejs_build：与 tavern ejs/guide.md 高度同源，并入 ejs/briefing.md「合同→条目规划字段映射」节；原文留档本目录。
- mvu_initvar_formatting / mvu_update_rule_formatting：design 篇的输出格式化半步，分别合并进 initvar-design.md / update-rule-design.md；原文留档本目录。
- core 00_任务变量初始化：纯宏机制无知识内容，注明废弃原因留档。
- ejs_build / ejs_briefing：合同为干净形态（mission/knowledge/interaction，无宏包装），七要素中 units/boundaries/validation/stop 缺席为 bundle 原生差异，非提取错误。
- {{trim}} 实际形态：task 中位于 workshop_task 合同与 knowledge 正文之间的中部接缝（}}{{trim}}），非尾部后缀；已按第一处接缝剥除并逐件记录。

## 校验结果

- 文件数：35（core 7 + task 28）
- 字符账：35 件全部满足「落盘 = 原文 − 剥离」，回读逐字符一致
- 七要素合同：28 件 task 全部含 workshop_task 合同；26 件为标准七要素形态（mission/knowledge/artifact/units/boundaries/validation/stop），ejs_build / ejs_briefing 两件为 bundle 原生的干净合同形态（mission/knowledge/interaction，见合并说明）
- addvar 前缀残留：0
