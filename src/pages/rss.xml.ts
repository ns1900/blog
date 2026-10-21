import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/content';
import { getSlug, excerpt } from '../lib/utils';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: excerpt(post, 300),
      pubDate: post.data.pubDate,
      link: `/articles/${getSlug(post)}`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
