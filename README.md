# 编辑式作品集模板

[![开源许可：MIT](https://img.shields.io/badge/%E5%BC%80%E6%BA%90%E8%AE%B8%E5%8F%AF-MIT-black.svg)](LICENSE)

这是一套面向综合设计师的 React 作品集模板。框架保留了完整的编辑式版面、响应式交互、项目画廊、角色展示、服装轮播、动态影像模块、开场动画和滚动控制的结尾视频。仓库中只包含中性示例文字和原创抽象占位素材，不含任何个人作品或私人资料。

## 模板包含什么

- 10 个可配置模块，覆盖个人介绍、项目、服装、角色和动态影像等内容。
- 桌面端和手机端响应式布局。
- 开场画面、导航、光标动效、声音开关和滚动控制视频。
- 内容与页面组件分离，大部分资料只需在 `src/data/` 中修改。
- 本地 SVG 图片和 WebM 视频占位素材，不使用第三方作品。
- 内置结构测试、隐私扫描和正式版本构建检查。

使用技术：React、Vite、Framer Motion、GSAP 和原生 CSS。

## 快速开始

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可预览。正式发布前运行：

```bash
npm run verify
```

## 使用说明

这是一套可直接改内容的设计师作品集框架。默认文字、项目和媒体都是中性示例；你不需要先理解 React，只要按下面顺序替换即可。

### 1. 安装和打开

1. 安装 Node.js 20.19 或更新版本。
2. 下载本仓库后，在项目文件夹打开终端。
3. 运行 `npm install` 安装所需工具。
4. 运行 `npm run dev` 启动本地预览。
5. 打开终端显示的本地网址。修改文件并保存后，页面会自动刷新。

常用命令：

```bash
npm run dev       # 本地预览
npm run build     # 生成可发布文件
npm test          # 运行结构与功能测试
npm run verify    # 测试、构建和隐私检查一起执行
```

### 2. 修改姓名与简介

内容主要集中在 `src/data/`，直接用文本编辑器打开即可：

- `siteConfig.js`：网站名称、职业名称、导航文字、模块顺序和显示开关。
- `profileData.js`：头像、个人简介、经历、技能与工具。
- `contactData.js`：邮箱、网站、结尾联系方式和下载入口。
- `overviewData.js`：项目总览卡片。
- `ipProjects.js`：IP 与衍生设计。
- `illustrationData.js`：插画与图案项目。
- `brandProjects.js`：品牌视觉项目。
- `fashionData.js`：服装分类、封面和详情图。
- `characterBuildData.js`：角色卡、三视图和演示视频。
- `aigcVideoData.js`：动态影像列表。

建议先全局搜索 `YOUR NAME`、`你的名字`、`hello@example.com`、`example.com` 和“填写你的”，逐项换成自己的资料。

### 3. 替换项目图片

示例素材都在 `public/placeholders/`。你可以在 `public/` 下新建自己的文件夹，例如 `public/projects/`，再把数据文件中的路径改成：

```js
cover: "/projects/project-01/cover.webp"
```

推荐图片格式：

- 照片和作品图：WebP 或压缩过的 JPG。
- 透明图：WebP 或 PNG。
- 图形标志：SVG。
- 大图尽量控制在 1 MB 左右，避免首页加载过慢。

不要直接覆盖占位图；使用独立文件夹更容易管理，也方便以后更新模板。

### 4. 替换首屏和结尾视频

模板视频位于 `public/placeholders/videos/`。对应位置：

- `src/components/IntroScreen.jsx`：进入网站前的开场视频。
- `src/components/Hero.jsx`：首页主视觉视频。
- `src/data/aigcVideoData.js`：动态影像模块。
- `src/data/characterBuildData.js`：角色模块中的视频。
- `src/components/OutroVideo.jsx`：滚动控制的结尾视频。

替换时建议使用 WebM 或 MP4、无音轨、横向 16:9，并压缩到合理大小。若结尾视频的主体位置与模板不同，需要同步调整 `OutroVideo.jsx` 顶部的 `TABLET_SCREEN` 四个比例值，保证联系按钮落在正确区域。

### 5. 修改颜色、字体和模块顺序

全局颜色、字体、间距与圆角主要在 `src/index.css` 顶部的 `:root`（全局变量区）。先改这里，整站会统一变化。

字体全部本地托管，不请求任何第三方字体服务：拉丁字形（Caveat / Unbounded / Space Mono）放在 `public/fonts/`，由 `src/fonts.css` 里的 `@font-face` 声明；中文字形走系统字体（PingFang SC / Microsoft YaHei 等），因为 CJK 字体单字重就有好几 MB，不适合随页面下载。想换成自己的字体，请把字体文件放进 `public/`，在 `src/fonts.css` 里补上 `@font-face`，并同步更新 `src/index.css` 中对应的字体变量；使用前请确认授权允许网页公开使用。

模块顺序由 `src/data/siteConfig.js` 的 `sections` 数组决定：

- 调整数组顺序即可调整页面顺序。
- 把某一项的 `enabled: true` 改成 `false`，即可暂时隐藏该模块。
- 不要修改 `id`，它用于连接页面组件和导航。

### 6. 开启简历与作品集下载

模板默认不附带任何简历或作品集文件。先把你自己的 PDF 放到例如 `public/downloads/`，再在 `src/data/contactData.js` 中加入下载项：

```js
const downloads = [
  {
    label: "简历",
    value: "下载 PDF",
    href: "/downloads/cv.pdf",
    download: "cv.pdf",
  },
];
```

公开前请重新打开 PDF 检查作者信息、文件属性、联系方式和隐藏页面，避免误传私人资料。

### 7. 发布前隐私检查

这是最重要的一步，别让私人文件混进公开仓库，真的会谢。

1. 删除不准备公开的原图、照片、视频、PDF 和导出文件。
2. 全局搜索姓名、电话、邮箱、住址、客户名、公司名、原项目名和电脑本地路径。
3. 确认 Git 记录中也没有误提交过这些内容；只删除当前文件并不能抹掉旧历史。
4. 运行 `npm run verify`。它会执行测试、生成正式版本并扫描常见隐私信息。
5. 再人工浏览一次 `src/data/`、`public/` 和最终生成的 `dist/`。

隐私扫描是安全网，不等于人工确认。你添加的新图片、视频和 PDF 里的文字或文件属性，仍需自己检查。

### 8. 部署到 Vercel、Netlify 或 GitHub Pages

发布前先运行：

```bash
npm run verify
```

**Vercel**

1. 在 Vercel 导入 GitHub 仓库。
2. Framework Preset（框架预设）选择 Vite。
3. Build Command（构建命令）使用 `npm run build`。
4. Output Directory（输出目录）使用 `dist`。

**Netlify**

1. 在 Netlify 导入 GitHub 仓库。
2. Build command（构建命令）填写 `npm run build`。
3. Publish directory（发布目录）填写 `dist`。

**GitHub Pages（本仓库已配好自动部署，见 `DEPLOY.md`）**

仓库里已经放好了 `.github/workflows/deploy.yml`：推送到 `main` 就会自动跑 `npm run verify`，通过后把 `dist/` 发布到 GitHub Pages。`vite.config.js` 从 `process.env.BASE_URL` 读 base 路径，GitHub 的 `actions/configure-pages` 会自动注入正确的子路径，所以**普通仓库和 `账号.github.io` 根仓库都不用再手动改配置**。

1. 在 GitHub 建好仓库、推代码上去，然后在仓库 **Settings → Pages** 里把 Source 选成 **GitHub Actions**。完整步骤见 `DEPLOY.md`。
2. 模板里的占位图片和视频会自动跟随子路径；你在数据文件里新增媒体时，请继续使用 `publicAsset("/你的路径")` 包一层。
3. 如果不用 Actions、想手动发布：普通仓库运行 `npm run build -- --base=/仓库名/`，自定义域名或 `账号.github.io` 根仓库直接运行 `npm run build`，然后把 `dist/` 推到你自己的发布分支。

环境变量示例见 `.env.example`。不要把密码、访问令牌或私密 API key（接口密钥）写进以 `VITE_` 开头的变量，因为它们会出现在浏览器代码里。

## 项目结构

```text
public/placeholders/      中性占位图片与原创演示视频
src/components/           页面模块和交互组件
src/data/                 最常修改的文字、项目与媒体路径
src/utils/                轮播、视频加载和其他工具
tests/                    自动检查
scripts/                  隐私与发布检查脚本
.github/workflows/        GitHub Pages 自动部署工作流
src/fonts.css             自托管字体的 @font-face 声明
public/fonts/             自托管的拉丁字形 woff2 文件
```

## 已知问题

- **毛玻璃效果在正式构建后失效**：`src/index.css` 里的 `backdrop-filter` 会被 CSS 压缩器连同标准属性一起删掉，产物中只剩浏览器已不再支持的 `-webkit-backdrop-filter`，所以 `.glass`、`.glass-strong`、`.btn` 的模糊只在 `npm run dev` 下可见。真正开启时有实打实的滚动开销（同页交替实测：关闭约 96fps，开启约 80fps，且与模糊半径无关，成本来自固定定位元素每帧重算背景），因此这里保持现状并记录，不做“顺手修复”。
- **中文使用系统字体**：中文不再下载网络字体，因此在 macOS（PingFang SC）和 Windows（Microsoft YaHei）上，中文的换行位置与行高会有细微差别，这是本地化字体的正常取舍。

## 开源许可

代码使用 [MIT License（MIT 开源许可证）](LICENSE)发布。仓库里的占位素材是专门为这套模板生成的抽象演示内容。将网站作为自己的作品集发布前，请替换所有示例文字、图片和视频。
