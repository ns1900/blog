# 部署上手指南：GitHub + Vercel + 域名 ns1900.com

> 这份文档是给「完全没做过部署」的人看的。照着做，一步一个勾。
> 全程**不需要花钱**（域名除外，域名是每年买的）。

---

## 先理解三件事（30 秒）

用一句话解释你接下来要做的事：

1. **GitHub** = 存放代码的地方（网盘 + 版本历史）。你以后改文章，改完推到 GitHub。
2. **Vercel** = 网站制造机。它盯着 GitHub，你一推代码，它自动把文章「编译」成网页，放到互联网上。
3. **域名 ns1900.com** = 你家的门牌号。别人输这个地址，就被指到 Vercel 上的网站。

所以流程是：**代码 → GitHub → Vercel 自动构建 → 域名指向 Vercel → 别人能访问**。

---

## 第 1 步：注册 GitHub 账号

- 打开 https://github.com/signup
- 邮箱、密码、用户名（用户名会出现在仓库地址里，**建议用英文小写**，比如 `nieshuai`）
- 验证邮箱

> 如果已有账号，直接跳到第 2 步。

---

## 第 2 步：在 GitHub 上建一个空仓库

1. 登录后点右上角 `+` → **New repository**
2. 填写：
   - **Repository name**：`nanguazhen`（或 `blog`，随意，英文小写）
   - **Description**：南瓜镇个人博客
   - **Visibility**：选 **Public**（Vercel 免费版读私有仓库需要授权，Public 最省事；代码是博客内容，公开无妨）
   - ⚠️ **下面的 Add a README / .gitignore / license 三项全部不要勾**
3. 点 **Create repository**
4. 建好后页面会显示一堆命令，**你不需要手动敲**，往下看第 3 步。

---

## 第 3 步：把本地代码推上去（我帮你执行，你只需要给我仓库地址）

仓库建好后，页面上会有一行地址，长这样：

```
https://github.com/你的用户名/nanguazhen.git
```

**把这行地址发给我**，我来在本地执行：

```bash
git remote add origin <你的地址>
git push -u origin main
```

### 如果你想自己动手（可选）

第一次 push 会弹窗要求登录。**推荐用 Personal Access Token 当密码**：

1. GitHub 右上角头像 → **Settings** → 左下 **Developer settings**
2. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
3. Note 填 `vercel-deploy`，Expiration 选 90 days
4. 勾选 **repo** 这一整项
5. 生成后**立刻复制那串 `ghp_xxxxx`**（只显示一次！）
6. 回到命令行 push 时，用户名填 GitHub 用户名，**密码粘贴这串 token**

> 也可以在 GitHub 网页上直接拖文件上传（Add file → Upload files），但 51 个文件手动拖很麻烦，还是命令行靠谱。

---

## 第 4 步：注册 Vercel 并导入项目

1. 打开 https://vercel.com/signup
2. **选「Continue with GitHub」**（重要！这样 Vercel 才能读你的仓库）
3. 授权 Vercel 访问 GitHub（可以只授权单个仓库）
4. 登录后点 **Add New… → Project**
5. 找到 `nanguazhen` 仓库，点 **Import**

### 构建配置（Vercel 会自动识别，确认一下即可）

| 项目 | 值 |
|---|---|
| Framework Preset | **Astro**（自动识别） |
| Root Directory | `./` |
| Build Command | `npm run build`（自动，来自 vercel.json） |
| Output Directory | `dist`（自动） |
| Install Command | `npm install`（默认） |
| Environment Variables | **不需要填任何东西** |

6. 点 **Deploy**，等 1–2 分钟。
7. 成功后你会得到一个临时地址，形如 `nanguazhen-xxxx.vercel.app`，**先点开看看，确认网站正常**。

> 如果构建失败，把报错画面截图发我，我来修。

---

## 第 5 步：在 Vercel 上绑定域名 ns1900.com

1. 进入你的项目 → 顶部 **Settings** → 左侧 **Domains**
2. 输入 `ns1900.com`，点 **Add**
3. Vercel 会问你要不要同时加 `www.ns1900.com`，**两个都加**（一个主用，一个自动跳转）
4. 这时 Vercel 会显示「需要配置 DNS」，**把下面这两条记录抄下来**（你的值和我的可能略有不同，以页面显示为准）：

| 类型 | 名称 | 值 |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

> ⚠️ 请以 Vercel 页面上**实际显示的数字**为准，它们偶尔会变。

---

## 第 6 步：去域名商改 DNS

