// OAuth 登录入口：跳转到 GitHub 授权页
// 用法：https://你的域名/api/auth
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

  const redirectUri = `${origin}/api/callback`;
  const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  const authUrl =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&scope=repo' +
    `&state=${encodeURIComponent(state)}`;

  res.statusCode = 302;
  res.setHeader('Location', authUrl);
  res.end();
}
