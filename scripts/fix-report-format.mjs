/**
 * 2/23〜26 のレポートのリンクフォーマットを修正するスクリプト
 *
 * 問題: [要約テキスト](URL) / [要約](URL) / [URL](URL) など不正なラベル
 * 修正: 説明テキストをリンクラベルとして [説明テキスト](URL) 形式に統一
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'docs', 'data');

const INVALID_LABELS = new Set(['要約テキスト', '要約']);

/**
 * リンクラベルが不正かどうかを判定（「要約テキスト」「要約」またはURLと同じ場合）
 */
function isInvalidLabel(label, url) {
  return INVALID_LABELS.has(label) || label === url;
}

/**
 * 箇条書き1行を修正する
 * "説明テキスト。[不正ラベル](URL)" → "[説明テキスト](URL)"
 */
function fixLine(line) {
  if (!line.startsWith('- ')) return line;

  const content = line.slice(2); // "- " を除く

  // 行内のリンクを全て取得
  const linkPattern = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  const links = [...content.matchAll(linkPattern)];

  if (links.length === 0) return line;

  // リンク前の説明テキストを取得
  const firstLinkStart = content.indexOf('[');
  const prefixText = firstLinkStart > 0
    ? content.slice(0, firstLinkStart).trim().replace(/[。、]$/, '')
    : '';

  // 全リンクのラベルが正常であれば変更しない
  const allValid = links.every(([, label, url]) => !isInvalidLabel(label, url));
  if (allValid) return line;

  // リンク前に説明テキストがある場合 → 説明テキストをラベルにして再構成
  if (prefixText) {
    const fixedLinks = links.map(([, label, url]) => {
      if (isInvalidLabel(label, url)) {
        return `[${prefixText}](${url})`;
      }
      return `[${label}](${url})`;
    });
    return '- ' + fixedLinks.join(' ');
  }

  return line;
}

/**
 * summary フィールドのMarkdownを修正する
 */
function fixSummary(summary) {
  return summary
    .split('\n')
    .map(fixLine)
    .join('\n');
}

// 対象ファイル
const targets = ['2026-02-23.json', '2026-02-24.json', '2026-02-25.json', '2026-02-26.json'];

for (const filename of targets) {
  const filepath = path.join(DATA_DIR, filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

  const originalSummary = data.summary;
  const fixedSummary = fixSummary(originalSummary);

  if (originalSummary === fixedSummary) {
    console.log(`[skip] ${filename} - 変更なし`);
    continue;
  }

  data.summary = fixedSummary;
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`[fixed] ${filename}`);

  // 変更箇所を表示
  const origLines = originalSummary.split('\n');
  const fixedLines = fixedSummary.split('\n');
  origLines.forEach((line, i) => {
    if (line !== fixedLines[i]) {
      console.log(`  before: ${line}`);
      console.log(`  after:  ${fixedLines[i]}`);
    }
  });
}
