# 在线后台（Web 端写文章）

> 已经配好了。日常操作看「怎么用」就够了，前面的原理可以不看。

---

## 怎么用

1. 浏览器打开 **https://你的域名/admin-cms/**（**结尾的斜杠要有**）
2. 登录，二选一：
   - **主按钮**：页面中间点 **Login with GitHub**（弹窗模式）
   - **备用入口**：页面**最底部**点小字「登录遇到问题？点这里用备用方式登录」（整页跳转模式，最稳）
3. 点 **Authorize** 授权（只需第一次）
4. 进入编辑器：左边是文章列表，点 **New 文章** 开始写
5. 写完点右上角 **Publish** → 文章提交到 GitHub → Vercel 自动重新构建
6. 等 30–60 秒，刷新网站，文章就上去了

手机也能用，界面是响应式的。

> ⚠️ 不要在地址栏直接访问 `/api/auth`——那样授权会在同一标签页完成，令牌传不回编辑器。**一定从 `/admin-cms/` 页面上的入口进。**

> 登录状态会保存在浏览器里，一般几周内不用重新登录。换浏览器或清缓存后要重新登一次。

---

## 当前配置（备查）

| 项目 | 值 |
|---|---|
| 后台地址 | `https://blog-eta-eosin-79.vercel.app/admin-cms/` |
| 内容仓库 | `ns1900/blog`（main 分支） |
| OAuth 入口 | `/api/auth`（加 `?direct=1` 为备用模式） |
| OAuth 回调 | `/api/callback` |
| GitHub OAuth App 名称 | 南瓜镇 CMS |
| GitHub 登记的 Redirect URI | `https://blog-eta-eosin-79.vercel.app/api/callback` |
| 配置文件 | `public/admin-cms/config.yml` |

### 踩过的坑（重要，别再踩）

**1. `/config.yml` 404**
访问地址不带结尾斜杠时（`/admin-cms`），Decap 会把相对路径解析到站点根目录去找 `config.yml`。
解决办法在 `vercel.json` 里加了一条 rewrite：

```json
"rewrites": [
  { "source": "/config.yml", "destination": "/admin-cms/config.yml" }
]
```

**2. 登录界面被占位说明遮挡**
`public/admin-cms/index.html` 里有个「正在加载编辑器…」的说明块。加了一段轮询脚本，检测到 Decap 的 `#nc-root` 渲染出内容后自动隐藏它。

**3. 第三方 OAuth 中转不可用**
早期方案部署 `vencax/netlify-cms-github-oauth-provider` 到 Vercel，会报 `500 FUNCTION_INVOCATION_FAILED`（老旧 Express 项目不兼容新运行时）。已改为主站自带的 `api/auth.js` + `api/callback.js`。

**4. 弹窗授权后主页无任何反应**
弹窗走完流程自动关闭，但令牌通过 `postMessage` 传给主页面时被静默丢弃（targetOrigin 不匹配不报错）。
解决：增加**备用登录通道**——`/api/auth?direct=1` 整页跳转，callback 拿到令牌后直接写进 `localStorage['decap-cms-user']`（格式 `{token, backendName: 'github'}`）再跳回编辑器，完全绕开弹窗与消息通信。

**5. GitHub 报 `Invalid Redirect URI`**
GitHub 对 `redirect_uri` 是**整串精确匹配**，多一个 `?direct=1` 都不认。
解决：自定义标记不能塞进 redirect_uri，改用 `state` 参数传递（`state=direct:xxx`），GitHub 会原样带回。

> 主站域名变了（比如换上 ns1900.com）之后，要同步改三处：
> 1. GitHub OAuth App 的 Redirect URI
> 2. Vercel 项目环境变量里的 `ORIGIN`
> 3. `config.yml` 的 `base_url`

---

## 需要配置的环境变量

在**主站项目**的 Vercel → Settings → Environments → Production → Environment Variables 里：

| Key | 说明 |
|---|---|
| `OAUTH_CLIENT_ID` | GitHub OAuth App 的 Client ID |
| `OAUTH_CLIENT_SECRET` | GitHub OAuth App 的 Client Secret |
| `ORIGIN` | 主站完整地址，如 `https://ns1900.com`，**不带结尾斜杠** |

改完变量必须 **Redeploy** 才生效。

---

## 它是怎么工作的

```
浏览器 /admin-cms/
      ↓ 点「Login with GitHub」
跳转 /api/auth          ← api/auth.js：重定向到 GitHub 授权页
      ↓ 用户点 Authorize
GitHub 回调 /api/callback ← api/callback.js：用 code 换 token，postMessage 回主窗口
      ↓
Decap CMS 拿到 token，开始读写仓库
```

两个接口都是项目里的普通文件，不需要额外服务器，也不需要第三方中转服务。

| 文件 | 作用 |
|---|---|
| `api/auth.js` | 跳转到 GitHub 授权页 |
| `api/callback.js` | 换 access token 并交给编辑器 |
| `public/admin-cms/index.html` | Decap CMS 页面 |
| `public/admin-cms/config.yml` | 后台配置（仓库、字段、分类） |

---

## 分类规则

后台里「分类」是**下拉多选**，只有两个选项：**影评**、**游戏**。
这是故意锁死的，防止手打错别字导致多出奇怪分类页。要加新分类，改 `public/admin-cms/config.yml` 里的 `options` 列表。

---

## 本地写作（另一种方式）

双击项目里的 `start.bat`，浏览器自动打开 `http://localhost:4321/admin`。
这个后台直接读写你电脑上的文件，保存后在本地立即生效，适合大改和调样式。
发布仍然用 `publish.bat`。

---

## 常见问题

**登录后一直转圈 / 白屏**
打开浏览器开发者工具（F12）看 Console 报错，最常见是 `redirect_uri_mismatch`——去 GitHub OAuth App 核对 Redirect URI 是否和 `ORIGIN` 完全一致（协议、域名、`/api/callback` 路径、结尾无斜杠）。

**点了 Authorize 回到站点却还提示登录**
检查 Vercel 的环境变量里 `ORIGIN` 是否和实际访问的域名完全一致。用 `xxx.vercel.app` 访问时，`ORIGIN` 也必须写这个地址。

**页面卡在「正在加载编辑器…」**
多半是国内访问 `unpkg.com` 慢。换手机热点试试；若要长期稳定，可把 `public/admin-cms/index.html` 里的 CDN 换成国内镜像。

**Publish 之后网站没变**
Decap 提交的是 Git commit，Vercel 需要重新构建。去 Vercel 的 Deployments 看进度，绿色 Ready 后刷新页面（Ctrl+F5）。

**历史问题：第三方中转为什么弃用**
早期方案用 `vencax/netlify-cms-github-oauth-provider` 独立部署在 Vercel，但该模板是旧版 Express 项目，在新运行时上会报 `500 FUNCTION_INVOCATION_FAILED`。现已改为主站内置函数，该项目可以删除。
