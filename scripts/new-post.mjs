#!/usr/bin/env node
/**
 * 命令行新建文章
 *   npm run new -- "文章标题"
 *   npm run new -- "文章标题" --tag 设计 --tag 观察
 *
 * 会在 src/content/posts/ 下生成 YYYY-MM-DD-slug.md 并填充 frontmatter 骨架。
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith('--')) ?? '未命名文章';

const tags = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tag' && args[i + 1]) tags.push(args[i + 1]);
}

const now = new Date();
const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
  now.getDate()
).padStart(2, '0')}`;

/** 中文标题转拼音太复杂，这里优先保留英文/数字，纯中文则用日期 */
function toSlug(t) {
  const ascii = t
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || 'post';
}

const slug = toSlug(title);
const filename = `${ymd}-${slug}.md`;
const filepath = path.join(process.cwd(), 'src', 'content', 'posts', filename);

if (fs.existsSync(filepath)) {
  console.error(`✗ 文件已存在：${filename}`);
  process.exit(1);
}

const tagLines = tags.length ? `tags:\n${tags.map((t) => `  - ${t}`).join('\n')}` : 'tags: []';

const content = `---
title: ${title}
description: ""
pubDate: ${ymd}
author: NS
${tagLines}
draft: true
---

在这里开始写正文。

## 小标题

正文段落。
`;

fs.mkdirSync(path.dirname(filepath), { recursive: true });
fs.writeFileSync(filepath, content, 'utf8');

console.log(`✓ 已创建 src/content/posts/${filename}`);
console.log(`  （默认 draft: true，写好之后改成 false 或删掉该行即可发布）`);
console.log(`  预览：http://localhost:4321/articles/${ymd}-${slug}`);
