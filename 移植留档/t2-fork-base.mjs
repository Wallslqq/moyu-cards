// ============================================================
// T2 fork 基建脚本（留档件）
// 完整复制 C:/AI/Workbuddy/tavern_cards → moyue-cards/
//   排除：.git 与 .workbuddy（任意层级）
//   合并复制：不删除目标目录已有内容（保留 T1 的 移植留档/）
// 校验：源/目标相对路径集合一致 + 每文件 sha256 一致
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SRC = 'C:/AI/Workbuddy/tavern_cards';
const DST = 'C:/AI/Workbuddy/墨月skill/moyue-cards';
const SKIP_DIRS = new Set(['.git', '.workbuddy']);
const DST_EXTRA_SKIP = new Set(['移植留档']); // 仅目标根目录（T1 产物，不参与上游比对）

const problems = [];
let symlinks = [];

function walk(root, isDst) {
  const out = new Map(); // relPath -> {size, hash}
  function rec(dir, rel) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const name = ent.name;
      if (ent.isSymbolicLink()) { symlinks.push(path.join(rel, name)); continue; }
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(name)) continue;
        if (isDst && rel === '' && DST_EXTRA_SKIP.has(name)) continue;
        rec(path.join(dir, name), rel === '' ? name : rel + '/' + name);
      } else if (ent.isFile()) {
        const fp = path.join(dir, name);
        const rp = rel === '' ? name : rel + '/' + name;
        const buf = fs.readFileSync(fp);
        out.set(rp, {
          size: buf.length,
          hash: crypto.createHash('sha256').update(buf).digest('hex'),
        });
      } else {
        problems.push('非常规条目（跳过）: ' + path.join(rel, name));
      }
    }
  }
  rec(root, '');
  return out;
}

// ---------- 复制 ----------
let copied = 0;
let copiedBytes = 0;
function copyRec(dir, rel) {
  fs.mkdirSync(path.join(DST, rel), { recursive: true });
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = ent.name;
    if (ent.isSymbolicLink()) { continue; } // 已在 walk 中报告
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      copyRec(path.join(dir, name), rel === '' ? name : rel + '/' + name);
    } else if (ent.isFile()) {
      const srcFp = path.join(dir, name);
      const dstFp = path.join(DST, rel === '' ? name : rel + '/' + name);
      fs.copyFileSync(srcFp, dstFp);
      copied += 1;
      copiedBytes += fs.statSync(srcFp).size;
    }
  }
}

console.log('[1/3] 复制上游 → 目标仓库（排除 .git / .workbuddy，合并保留 移植留档/）');
copyRec(SRC, '');
console.log('  复制文件数: ' + copied + '，总字节: ' + copiedBytes);

// ---------- 校验 ----------
console.log('[2/3] 逐文件 sha256 比对（源 vs 目标，双方排除 .git/.workbuddy，目标另排除 移植留档/）');
const srcMap = walk(SRC, false);
const dstMap = walk(DST, true);

let missing = 0, extra = 0, mismatched = 0, matched = 0;
for (const [rp, meta] of srcMap) {
  const d = dstMap.get(rp);
  if (!d) { problems.push('目标缺失: ' + rp); missing += 1; continue; }
  if (d.hash !== meta.hash) { problems.push('内容不一致: ' + rp); mismatched += 1; }
  else matched += 1;
}
for (const rp of dstMap.keys()) {
  if (!srcMap.has(rp)) { problems.push('目标多出: ' + rp); extra += 1; }
}

console.log('  源文件数: ' + srcMap.size + '，目标(排除留档)文件数: ' + dstMap.size);
console.log('  完全一致: ' + matched + ' / 缺失: ' + missing + ' / 多出: ' + extra + ' / 内容不一致: ' + mismatched);
if (symlinks.length) console.log('  遇到符号链接（未跟随，请人工确认）: ' + symlinks.join(', '));

// ---------- 移植留档 完整性 ----------
const archiveOk = fs.existsSync(path.join(DST, '移植留档', 'manifest.md'))
  && fs.existsSync(path.join(DST, '移植留档', 'extract-prompt-bundle.mjs'))
  && fs.existsSync(path.join(DST, '移植留档', 'extracted'))
  && fs.readdirSync(path.join(DST, '移植留档', 'extracted')).length === 35;
console.log('[3/3] 移植留档 完整性（manifest + 提取脚本 + extracted 35 件）: ' + (archiveOk ? 'OK' : '异常'));
if (!archiveOk) problems.push('移植留档 完整性校验失败');

console.log('==================================================');
console.log(problems.length ? '问题 ' + problems.length + ' 条:\n' + problems.join('\n') : 'T2 复制与校验全部通过');
