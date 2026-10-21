# 南瓜镇 · 个人图文博客

基于 **Astro 5 + Tailwind CSS 4** 的静态博客，排版参照 thedissidents.net：
宋体衬线、一行一篇的列表、克制的字体层级、暖色纸感背景（`#f4ede9`）。

- 纯静态输出，**完全适配 Vercel Hobby 免费版**（无服务端函数、无数据库）
- 内容用本地 Markdown 存储，自带两套后台（见下）
- 响应式图片：构建时转 WebP + 多尺寸 `srcset` + `loading="lazy"`
- 支持标签筛选、分页、RSS、sitemap、OG/JSON-LD

---

## 一、本地开发

```bash
npm install
npm run dev          # http://localhost:4321
```

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地开发（含后台） |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 预览构建结果 |
| `npm run new` | 命令行新建一篇文章 |

## 二、写文章

文章放在 `src/content/posts/`，文件名就是 URL：

```
src/content/posts/2026-10-21-wo-de-wenzhang.md  →  /articles/2026-10-21-wo-de-wenzhang
```

Frontmatter 字段（除 `title` / `pubDate` 外都可省略）：

```yaml
---
title: 标题
subtitle: 副标题
description: 摘要，显示在列表和搜索结果里
pubDate: 2026-10-21
updatedDate: 2026-10-25     # 可选，会在文章页显示"修订于"
author: NS
tags: [设计, 空间]
cover: /images/cover.jpg    # 封面（public/images 下）
coverAlt: 封面图说明
featured: true             # 首页第一条用大图排版
pinned: false              # 置顶
draft: false               # 草稿：不出现在任何页面
---
```

正文支持 Markdown 全语法 + MDX（`.mdx` 文件可用组件）。
插入图片：`![图注](/images/xxx.jpg)`，会自动懒加载并自适应宽度。

## 三、两套后台

### 方案 A：本地后台（推荐日常使用）

```bash
npm run dev
# 浏览器打开 http://localhost:4321/admin
```

功能：文章列表 / 搜索、新建、编辑（带 Markdown 实时预览）、删除、
封面与正文图片上传（支持拖拽和粘贴）、标签联想、字数与阅读时长统计、
`Ctrl/Cmd + S` 保存。

- 保存后直接写回 `src/content/posts/*.md`，图片存入 `public/images/`
- **只在本机 `npm run dev` 时生效**，线上返回提示页（不存在被公网任意写文件的风险）
- 定时备份：整个项目目录就是你的内容，建议用 Git 管理

工作流：本地写 → `git add . && git commit -m "new post" && git push` → Vercel 自动部署（约 1 分钟）。

### 方案 B：在线后台（Decap CMS，可选）

如果希望**在手机上写**，可以在浏览器里打开 `https://ns1900.com/admin/` 登录编辑。
它需要一个 GitHub OAuth 中转（Vercel 免费版没有常驻服务端，这是官方推荐做法）。
配置与接入步骤见 [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md)。

## 四、部署到 Vercel + 绑定 ns1900.com

> **完整小白版操作步骤见 [`docs/DEPLOY.md`](docs/DEPLOY.md)**（含截图级说明、DNS 配置、常见报错处理）

流程概览：

1. 把项目推到 GitHub（公开仓库最简单）
2. Vercel → **Add New → Project** → 选择该仓库 → Framework 自动识别为 Astro
3. **不需要改任何构建配置**（`vercel.json` 已经写好），直接 Deploy
4. **Settings → Domains → Add** 输入 `ns1900.com` 和 `www.ns1900.com`
5. 在域名注册商处按提示配置 DNS：
   - `A` 记录 `@` → `76.76.21.21`
   - `CNAME` 记录 `www` → `cname.vercel-dns.com`
6. 生效后 Vercel 自动签发 HTTPS 证书（无需备案）

**日常更新**：双击项目根目录的 `publish.bat`，一键 add/commit/push，Vercel 自动重新构建。

> 记得把 `src/consts.ts` 里的 `url` 改成最终域名（默认已填 `https://ns1900.com`）。

