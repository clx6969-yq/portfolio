import { publicAsset } from "../utils/publicAsset.js";

/**
 * 09 — 动态影像
 * ------------------------------------------------------------
 * 原来这里是 4 条纯演示数据(品牌宣传短片 / 联名活动宣传视频 / 亲子活动
 * 纪实 / 内容混剪),播放源都指向同一个 197 KB 的占位 webm。
 * 现在这里是 2 条真实作品:微电影《己》+ 纪录片《活路》。
 *
 * 关于素材(全部在 public/placeholders/ 下,文件名用 slug 当前缀):
 *   <slug>.mp4        转码后的正片,放在 videos/ 子目录。
 *                     ego.mp4   源文件 806 MB / H.265 / 10.5 Mbps;
 *                     huolu.mp4 源文件 620 MB / 4K 2880×2160 / H.264。
 *                     两个都已重编码 + 加 faststart(moov 前置,可边下边播)。
 *                     2026-09-24 部署上线前再压一次,720p / 30fps / H.264 / maxrate 320kbps
 *                     + AAC 96kbps,ego 30 MB / huolu 38 MB;原始高画质副本留在
 *                     仓库外的 _original_backup/ 里,需要 1080p/4K 演示时再换回去。
 *   <slug>-poster.jpg CD 盒封面。
 *   <slug>-thumb.jpg  按播放器画幅合成的横版,用作 <video poster>。
 *
 * 关于《活路》的画幅(这里踩过一个坑,记下来):
 *   片子是 4:3,而播放器是 aspect-ratio:16/10 + object-fit:cover 的硬框。
 *   4:3 素材丢进去会被上下各裁掉约 8% —— 正好切掉烧在画面底部的字幕。
 *   所以不改公共 CSS(免得影响已在线的《己》),改成在转码阶段
 *   就把 16:10 画幅烘进成片:4:3 原画按高度居中,左右补黑边。
 *   缩略图也用同样的黑边,这样 poster 切到正片时不会有画面跳变。
 *
 * 关于"主创名单":模板原本在 CD 卡片下方有一个像片尾字幕那样的
 *  crew 列表(meta 字段)。按"个人专属作品集不放团队名单"的需求,
 * 这里已经把 meta 字段拿掉了,组件里对应的渲染段也跟着清掉
 * (AigcVideoLibrary.jsx 里的 meta 分支 + CSS 里的 .aigc-disc-meta*)。
 * 以后想让某一部作品重新显示 crew,把数据里的 meta 加回去、
 * 组件里那段 JSX 恢复即可,改动量很小。
 *
 * 说明:以后还有别的片子,往 videos 数组里追加即可 —— 记得带 slug,
 * 并按 slug 命名的三份素材放进 public/placeholders/,
 * 左侧 CD 架会自动增列,组件不用动。
 */
export const aigcIntro = {
  // 全中文,不留英文。
  //   eyebrow  序号 + 板块名(对应其他板块的「07 — FASHION」,只是换成中文)
  //   title    板块大字标题,原来的 FILMMAKING 换成「影视创作」
  //   sub      作品类别 + 规模,原来在右侧的 meta(2 部 / 23 分 48 秒 / 2026)
  //            已经并进这一行 —— 那三行原本跟底部 footer 完全重复
  eyebrow: "04 — 影视创作",
  title: "影视创作",
  sub: "微电影 / 纪录片 · 2 部 · 23 分 48 秒",
  // 底部那行的年份,跟着作品走,别写死
  year: "2026",
};

// 《己》《活路》的原画正片(448 MB)不走 git 仓库 —— 单文件超出 GitHub blob
// 上限,所以托管在 Release v1;CI 构建 deploy.yml 会把它们拉进 dist/,
// 从 github.io 同源发出。
//
// ⚠️ 国内直连 github.io 的带宽很不稳定(实测 19 KB/s ~ 2.5 MB/s 波动),
// 而 gh-proxy.com 镜像走 Cloudflare 边缘,实测稳定 4 MB/s+。所以:
//   生产环境 videoSrc 走镜像(起播快、拖动顺);
//   videoSrcFallback 留同源地址,镜像挂了播放器 onError 自动切过去;
//   本地 dev 直接播 public/ 里的原片(不依赖网络)。
const RELEASE_URL = "https://github.com/clx6969-yq/portfolio/releases/download/v1";
const VIDEO_MIRROR = "https://gh-proxy.com/" + RELEASE_URL;

const videos = [
  {
    // slug 决定素材文件名:
    // ego-poster.jpg / ego-thumb.jpg / videos/ego.mp4
    slug: "ego",
    titleEn: "己",
    titleCn: "微电影《己》",
    duration: "10:43",
    tags: ["微电影", "叙事", "主创"],
    // 海报框的宽高比(CSS aspect-ratio 直接吃的字符串)。
    // 《己》的海报是 763×1080 竖版;原来框子写死 1306/1204 近方形,
    // 竖版海报塞进去左右各裁 ~17%,海报基本看不出原样。
    caseAspect: "763 / 1080",
    // 主创名单已移除 —— 见文件头注释。
    // link: "" 留空 —— 这片子没有外部播放页,留空后播放器底部
    // 不会渲染「查看作品 ↗」按钮。以后传了 B站/腾讯视频再加。
    link: "",
  },
  {
    // huolu-poster.jpg / huolu-thumb.jpg / videos/huolu.mp4
    slug: "huolu",
    titleEn: "活路",
    titleCn: "纪录片《活路》",
    duration: "13:05",
    tags: ["纪录片", "纪实", "主创"],
    // 《活路》的封面本身就是 1306×1204 近方形,原样展示
    caseAspect: "1306 / 1204",
    link: "",
  },
];

export const aigcVideos = videos.map((video, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `video-${number}`,
    // 卡片上显示的分类编号。原来直接渲染 id,显示成「VIDEO-01」,
    // 是英文,改成中文的「作品 01」。id 继续保留给 React key / 锚点用。
    code: `作品 ${number}`,
    titleEn: video.titleEn,
    titleCn: video.titleCn,
    duration: video.duration,
    tags: video.tags,
    link: video.link,
    caseAspect: video.caseAspect,
    cover: publicAsset(`/placeholders/${video.slug}-poster.jpg`),
    disc: publicAsset(`/placeholders/${video.slug}-poster.jpg`),
    poster: publicAsset(`/placeholders/${video.slug}-thumb.jpg`),
    // 正片:生产走 gh-proxy 镜像(国内快),dev 走本地原片;
    // videoSrcFallback 是 github.io 同源地址,镜像不可用时播放器自动切换。
    // (import.meta.env 用 ?. 访问 —— node:test 直接 import 本文件时
    // import.meta.env 是 undefined,不 ?. 会在模块加载阶段就抛错。)
    videoSrc: import.meta.env?.DEV
      ? publicAsset(`/placeholders/videos/${video.slug}.mp4`)
      : `${VIDEO_MIRROR}/${video.slug}.mp4`,
    videoSrcFallback: publicAsset(`/placeholders/videos/${video.slug}.mp4`),
  };
});