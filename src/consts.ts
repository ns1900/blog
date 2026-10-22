export const SITE = {
  /** 站点名称 */
  title: '南瓜镇',
  /** 副标题 / Slogan —— 也用于浏览器标签页标题「南瓜镇·聂帅的个人博客」 */
  subtitle: '聂帅的个人博客',
  /** 正式域名，部署后用自定义域名替换亦可 */
  url: 'https://www.ns1900.com',
  /** 默认描述（SEO） */
  description:
    '南瓜镇 · 个人图文博客。记录城市漫游、影像与阅读、设计工作和一些不成熟的想法。',
  /** 作者 */
  author: 'NS',
  /** 语言 */
  lang: 'zh-CN',
  /** 每页文章数 */
  postsPerPage: 10,
  /** 页脚版权起始年份 */
  since: 2026,
} as const;

export const NAV = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles' },
  { label: '关于我', href: '/about' },
] as const;

/** 首页顶部的大标题区文案 */
export const INTRO = {
  heading: '南瓜镇',
  lines: [
    '白天做软装设计，晚上写字、看片、读财报。',
    '这里存放那些不适合发在朋友圈的东西——',
    '长得可以慢慢读，短的只有一句话。',
  ],
} as const;
