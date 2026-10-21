import { SITE } from '../consts';

export const prerender = true;

/** 生成 robots.txt（部署后由 Vercel 静态提供） */
export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${SITE.url}/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
