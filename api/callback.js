// OAuth 回调：用临时 code 换取 access token，并回传给 Decap CMS 弹窗
// 用法：由 GitHub 授权后自动跳转到 https://你的域名/api/callback?code=...&state=...
// 环境变量：OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, ORIGIN
export default async function handler(req, res) {
  const origin = process.env.ORIGIN;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  const sendError = (msg) => {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<h3>登录失败：${msg}</h3><p>请关闭窗口重试。</p>`);
  };

  if (!clientId || !clientSecret || !origin) {
    sendError('服务器缺少 OAuth 环境变量（OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET / ORIGIN）');
    return;
  }

  const code = req.query.code;
  if (!code) {
    sendError('缺少 code 参数');
    return;
  }

  try {
    // 用 code 换 token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const data = await tokenRes.json();

    if (!data.access_token) {
      sendError(data.error_description || data.error || '未获取到 access_token');
      return;
    }

    // 把 token postMessage 给 Decap CMS（它会自己关闭弹窗）
    // 注意：targetOrigin 用 '*'，因为 ORIGIN 环境变量若与页面地址有
    // 任何细微差别（尾斜杠等），精确匹配会导致消息被静默丢弃。
    // 接收方 window.opener 只可能是本站的 CMS 页面，风险可控。
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(
      `<!doctype html><html><head><meta charset="utf-8"><style>
        body{background:#f4ede9;color:#241a16;font-family:'Noto Sans SC','Microsoft YaHei',sans-serif;
             display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:.95rem}
      </style></head><body><script>
        (function () {
          var token = ${JSON.stringify(data.access_token)};
          try {
            if (window.opener) {
              window.opener.postMessage(
                { token: token, provider: 'github' },
                '*'
              );
              document.body.textContent = '登录成功，正在返回编辑器…';
              setTimeout(function () { window.close(); }, 800);
              return;
            }
          } catch (e) {}
          var target = ${JSON.stringify(origin)};
          document.body.textContent = '授权已收到，但本次不是从后台窗口发起的，需要重新登录。正在跳回后台…';
          setTimeout(function () { location.replace(target + '/admin-cms/'); }, 2000);
        })();
      </script></body></html>`
    );
  } catch (err) {
    sendError('换取 token 时出错：' + (err && err.message));
  }
}
