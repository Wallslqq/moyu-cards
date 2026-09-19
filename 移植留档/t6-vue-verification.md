# T6 技术验证报告：Vue 路线可用性 + 原生路线浏览器渲染

日期：2026-09-19　|　对应 T6 卡：vue-build 的 Vue 来源按 4.5 验证后改写；验收含「假 schema 测原生路线产物浏览器可打开渲染」

## 一、Vue 路线验证（酒馆助手 runtime-only Vue 是否支持骨架模板渲染）

墨月原知识断言：酒馆助手默认 Vue 为 runtime-only（无模板编译器），墨月靠导出时附带内置完整版 Vue 解决；fork 环境无导出环节，须实测并改写。

实测方法：Vue 3.5.13 官方构建（`vue.runtime.global.prod.js` 100KB / `vue.global.prod.js` 158KB），Chrome headless（`--virtual-time-budget=3000 --dump-dom`）渲染三个同构测试页（DOM 模板含 `v-if`/`v-text`/`v-for`，与墨月骨架指令集一致）：

| 测试 | 构建形态 | 模板形态 | 结果 |
|------|---------|---------|------|
| A | runtime-only（模拟酒馆助手默认） | DOM 模板（墨月骨架形态） | ❌ 渲染失败：`v-cloak` 不移除、无输出（编译器缺失） |
| B | 完整版（含编译器） | DOM 模板（墨月骨架形态） | ✅ 渲染成功 |
| C | runtime-only | 渲染函数 `h()` | ✅ 渲染成功 |

**结论与决策**（按 T6 卡给的选项）：runtime-only 不支持骨架 DOM 模板渲染。选择「**需附带完整版 Vue 的 CDN script**」路线——`vue-build.md` 骨架在 `<head>` 内置 `<script src="https://testingcf.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js">`（本路线唯一允许的外部脚本），骨架其余部分与墨月原版逐字一致；另加 `typeof Vue === 'undefined'` 加载失败检测（显示可读错误态）。渲染函数方案（测试 C 可行）作为备选记录；项目要求零外部 CDN 时回退原生路线。文档已注明与墨月原知识的差异原因。

## 二、原生路线验收（T6 卡：假 schema 测产物浏览器可打开渲染）

假 schema：`主角{姓名,体力,是否觉醒,状态}` + `背包{学生证{数量,描述}}`。按 `native-build.md` 固定骨架填合同（text 绑定 / boolean 的 true-text/false-text / progress 0~100 / details 折叠），Chrome headless 双场景：

| 场景 | 结果 |
|------|------|
| 直接打开产物（无酒馆助手环境） | ✅ 非 White screen；正确进入 error 态「状态栏初始化失败。」，状态机与 CSS 正常 |
| 注入 stub（`Mvu.getMvuData` 返回假数据 + `_`/`waitGlobalInitialized`/`eventOn`/`getCurrentMessageId` 模拟） | ✅ content 态渲染：姓名=林然、状态=正常、boolean false→「未觉醒」、体力值=80、进度条 `width: 80%`、背包数量=1，全部与假 initvar 一致 |

## 三、归档

- `t6-vue-test-a-runtime-dom.html` / `t6-vue-test-b-full-dom.html` / `t6-vue-test-c-runtime-render.html`（Vue 三连测）
- `native-statusbar-product.html`（假 schema 原生产物）/ `native-statusbar-stub.html`（stub 测试版）
- 本报告
