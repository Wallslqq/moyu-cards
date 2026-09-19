# T5 技术验证报告：MVU 全链路（增补前后一致性）

日期：2026-09-19　|　执行环境：forge = `tavern-cards/scripts/tavern-cards-forge.mjs`（fork 仓库原样，零改动）
测试目录：`%TEMP%/t5-forge-verify/`（验证后已清理，关键产物归档于本目录）

## 一、验证目的

移植方案 T5 要求：**先**验证「按墨月知识（过滤后）写出的 MVU 工件」在 forge 全链路（init → schema → initvar → validate-mvu → configure → pack）上与 tavern 原生写法表现一致；并确认「剔除 registerMvuSchema 外壳与 import」的过滤规则必要且正确。

## 二、方法

同一最小变量结构（主角对象 + partialRecord 固定可选键 + z.record 动态映射 + `_` 前缀数组），两种 schema.ts 写法：

| 项目 | schema.ts 写法 | initvar / 更新规则 |
|------|---------------|-------------------|
| Base | tavern 原生朴素写法（无 prefault 链、无 transform） | 同一开局数据 |
| Moyue | 墨月过滤后写法（`.prefault` 缺失补全链、`_.clamp` transform、空集合完整类型、`z.boolean()` 防字符串陷阱） | 同一开局数据（墨月 YAML 纪律） |

链路：`init --mvu` → 写工件 → 复制 `assets/mvu-templates/` → patch（prereq + mvu，注入 state.zod）→ `validate-mvu` → `configure` → `pack --output`。

## 三、反向验证（过滤规则必要性）

Moyue 先放置墨月原形态 schema.ts（含 CDN import + `$(() => registerMvuSchema(Schema))` 外壳），运行 validate-mvu：

```
schema.ts must not contain import statements:
  - import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
All required functionality (z, _) is already available as globals in the MVU runtime.
Remove all imports from schema.ts — forge does not bundle additional packages.
（exit 1）
```

预检 `checkSchemaTsContent` 在 jiti 加载前拦截，**带外壳的墨月原形态无法通过链路**——过滤规则必要。

## 四、全链路结果（增补前后对比）

| 步骤 | Base（原生写法） | Moyue（墨月过滤后写法） |
|------|-----------------|------------------------|
| init --mvu | ✓ | ✓ |
| patch prereq + mvu（注入 state.zod） | ✓ 2+11 ops | ✓ 2+11 ops |
| validate-mvu | ✓ 校验通过 | ✓ 校验通过 |
| configure | ✓ | ✓ |
| pack | ✓ `Zod script rebuilt from schema.ts` | ✓ `Zod script rebuilt from schema.ts` |

（备注：Base 首次 pack 因未复制 mvu-templates 缺条目文件，补复制后通过；与写法无关。）

### 产物等价性

对比两份 `packed.json` 中 `extensions.tavern_helper.scripts` 的 Zod 脚本：

- **第 0 行逐字相同**：`import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js'` —— forge 从 `state.zod.importUrl` 自动追加。
- **尾部逐字相同**：`$(() => { registerMvuSchema(Schema); });` —— 同为 forge 自动生成。
- 中间 Schema 定义体差异仅为两种写法本身（行数 23 vs 27）。

**结论：墨月手写外壳（import + `$()` 注册）正是 forge 自动产物「手写版」；schema.ts 作为源码形态剔除外壳后，运行产物与原生写法完全同构。** 4.3 决策「墨月 schema.js 本质是 forge 产物的手写版」获得实验实证。

### Zod 语义验证

墨月写法经 jiti 编译 + Zod 4 实测全部成立：`.prefault({})` 恢复空对象（内部字段均有 prefault）、`z.partialRecord`、`z.record(z.string(), …)` 双参数、顶层 `.transform` 幂等（`_.clamp` 二次 parse 结果不变）、`z.boolean()` 拒绝字符串输入。

## 五、验收对照（T5 卡）

- ✅ validate-mvu 与 pack 在增补前后输出一致（均为「校验通过 / Zod script rebuilt / Packed」三段式成功输出）
- ✅ 过滤项在文档中有差异说明：`references/mvu/schema.md`「与墨月 schema.js 形态的差异说明（移植过滤项）」节 + `references/mvu/design-dialogue.md` 第四节引用块 + `zod-rule.yaml` 墨月增补节头注

## 六、归档文件

- `schema-moyue-raw-shell.ts` —— 反向验证用墨月原形态（被拦截）
- `schema-moyue-filtered.ts` —— 墨月过滤后写法（全链路通过）
- `schema-base-native.ts` —— tavern 原生基线（全链路通过）
- `zod-script-base.txt` / `zod-script-moyue.txt` —— 两份 pack 产物中的 Zod 运行脚本（头尾逐字一致）
- 测试项目 initvar.yaml / 变量更新规则.yaml 两版
