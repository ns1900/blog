// OAuth 登录入口：跳转到 GitHub 授权页
// 用法：/api/auth         → 弹窗模式（Decap 默认流程）
//       /api/auth?direct=1 → 直接登录模式（callback 写 localStorage 后跳回编辑器）
// 环境变量：OAUTH_CLIENT_ID, ORIGIN
export default async function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const origin = process.env.ORIGIN;

  if (!clientId || !origin) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing OAUTH_CLIENT_ID or ORIGIN environment variable.');
    return;
  }

  const direct = req.query.direct === '1' ? '1' : '';
  const redirectUri = `${origin}/api/callback${direct ? '?direct=1' : ''}`;

  const authUrl =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&scope=repo';

  res.statusCode = 302;
  res.setHeader('Location', authUrl);
  res.end();
}
