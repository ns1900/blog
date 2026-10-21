import { getCollection } from 'astro:content';
import { visiblePosts, collectTags, type Post } from './utils';

/** 所有可见文章（已过滤草稿、已排序） */
export async function getPosts(): Promise<Post[]> {
  return visiblePosts(await getCollection('posts'));
}

/** 所有可见标签 */
export async function getTags() {
  return collectTags(await getPosts());
}

/** 从 Markdown 正文提取 h2/h3 生成目录 */
export function buildToc(body: string | undefined) {
  if (!body) return [];
  const items: { depth: number; text: string; slug: string }[] = [];
  const seen = new Map<string, number>();
  const re = /^(#{2,3})\s+(.+?)\s*#*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const depth = m[1].length;
    const text = m[2].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');
    const slug = slugifyHeading(text, seen);
    items.push({ depth, text, slug });
  }
  return items;
}

/** 与 Astro 默认的 github-slugger 行为近似的简化版 */
function slugifyHeading(text: string, seen: Map<string, number>): string {
  let base = text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '');
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}
