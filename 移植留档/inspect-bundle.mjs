// T1 前置探查：确认 prompt-bundle.json 结构与包装符形态
import fs from 'node:fs';

const BUNDLE = 'C:/AI/Workbuddy/墨月skill/送君一程，有缘自会再相见/源码/web/public/prompt-bundle.json';

const json = JSON.parse(fs.readFileSync(BUNDLE, 'utf8'));
console.log('== 顶层键 ==');
for (const key of Object.keys(json)) {
  const v = json[key];
  console.log(' ', key, Array.isArray(v) ? 'array len=' + v.length : typeof v + ' ' + String(v).slice(0, 60));
}

const core = Array.isArray(json.core) ? json.core : [];
const tasks = Array.isArray(json.tasks) ? json.tasks : [];
console.log('== core 数量:', core.length, ' tasks 数量:', tasks.length, '==');

function show(label, arr, i) {
  const it = arr[i];
  if (!it) { console.log('---', label, i, '不存在'); return; }
  const c = String(it.content ?? '');
  console.log('---', label + '[' + i + '] keys:', Object.keys(it).join(','));
  console.log('  id:', it.id, '| group:', it.group, '| name:', it.name);
  console.log('  content.length:', c.length, '| bytes:', Buffer.byteLength(c, 'utf8'));
  console.log('  HEAD200:', JSON.stringify(c.slice(0, 200)));
  console.log('  TAIL200:', JSON.stringify(c.slice(-200)));
  console.log('  startsWith addvar:', c.startsWith('{{addvar::active_workshop_task::'));
  console.log('  endsWith trim:', c.endsWith('}}{{trim}}'));
  console.log('  <#escape-ejs> 次数:', (c.match(/<#escape-ejs>/g) || []).length,
    '| <#/escape-ejs> 次数:', (c.match(/<#\/escape-ejs>/g) || []).length);
}

show('core', core, 0);
show('core', core, 1);
show('core', core, 4);
show('tasks', tasks, 0);
show('tasks', tasks, 16);

console.log('== 全部 core id ==');
for (const it of core) console.log(' ', JSON.stringify(it.id), '|', it.name);
console.log('== 全部 task id（group | id | name）==');
for (const it of tasks) console.log(' ', it.group, '|', it.id, '|', it.name);