登录你**买域名的那个网站**（阿里云 / 腾讯云 / Cloudflare / Namecheap / GoDaddy...），找到 `ns1900.com` 的 **DNS 解析 / DNS 记录**页面。

### 要做的事

1. **先删掉旧的**：如果已经有 `A` 记录指向别的地方（或者 `CNAME` 指向 parking 页面），删掉
2. **添加两条记录**：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | 600（或默认） |
| CNAME | `www` | `cname.vercel-dns.com` | 600（或默认） |

> 如果域名商不允许 `@` 用 A 记录，可以用 `ALIAS`/`ANAME` 指向 `cname.vercel-dns.com`。

3. 保存

### 关于备案

**域名解析到 Vercel（海外服务器）不需要 ICP 备案。**
只有当你把域名指向**中国大陆境内**的服务器时才必须备案。

---

## 第 7 步：等 DNS 生效 + 开 HTTPS

- DNS 生效通常 **10 分钟到 2 小时**（偶尔要 24 小时）
- 回到 Vercel → Settings → Domains，看着状态从 `Invalid Configuration` 变成 **`Valid Configuration`**
- 如果卡住，点旁边的 **Refresh** 按钮
- 生效后 Vercel 会**自动签发免费 HTTPS 证书**（Let's Encrypt），一般几分钟内完成
- 证书好了之后，`https://ns1900.com` 就能正常打开了

### 怎么验证 DNS 生效了

打开 https://dnschecker.org ，输入 `ns1900.com`，选 `A` 记录，看全球节点是不是都显示 `76.76.21.21`。

---

## 第 8 步：设置主域名（避免两个地址重复）

Vercel → Settings → Domains 里，选一个作为 **Primary**：

- 建议把 `ns1900.com`（不带 www）设为主
- 另一个会自动 301 跳转到主域名

这样搜索引擎不会认为你有两个网站，SEO 更干净。

---

## 以后怎么更新文章

### 方式 A：用后台改（推荐，适合你）

1. 双击项目里的 `start.bat`（本地开发环境启动）
2. 浏览器打开 `http://localhost:4321/admin`
3. 点「打开项目文件夹」，选 `C:\Users\NIESHUAI\WorkBuddy\建站`
4. 写文章、上传封面图、保存
5. 在项目文件夹里打开命令行，执行：

```bash
git add -A
git commit -m "新增文章：xxx"
git push
```

6. 等 30–60 秒，Vercel 自动重新构建，线上就更新了

> 每次 `git push` 之后可以到 Vercel 的 **Deployments** 页面看进度，绿勾就是成功。

### 方式 B：只改 markdown 文件

文章都是 `src/content/posts/` 下的 `.md` 文件，用记事本或 VS Code 直接改也行，改完同样 `git push`。

---

## 常见问题

**Q：Vercel 构建报错 `Command "npm run build" exited with 1`？**
把完整报错贴给我。最常见原因是某篇文章的 frontmatter 格式不对（比如日期写成 `2026年10月`）。

**Q：国内打开慢怎么办？**
这是海外托管的通病（Vercel 无大陆节点）。想国内秒开只能：买国内服务器/OSS + 完成 ICP 备案 + 备案域名解析到国内。这个我可以后续帮你做，但需要你先去备案。

**Q：Vercel 免费额度够吗？**
Hobby 计划：100GB/月 流量、100GB/月 带宽。你的站 3.6MB，每月可被访问约 2.7 万次，个人博客完全够。

**Q：能不能用 GitHub 自带的 Pages 而不是 Vercel？**
能，但需要多配一个 Actions workflow，而且国内更慢。既然选了 Vercel 就专心用 Vercel。

**Q：域名到期了会怎样？**
网站立刻打不开。记得每年续费（一般 70–90 元/年）。

---

## 检查清单

- [ ] GitHub 账号已注册并验证邮箱
- [ ] GitHub 上建好空仓库（Public，不勾 README）
- [ ] 本地代码已 push 到 GitHub（我帮你做）
- [ ] Vercel 用 GitHub 登录并 Import 该仓库
- [ ] 首次部署成功，`.vercel.app` 地址能打开
- [ ] Vercel 里添加了 `ns1900.com` 和 `www.ns1900.com`
- [ ] 域名商处配置了 A 记录和 CNAME
- [ ] DNS 状态变成 Valid Configuration
- [ ] HTTPS 证书已签发，`https://ns1900.com` 能访问
- [ ] 设定了主域名（不带 www 为主）
