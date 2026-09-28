# 部署到 GitHub Pages

本作品集已经备好了一键部署到 GitHub Pages 的流水线：`.github/workflows/deploy.yml`。代码推上 `main` 分支，GitHub Actions 会自动跑 `npm run verify`（测试 + 构建 + 隐私扫描），全过就把 `dist/` 部署到 Pages。

这套流程对两种仓库形式都适用，不用手动改 vite 配置：

| 仓库形式 | 最终地址 | 自动注入的 `BASE_URL` |
|---|---|---|
| `<用户名>.github.io`** （用户名同名根仓库） | `https://<用户名>.github.io/` | `/` |
| `<用户名>.github.io/<仓库>`**（普通仓库） | `https://<用户名>.github.io/<仓库>/` | `/<仓库>/` |

vite.config.js 从 `process.env.BASE_URL` 读，GitHub Actions 的 `actions/configure-pages@v5` 会把上面对应的子路径自动注进去。

---

## 一、在 GitHub 上建仓库

仓库名两种选法，看你的需求：

- **根用户名仓库**（推荐，地址最短、最正式）：仓库名必须跟用户名完全一致 `用户名.github.io`。**私人作品集默认用这种**。
- **普通仓库**：随便起名字，比如 `portfolio`、`cailingxiao-portfolio`，地址会多一层 `/仓库名/`。

建的时候保持 **Public**（GitHub Pages 必须 Public 仓库，私有仓库需要 Pro 账号）。**不要**勾 "Add a README" / ".gitignore" / "license" 这三项，仓库要空着，等会儿本地代码会推上去。

---

## 二、第一次把代码推上去

在本地 `editorial-portfolio-template-main/` 目录下打开终端（PowerShell / Terminal / VS Code 都可以），逐条跑：

```bash
# 0. 先配置 commit 身份 —— 用 GitHub 官方隐私邮箱,别用你的 QQ / 163 私人邮箱。
#    这个地址在 GitHub 任意页面的 Settings → Emails 里能找到,
#    形如 "12345678+你的用户名@users.noreply.github.com"。
#    私人邮箱会永久留在 commit 历史里被爬,而且 CI 里有个检查会直接报红。
git config user.name  "你的名字（或用户名）"
git config user.email "12345678+你的用户名@users.noreply.github.com"

# 1. 初始化 git 仓库（如果还没初始化过）
git init

# 2. 改默认分支名（GitHub 默认 main，git 旧版默认 master,统一一下）
git checkout -b main   # 或者 git branch -M main

# 3. 添加全部文件并做第一次提交
git add .
git commit -m "feat: initial portfolio site"

# 4. 把 GitHub 仓库设成 remote —— 把第 1 步建仓库时 GitHub 给的那个
#    地址粘进来。两种写法二选一：
#      SSH 形式：  用户名@github.com: 换成你的账号，形如
#                  git remote add origin <账号>@github.com:<账号>/<仓库>.git
#      HTTPS 形式：git remote add origin https://github.com/<账号>/<仓库>.git
#    （上面 SSH 那一行里的 "<账号>@github.com" 直接照抄即可,那不是邮箱。）
git remote add origin <你的仓库 URL>

# 5. 推上去
git push -u origin main
```

第一次推完先别急，**网站还看不到**——还得去 GitHub 网站上启用 Pages。步骤三做这个。

---

## 三、在 GitHub 网站上启用 Pages（一次性）

1. 进你刚建的仓库页面，点顶上 **Settings** 标签。
3. 找到 **Pages** 那节。
3. **Source** 选 **GitHub Actions**（不是 "Deploy from a branch"）。
3. （可选）在 **Custom domain** 框里填你的域名。如果暂时没有，留空就行。

设置完不用再做任何事，等 1～2 分钟让 Actions 跑完第一次部署，部署成功的页面会出现在 **Actions** 标签里。成功之后 **Settings → Pages** 顶部会显示一行绿色的网址，那就是你的作品集地址。

---

## 四、之后每次改动怎么上线

```bash
# 在本地编辑完代码
git add .
git commit -m "feat: ...写这次改了什么"
git push
```

推上去之后，GitHub Actions 会自动跑 `npm run verify` → 通过 → 部署。如果 verify 失败，Actions 那条会变红、`main` 不会部署，你点进 Actions 看日志就知道哪步挂了（测试 / 构建 / 隐私扫描 一般都明确告诉你具体哪条没过）。

---

## 五、自定义域名（以后想用再说）

在 `public/CNAME` 里写你买的域名（例如 `cailingxiao.com`），下次 push 上去就会自动带上。DNS 那一侧在你的域名服务商（阿里云、Cloudflare 等）那里加一条 CNAME 记录指向 `<用户名>.github.io` 即可。`DEPLOY.md` 这份文档默认不创建 `CNAME`，等真要用了告诉我，我帮你写。

---

## 六、常见问题

**Q：Actions 跑完了但 `Settings → Pages` 还是没显示网址。**
A：先看 Actions 是不是绿的；红了的话点进去看日志。绿的话等 1 分钟刷新，GitHub 后台配 URL 有延迟。

**Q：网站打开了但所有图片 / 视频 404。**
A：八成是 `BASE_URL` 不对。打开浏览器开发者工具 → Network，看 404 的 URL 前缀 —— 如果是 `/placeholders/...` 缺了仓库名前缀，就是 vite 的 base 没生效。检查 `vite.config.js` 是不是有 `base: process.env.BASE_URL || "/"`；检查 Actions workflow 里是不是有 `actions/configure-pages@v5` 那一行。

**Q：本地 `npm run dev` 一切正常，但部署到 Pages 后打开是空白。**
A：90% 是 base 路径不对（同 Q）。另外看看有没有不在 `publicAsset()` 包装下写死的绝对路径 `/placeholders/...`，那批不会跟随 base 变化，需要全部换成 `publicAsset('/...')`。

**Q：怎么回退到上一个版本？**
A：GitHub 上点进 Actions → 选之前那一次绿的工作流 → 右边 Re-run jobs。但更稳的是 `git revert <commit> && git push`，让 Actions 自动跑一遍 verify + 部署。