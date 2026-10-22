// OAuth 回调：用临时 code 换取 access token
// 两种工作模式：
//   A) 弹窗模式（Decap 默认）——把 token postMessage 给 opener
//   B) 直接登录模式（?direct=1）——把 token 写进 localStorage 的
//      decap-cms-user 后跳回编辑器，绕开所有弹窗/消息通信问题
// 环境变量：OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, ORIGIN
export default async function handler(req, res) {
  const origin = process.env.ORIGIN;
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

  // direct 标记通过 state 传递（GitHub 原样带回）
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const direct = state.startsWith('direct:');

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
    const originJson = JSON.stringify(origin);
    const cmsUrl = `${origin}/admin-cms/`;

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
            setTimeout(function () { location.replace(${JSON.stringify(cmsUrl)}); }, 400);
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
          document.body.innerHTML = '授权已收到，但本次不是从后台窗口发起的。'
            + '<br><a href="${cmsUrl}?direct=1">点这里用直接登录方式进入</a>';
        })();
      </script>`
    );
  } catch (err) {
    page('登录失败：换取 token 时出错 — ' + (err && err.message));
  }
}
