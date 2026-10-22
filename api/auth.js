// OAuth 登录入口：跳转到 GitHub 授权页
// direct 标记通过 state 参数传递（GitHub 会原样带回，不参与 URI 校验）
//   /api/auth         → 弹窗模式
//   /api/auth?direct=1 → 直接登录模式（callback 写 localStorage 后跳回编辑器）
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

  // redirect_uri 必须与 GitHub 应用里登记的完全一致（不能带额外 query）
  const redirectUri = `${origin}/api/callback`;
  const random = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const state = req.query.direct === '1' ? `direct:${random}` : random;

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
