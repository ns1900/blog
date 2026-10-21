import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 文章集合
 * 文件位置：src/content/posts/*.md 或 *.mdx
 * 文件名即 URL slug（可用 frontmatter 里的 slug 字段覆盖）
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: () =>
    z.object({
      title: z.string(),
      /** 副标题，显示在标题下方 */
      subtitle: z.string().optional(),
      /** 摘要：首页列表和 SEO description 使用 */
      description: z.string().default(''),
      /** 发布日期 */
      pubDate: z.coerce.date(),
      /** 最后更新日期 */
      updatedDate: z.coerce.date().optional(),
      /** 作者 / 署名 */
      author: z.string().default('NS'),
      /** 标签，用于筛选 */
      tags: z.array(z.string()).default([]),
      /** 封面图：public/images 下的绝对路径，如 "/images/cover.jpg" */
      cover: z.string().optional(),
      /** 封面图替代文本 */
      coverAlt: z.string().default(''),
      /** 是否草稿（不会出现在任何列表 / RSS / sitemap 中） */
      draft: z.boolean().default(false),
      /** 是否置顶 */
      pinned: z.boolean().default(false),
      /** 是否在列表中显示为「大卡片」（带大图） */
      featured: z.boolean().default(false),
      /** 覆盖 slug */
      slug: z.string().optional(),
      /** 阅读时长（分钟），留空自动按字数估算 */
      readingTime: z.number().optional(),
    }),
});

export const collections = { posts };
