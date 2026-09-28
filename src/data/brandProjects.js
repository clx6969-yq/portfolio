import { publicAsset } from "../utils/publicAsset.js";

// 素材都在 public/brand/ 下。
// thumb 是左列表那张方缩略图(52x52 正方形,object-fit: cover,所以源图最好
// 是正方形);long 是右栏滚动区里的长图,宽高随意。
//
//  01 企业官网搭建 —— 线上站整页截图
//  02 公众号运营   —— 六篇推文各有一张整篇长图(links[].long)。列表缩略图是
//                     六篇标题区拼的 3x2 矩阵;右栏默认显示第 1 篇,点顶栏的
//                     胶囊就地切换看哪一篇,「阅读全文」才跳原文
//  03 抖音运营     —— 两个账号的整页截图并排成一条(用 dy-thumb / dy-long)
//
// 拼图脚本见 _doc/_compose.ps1,改了源图重跑即可。
const projects = [
  {
    title: "企业官网搭建",
    titleCn: "怡贰叁科技企业官网 · 从 0 到 1 搭建",
    tag: "网站 / 规划 / 开发",
    thumb: "/brand/cor-site-thumb.jpg",
    long: "/brand/cor-site-long.jpg",
    links: [{ label: "访问线上站点", url: "https://www.123cor.com" }],
  },
  {
    title: "公众号运营",
    // 账号名写在副标题里 —— 六篇同属一个号,标题那行不再重复。
    titleCn: "九域巴渝·健康生活馆 · 原创 30 篇 / 阅读 5000+（收录 6 篇）",
    tag: "运营 / 内容 / 选题",
    thumb: "/brand/gzh-matrix-thumb.jpg",
    // 没选具体某一篇时的兜底图(没有 links 长图时也会用到)
    long: "/brand/gzh-montage-long.jpg",
    // 六篇代表作,顺序与矩阵缩略图的格子一致(左到右、上到下)。
    // label 是顶栏上那颗小胶囊的文字,title 是悬停提示(放完整标题),
    // long 是这一篇的整篇长图 —— 点胶囊就在右栏直接看,不跳浏览器。
    links: [
      {
        label: "益生菌",
        title: "《建议：这六类人群一定要尝试补充益生菌！》8/31",
        url: "https://mp.weixin.qq.com/s/NLN-rZ2ng6k87kFOvYSf7A",
        long: "/brand/wx-probiotics-long.jpg",
      },
      {
        label: "心脏情书",
        title: "《一封来自心脏给你的情书，请查收》8/13",
        url: "https://mp.weixin.qq.com/s/hzE_SgGJWCnm-_2HauNCyA",
        long: "/brand/wx-heartletter-long.jpg",
      },
      {
        label: "捶背",
        title: "《那个给爸妈捶背的小孩，现在最需要被捶的是自己》7/24",
        url: "https://mp.weixin.qq.com/s/zobVUsX9A49obztmDvZdZQ",
        long: "/brand/wx-backrub-long.jpg",
      },
      {
        label: "控烟",
        title: "《为什么在公共场所吸烟的人，成了人人所反感的越界者？》7/20",
        url: "https://mp.weixin.qq.com/s/cfafUot7b4pnD9WebxIh1g",
        long: "/brand/wx-smoking-long.jpg",
      },
      {
        label: "血脂",
        title: "《4亿人血脂异常！全国整体控制率却不到 5%》7/10",
        url: "https://mp.weixin.qq.com/s/o66juzroywrj_OG0fOEpqw",
        long: "/brand/wx-lipid-long.jpg",
      },
      {
        label: "慢病",
        title: "《中国十大慢性病排行，第一名超 3 亿人！》7/8",
        url: "https://mp.weixin.qq.com/s/PaQJkjP8rqr7f-IYXYkhcQ",
        long: "/brand/wx-chronic-long.jpg",
      },
    ],
  },
  {
    title: "抖音运营",
    // 两个账号的整页截图并排:画本小晴天(手绘插画,25.8 万获赞 / 589 粉丝)
    // 与一念生花(手写文案笔记,17.9 万获赞 / 7936 粉丝)。数字不进副标题:
    // 左列只放得下两行,写全了会被省略号砍掉(截图里本来就能看到)。
    titleCn: "两个账号 · 手写文案笔记 / 手绘插画",
    tag: "运营 / 内容 / 涨粉",
    thumb: "/brand/dy-thumb.jpg",
    long: "/brand/dy-long.jpg",
  },
];

export const brandProjects = projects.map((project, index) => {
  const number = String(index + 1).padStart(2, "0");
  const tone = (index % 2) + 1;
  return {
    id: `brand-project-${number}`,
    title: project.title,
    titleCn: project.titleCn,
    tag: project.tag,
    // 顶栏的直达入口。统一成数组:单条(官网)是一颗胶囊,多条的(公众号)
    // 是一排胶囊 + 一颗「阅读全文」。带 long 的条目点一下不跳转,而是在右栏
    // 就地显示这一篇的整篇长图。
    links: (project.links || []).map((link) => ({
      ...link,
      longImage: link.long ? publicAsset(link.long) : null,
    })),
    image: publicAsset(project.thumb || `/placeholders/landscape-0${tone}.svg`),
    portraitImage: publicAsset(project.thumb || `/placeholders/portrait-0${tone}.svg`),
    longImage: publicAsset(project.long || `/placeholders/portrait-0${tone}.svg`),
  };
});
