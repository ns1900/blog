import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkLazyImages from './scripts/remark-lazy-images.mjs';

import { SITE } from './src/consts';

/**
 * 南瓜镇 · 配置
 *
 * 注意：
 * 1. `site` 必须填写真实域名，否则 sitemap / RSS / OG 里的绝对链接会出错。
 * 2. 部署到 Vercel 时不需要 adapter，Astro 默认输出纯静态文件到 dist/。
 */
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkLazyImages],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
