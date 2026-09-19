// T1 复核：{{trim}} 的实际位置 + ejs 两件的真实形态
import fs from 'node:fs';

const DIR = 'C:/AI/Workbuddy/墨月skill/moyue-cards/移植留档/extracted';
const BUNDLE = 'C:/AI/Workbuddy/墨月skill/送君一程，有缘自会再相见/源码/web/public/prompt-bundle.json';
const bundle = JSON.parse(fs.readFileSync(BUNDLE, 'utf8'));

// 1) 在原始 JSON 里看 {{trim}} 的上下文（前后各 60 字符）
function trimContext(c, label) {
  let from = 0;
  let n = 0;
  for (;;) {
    const i = c.indexOf('{{trim}}', from);
    if (i === -1) break;
    n += 1;
    console.log('  [' + label + '] 第' + n + '处 @' + i + '/' + c.length + '  上文: ' + JSON.stringify(c.slice(Math.max(0, i - 60), i)) + '  下文: ' + JSON.stringify(c.slice(i + 8, i + 68)));
    from = i + 8;
  }
  if (n === 0) console.log('  [' + label + '] 无 {{trim}}');
}

const t0 = bundle.tasks.find((x) => x.id === 'frontend_build');
console.log('== frontend_build 的 {{trim}} 上下文 ==');
trimContext(t0.content, 'frontend_build');

console.log('== core_00 ==');
trimContext(bundle.core[0].content, 'core_00');
console.log('  全文: ' + JSON.stringify(bundle.core[0].content));

// 2) ejs 两件的形态
const eb = bundle.tasks.find((x) => x.id === 'ejs_build');
const ef = bundle.tasks.find((x) => x.id === 'ejs_briefing');
console.log('\n== ejs_build vs ejs_briefing ==');
console.log('  内容完全相同?', eb.content === ef.content);
console.log('  ejs_build  HEAD300: ' + JSON.stringify(eb.content.slice(0, 300)));
console.log('  ejs_build  TAIL300: ' + JSON.stringify(eb.content.slice(-300)));
console.log('  ejs_briefing HEAD300: ' + JSON.stringify(ef.content.slice(0, 300)));
console.log('  ejs_briefing TAIL300: ' + JSON.stringify(ef.content.slice(-300)));
console.log('  ejs_build 含 <workshop_task?', eb.content.includes('<workshop_task'));
console.log('  ejs_briefing 含 <workshop_task?', ef.content.includes('<workshop_task'));

// 3) 全量统计：哪些 task 的 {{trim}} 不是紧跟前缀闭合 }} 的形态
console.log('\n== 全部 35 件的包装符形态盘点 ==');
for (const it of [...bundle.core, ...bundle.tasks]) {
  const c = String(it.content ?? '');
  const flags = [];
  if (c.startsWith('{{addvar::active_workshop_task::')) flags.push('addvar头');
  if (c.endsWith('}}{{trim}}')) flags.push('trim尾(紧贴)');
  if (c.includes('{{trim}}') && !c.endsWith('}}{{trim}}')) flags.push('trim非尾');
  if (c.includes('<#escape-ejs>')) flags.push('escape-ejs');
  console.log('  ' + it.id.padEnd(32) + ' len=' + String(c.length).padEnd(5) + '  ' + (flags.join(', ') || '干净'));
}