## 五、目录结构

```
├── public/
│   ├── images/            # 所有图片（封面、正文图）
│   ├── fonts/             # 本地字体（可选，未放置时自动回退系统字体）
│   ├── favicon.svg
│   └── og-default.jpg     # 默认分享图 1200×630
├── src/
│   ├── components/
│   │   ├── PostRow.astro       # 一行一篇的列表项
│   │   ├── Pagination.astro    # 分页
│   │   └── ResponsiveImage.astro
│   ├── content/posts/     # ← 所有文章（Markdown）
│   ├── content.config.ts  # 文章 schema（字段校验）
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── utils.ts       # 日期、阅读时长、标签、相关文章
│   │   ├── content.ts     # 取文章、目录
│   │   └── admin/store.ts # 后台文件读写
│   ├── pages/
│   │   ├── index.astro                 # 首页
│   │   ├── articles/index.astro        # 文章列表
│   │   ├── articles/[...slug].astro    # 文章详情
│   │   ├── articles/page/[page].astro  # 分页
│   │   ├── tags/index.astro            # 标签云
│   │   ├── tags/[tag].astro            # 标签筛选
│   │   ├── about.astro
│   │   ├── admin.astro                 # 本地后台
│   │   ├── rss.xml.ts
│   │   ├── robots.txt.ts
│   │   └── api/admin/                  # 后台接口（仅 dev）
│   ├── styles/global.css  # 设计变量 + 正文排版
│   └── consts.ts          # 站点名、导航、简介 ← 先改这里
├── scripts/
│   ├── new-post.mjs       # 命令行新建文章
│   └── remark-lazy-images.mjs
├── astro.config.mjs
└── vercel.json
```

## 六、定制

| 想改什么 | 去哪 |
| --- | --- |
| 站点名 / 副标题 / 域名 | `src/consts.ts` |
| 导航菜单 | `src/consts.ts` → `NAV` |
| 首页简介文字 | `src/consts.ts` → `INTRO` |
| 背景色、文字色、强调色 | `src/styles/global.css` → `@theme` |
| 正文字号 / 行高 / 段间距 | `src/styles/global.css` → `.prose` |
| 每页文章数 | `src/consts.ts` → `postsPerPage` |
| 关于页内容 | `src/pages/about.astro` |
| 页脚 | `src/layouts/BaseLayout.astro` |

配色（`@theme` 中集中定义）：

```
--color-paper: #f4ede9   /* 背景 */
--color-ink:   #241a16   /* 正文 */
--color-ink-soft: #5a4a42
--color-rule:  #d8c9c0   /* 分隔线 */
--color-accent:#a8471f   /* 强调（暖棕红） */
```

## 七、性能

- 构建时把样式内联进 HTML（`inlineStylesheets: 'auto'`），首屏无额外 CSS 请求
- 图片走 Astro 的 `<Image>`：自动转 WebP、生成 400/640/800/1200/1600 五档 `srcset`
- 列表图延迟加载，文章封面用 `eager` 优先加载（LCP 优化）
- 代码高亮用 Shiki 在构建时完成，运行时零 JS
- 无框架 JS，页面交互全部是 CSS；全站 JS 体积 < 10KB
- 字体可选：把 `NotoSerifSC-Variable.woff2` 放进 `public/fonts/` 即启用本地字体，
  不放则回退到系统宋体（Windows 微软雅黑/宋体、macOS Songti SC），**都不发外部请求**

## 八、常见问题

**构建报错 `Unknown image format` / sharp**
执行 `npm rebuild sharp`，或删除 `node_modules` 重装。

**中文 URL 标签页打不开**
标签用 `encodeURIComponent` 编码，已被 Vercel 正确处理；本地 `preview` 也正常。

**想加评论**
推荐 [Giscus](https://giscus.app)（基于 GitHub Discussions，免费无服务端），
把生成的 `<script>` 贴进 `src/pages/articles/[...slug].astro` 的文末即可。
