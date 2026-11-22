import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** slug：优先取 frontmatter.slug，否则用文件 id（去掉扩展名，支持子目录） */
export function getSlug(post: Post): string {
  return post.data.slug ?? post.id.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
}

/** 2026/10/18（与参考站点一致的短格式） */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}/${m}/${d}`;
}

/** 2026 年 10 月 18 日 */
export function formatDateLong(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

/** ISO 日期（<time datetime>） */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** 中文阅读时长估算：中文字符 + 英文单词，按 400 字/分钟 */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return Math.max(1, Math.round((cjk + words * 1.6) / 400));
}

/**
 * 排序：严格按发布时间倒序（新的在前）
 * - 首页 / 文章页 / 分类页 / 相关阅读 统一使用
 * - 首页第一篇自动使用大图样式，不再由 featured / pinned 改变顺序
 */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 过滤草稿 + 排序 */
export function visiblePosts(posts: Post[]): Post[] {
  return sortPosts(posts.filter((p) => !p.data.draft));
}

/** 统计所有标签及文章数 */
export function collectTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

/** 按标签筛选 */
export function postsByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.data.tags.includes(tag));
}

/** 获取相关文章（共享标签数最多的 N 篇） */
export function relatedPosts(posts: Post[], current: Post, limit = 3): Post[] {
  const tags = new Set(current.data.tags);
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      post: p,
      score: p.data.tags.filter((t) => tags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

/** 标签 URL（中文标签保留可读性，空格换成连字符） */
export function tagUrl(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`;
}

/** 纯文本摘要（用于 SEO / RSS） */
export function excerpt(post: Post, max = 140): string {
  if (post.data.description) return post.data.description;
  const raw = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#>*_`\[\]()!-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return raw.length > max ? raw.slice(0, max) + '…' : raw;
}

/** 判断封面是 public 字符串路径还是 src 内导入的图片 */
export function isLocalImage(src: unknown): src is ImageMetadata {
  return typeof src === 'object' && src !== null && 'src' in (src as object);
}
