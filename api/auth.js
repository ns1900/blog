// OAuth 登录入口：跳转到 GitHub 授权页
//   /api/auth          → 弹窗模式
//   /api/auth?direct=1 → 直接登录模式（callback 写 localStorage 后跳回编辑器）
//
// state 用 OAUTH_CLIENT_SECRET 做 HMAC 签名，格式：<nonce>.<标志>.<签名>
// callback 端用同样算法验签，防止伪造回调（CSRF）。
//
// 环境变量：OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, ORIGIN
import crypto from 'node:crypto';

function signState(nonce, direct, secret) {
  const payload = `${nonce}.${direct ? 'd' : 'n'}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export default async function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const origin = process.env.ORIGIN;

  if (!clientId || !clientSecret || !origin) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Missing OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / ORIGIN environment variable.');
    return;
  }

  // redirect_uri 必须与 GitHub 应用里登记的完全一致（不能带额外 query）
  const redirectUri = `${origin}/api/callback`;
  const nonce = crypto.randomBytes(16).toString('hex');
  const state = signState(nonce, req.query.direct === '1', clientSecret);

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
