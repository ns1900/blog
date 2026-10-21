# 在线后台（Decap CMS）接入指南

> 说明：这一套是**可选**的。日常写作推荐用本地的 `/admin`（更简单、无依赖）。
> 只有当你希望**在手机或别人的电脑上**通过浏览器改文章时，才需要配置这一套。

---

## 它是什么

[Decap CMS](https://decapcms.org/)（前身 Netlify CMS）是一个纯静态的 Git 内容管理后台：
浏览器打开 `你的域名/admin-cms/`，登录后编辑文章，保存时它会把改动**提交到 GitHub 仓库**，
Vercel 检测到 push 后自动重新部署。整个过程不需要服务器、不需要数据库。

- 免费，且完全符合 Vercel Hobby 的使用条款
- 文章仍然是 Markdown 文件，存放在你的仓库里
- 唯一的成本：需要一个 OAuth 中转（Vercel 无服务端，这是官方标准做法）

---

## 准备工作

1. 项目已推送到 GitHub 仓库，例如 `ns1900/nanguazhen`
2. 已经在 Vercel 上部署并绑定 `ns1900.com`

---

## 步骤一：创建 GitHub OAuth App

打开 <https://github.com/settings/developers> → **New OAuth App**

| 字段 | 填写 |
| --- | --- |
| Application name | 南瓜镇 CMS |
| Homepage URL | `https://ns1900.com` |
| Authorization callback URL | `https://你的oauth中转地址/api/callback` |

记下 **Client ID**，并点 **Generate a new client secret** 记下 **Client Secret**。

---

## 步骤二：部署 OAuth 中转

最省事的做法是用现成的开源中转：

在 Vercel 上 **Add New → Project** → 导入
<https://github.com/vencax/netlify-cms-github-oauth-provider>（或任一同类项目），
部署时配置环境变量：

```
OAUTH_CLIENT_ID      = 上一步的 Client ID
OAUTH_CLIENT_SECRET  = 上一步的 Client Secret
GIT_HOSTNAME         = github.com
ORIGIN               = https://ns1900.com
OAUTH_PROVIDER       = github
```

部署完成后你会得到一个地址，例如 `https://nanguazhen-oauth.vercel.app`。
回到 GitHub OAuth App，把 callback URL 改成：

```
https://nanguazhen-oauth.vercel.app/api/callback
```

---

## 步骤三：配置本项目

1. 复制配置模板：

```bash
cp public/admin-cms/config.example.yml public/admin-cms/config.yml
```

2. 打开 `public/admin-cms/config.yml`，把三处改掉：

```yaml
backend:
  name: github
  repo: ns1900/nanguazhen          # ← 改成你的 用户名/仓库名
  branch: main
  base_url: https://nanguazhen-oauth.vercel.app   # ← 上一步的地址
  auth_endpoint: /auth

site_url: https://ns1900.com
display_url: https://ns1900.com
```

3. 构建上线后访问 `https://ns1900.com/admin-cms/`，用 GitHub 账号登录即可。

---

## 支持的字段

`config.yml` 里的字段和本项目 `src/content.config.ts` 完全对应：
标题、副标题、摘要、发布日期、修订日期、作者、标签、封面图、封面说明、
首页大图、置顶、草稿、正文（Markdown）。

图片会存到 `public/images/`，与本地后台一致。

---

## 常见问题

**登录后白屏 / 404**
检查 `base_url` 是否填了完整地址（带 `https://`，不带结尾斜杠），
以及 GitHub OAuth App 的 callback URL 是否和它一致。

**保存后网站没变**
Decap 提交的是 Git commit，Vercel 需要几十秒重新构建。去 Vercel 面板看 Deployments。

**不想用了**
直接删掉 `public/admin-cms/` 整个目录，重新部署即可，对博客没有任何影响。
