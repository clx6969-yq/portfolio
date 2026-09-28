import { publicAsset } from "../utils/publicAsset.js";

/* 首页「目录」那 4 张牌的封面。顺序 = 卡片顺序 = 板块顺序
   (个人简介 → 影视创作 → 运营作品 → IP 策划),siteConfig.js 的
   sections 已经跟着调成同一个顺序,点第几张就跳到第几个板块。

   封面图放在 public/catalog/,是 _doc/_catalog.ps1 从原图压出来的:
     01 个人简介  插画头像            0.750 竖版
     02 影视创作  纪录片《活路》海报   1.000 方形(和影视创作板块里那张海报同一张画)
     03 运营作品  抖音作品网格        0.543 长图
     04 IP 策划   宝矿力水特 × 洛克王国 1.333 横版

   之前卡片是硬套票根的 618:1200 比例、图片 object-fit: cover
   (旧图是专门的票根截图,比例刚好),换成这四张真实作品图之后,
   横版那张会被裁掉一半,所以现在卡片高度跟着图走(见 CSS)。

   titleCn 现在只做两件事:图片的 alt,以及压在卡片底部的文字提示
   (「个人简介 / 影视创作 / 运营作品 / IP 策划」)。tagLines /
   sideCaption / footerTag 这几个字段是卡片还用代码画的时候留下的,
   现在卡片直接渲染封面图,已经没人读了,先留着不动。 */
const overview = [
  {
    target: "about",
    titleCn: "个人简介",
    tagLines: ["个人简介", "新媒体运营", "2026"],
    sideCaption: ["文案", "视觉", "运营"],
    footerTag: "关于我",
    cover: "/catalog/01-about.jpg",
  },
  {
    target: "media",
    titleCn: "影视创作",
    tagLines: ["影视创作", "剪辑 / 短视频", "2026"],
    sideCaption: ["PR", "剪映", "创作"],
    footerTag: "影视创作",
    cover: "/catalog/02-media.jpg",
  },
  {
    target: "brand",
    titleCn: "运营作品",
    tagLines: ["品牌与内容运营", "官网 / 公众号 / 抖音", "2026"],
    sideCaption: ["规划", "内容", "运营"],
    footerTag: "品牌与内容",
    cover: "/catalog/03-brand.jpg",
  },
  {
    target: "ip",
    titleCn: "IP 策划",
    tagLines: ["IP 联名", "宝矿力水特 × 洛克王国", "2026"],
    sideCaption: ["策划", "设计", "整合"],
    footerTag: "IP 联名",
    cover: "/catalog/04-ip.jpg",
  },
];

export const overviewItems = overview.map((item, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `overview-${number}`,
    target: item.target,
    index: number,
    titleEn: `作品目录\n${number}`,
    titleCn: item.titleCn,
    tone: index % 2 ? "dark" : "light",
    tagLines: item.tagLines,
    sideCaption: item.sideCaption,
    coords: ["29.5630° N", "106.5516° E"],
    footerTag: item.footerTag,
    // 卡片上真正渲染的就是这一张;image 保留同一个地址,给以后
    // 需要"大图预览"的地方用。
    image: publicAsset(item.cover),
    cardImage: publicAsset(item.cover),
  };
});
