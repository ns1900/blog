import type { GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { visiblePosts, getSlug } from './utils';

/** 生成所有可见文章页的路径参数 */
export const getStaticPathsForPosts: GetStaticPaths = async () => {
  const posts = visiblePosts(await getCollection('posts'));
  return posts.map((entry) => ({
    params: { slug: getSlug(entry) },
    props: { entry },
  }));
};
