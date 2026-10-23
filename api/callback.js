// OAuth 回调：用临时 code 换取 access token
// 两种工作模式：
//   A) 弹窗模式（Decap 默认）——把 token postMessage 给 opener
//   B) 直接登录模式——把 token 写进 localStorage 的 decap-cms-user 后跳回编辑器
//
// 安全：state 由 api/auth.js 用 HMAC-SHA256 签名，此处验签，
//       拒绝伪造/篡改的回调请求（CSRF 防护）。
//
// 环境变量：OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, ORIGIN
//
// 关于 ORIGIN：回跳地址优先用 ORIGIN，但它只认一个值。
// 为了在「xxx.vercel.app」和「ns1900.com」之间都能登录，这里按白名单
// 校验浏览器带来的 origin/bd 参数，白名单内才采纳，否则退回 ORIGIN。
import crypto from 'node:crypto';

const ALLOWED_HOSTS = ['ns1900.com', 'www.ns1900.com'];

function pickOrigin(req, envOrigin) {
  const candidates = [];
  const q = req.query || {};
  const h = req.headers || {};
  for (const raw of [q.bd, req.body && req.body.bd, h.origin]) {
    if (typeof raw !== 'string' || !raw) continue;
    try {
      const u = new URL(raw);
      if (ALLOWED_HOSTS.includes(u.host)) candidates.push(`${u.protocol}//${u.host}`);
    } catch (e) {}
  }
  if (envOrigin) candidates.push(envOrigin.replace(/\/+$/, ''));
  return candidates[0] || '';
}

function signState(nonce, direct, secret) {
  const payload = `${nonce}.${direct ? 'd' : 'n'}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyState(state, secret) {
  if (typeof state !== 'string') return null;
  const parts = state.split('.');
  if (parts.length !== 3) return null;
  const [nonce, flag, sig] = parts;
  if (flag !== 'd' && flag !== 'n') return null;
  const expected = signState(nonce, flag === 'd', secret).split('.')[2];
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return { direct: flag === 'd' };
}

export default async function handler(req, res) {
  const origin = pickOrigin(req, process.env.ORIGIN);
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  const page = (body) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      `<!doctype html><html><head><meta charset="utf-8"><style>
        body{background:#f4ede9;color:#241a16;font-family:'Noto Sans SC','Microsoft YaHei',sans-serif;
             display:flex;align-items:center;justify-content:center;height:100vh;margin:0;
             font-size:.95rem;text-align:center;padding:2rem;box-sizing:border-box}
      </style></head><body><div>${body}</div></body></html>`
    );
  };

  if (!clientId || !clientSecret || !origin) {
    page('登录失败：服务器缺少 OAuth 环境变量（OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / ORIGIN）');
    return;
  }

  const code = req.query.code;
  if (!code) {
    page('登录失败：缺少 code 参数。请从后台页面重新点「登录」按钮。');
    return;
  }

  // 验签 state：拒绝伪造回调
  const verified = verifyState(req.query.state, clientSecret);
  if (!verified) {
    page(
      '登录失败：state 校验未通过（可能是伪造的回调，或 OAuth 密钥已变更）。<br>' +
        `请回到 <a href="${origin}/admin-cms/">后台</a> 重新登录。`
    );
    return;
  }
  const direct = verified.direct;

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();

    if (!data.access_token) {
      page('登录失败：' + (data.error_description || data.error || '未获取到 access_token'));
      return;
    }

    const tokenJson = JSON.stringify(data.access_token);
    const cmsUrl = `${origin}/admin-cms/`;
    const cmsUrlJson = JSON.stringify(cmsUrl);

    if (direct) {
      // 模式 B：写 localStorage 后跳回编辑器
      page(
        `<p>登录成功，正在进入编辑器…</p><script>
          (function () {
            try {
              localStorage.setItem(
                'decap-cms-user',
                JSON.stringify({ token: ${tokenJson}, backendName: 'github' })
              );
            } catch (e) {}
            setTimeout(function () { location.replace(${cmsUrlJson}); }, 400);
          })();
        </script>`
      );
      return;
    }

    // 模式 A：弹窗 postMessage
    page(
      `<script>
        (function () {
          var token = ${tokenJson};
          try {
            if (window.opener) {
              window.opener.postMessage({ token: token, provider: 'github' }, '*');
              document.body.textContent = '登录成功，正在返回编辑器…';
              setTimeout(function () { window.close(); }, 600);
              return;
            }
          } catch (e) {}
          // 没有 opener（用户直接在本窗口完成授权）→ 直接写 localStorage 兜底
          try {
            localStorage.setItem(
              'decap-cms-user',
              JSON.stringify({ token: token, backendName: 'github' })
            );
            document.body.textContent = '授权成功，正在进入编辑器…';
            setTimeout(function () { location.replace(${cmsUrlJson}); }, 400);
            return;
          } catch (e) {}
          document.body.innerHTML = '授权已收到，但本次不是从后台窗口发起的。'
            + '<br><a href="${cmsUrl}">点这里进入后台</a>';
        })();
      </script>`
    );
  } catch (err) {
    page('登录失败：换取 token 时出错 — ' + (err && err.message));
  }
}
