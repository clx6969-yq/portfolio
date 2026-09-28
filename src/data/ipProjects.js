import { publicAsset } from "../utils/publicAsset.js";

/**
 * IP 联名 —— 三张卡 + 每张卡下挂的图
 * ------------------------------------------------------------
 * 素材全部来自《宝矿力水特 × 洛克王国:世界 跨界联名策划》那份 23 页 PPT,
 * 直接从 pptx 里解出来的内嵌原图(不是截图,也不是重画的):
 *   - 6 张活动海报   ← ppt/media/image34 ~ image39
 *   - 联名周边展示板 ← image40(1536x1024)
 *   - IP 形象立绘    ← image11(洛克少年)
 *   - 消费者画像立绘 ← image24 / 25 / 26(现在只作素材留存,页面不引用)
 * 处理脚本在 _doc/_ipreal_prep.ps1(裁比例、压体积、生成三本书的封面),
 * 想换图把新文件按同名丢进 public/ip/ 或 public/ip/deck/ 就行,组件不用动。
 *
 * 三张卡的分工:
 *   01 跨界联名总策划 —— 弹窗里整份引用原始 PPT 的 23 页(不写文字总结,
 *      见 components/IpDeck.jsx)
 *   02 联名周边与 IP 形象 —— 走 PosterGallery 版式墙
 *   03 联名宣传主视觉 —— 走 PosterGallery 版式墙
 *
 * images 里的 wide: 横长图(比例 > 1.4)在版式墙里横跨两列,免得它那一行
 * 被压得比其他格子矮一大截。
 */
// 文件名带扩展名(01 的封面是 jpg,IP 形象立绘是带透明的 png,不统一猜)
const ip = (file) => publicAsset(`/ip/${file}`);

/* 01 弹窗里铺出来的那份原方案:_doc/_ipreal 里 23 张页面图压过体积后
   落在 public/ip/deck/p01.jpg ~ p23.jpg,顺序就是 PPT 页码顺序。 */
const deckPages = Array.from({ length: 23 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: ip(`deck/p${n}.jpg`),
    label: `原方案 PPT · 第 ${i + 1} 页 / 共 23 页`,
  };
});

const projects = [
  {
    title: "跨界联名总策划",
    titleCn: "宝矿力水特 × 洛克王国 跨界联名策划",
    kicker: "IP 联名策略",
    tag: "IP / 策划 / 整合营销",
    cover: "cover-01.jpg",
    deck: deckPages,
    images: [],
  },
  {
    title: "联名周边与 IP 形象",
    titleCn: "衍生周边设计与 IP 形象落地",
    kicker: "衍生设计",
    tag: "IP / 周边 / 形象",
    desc: "围绕「冒险补给」衍生全套联名周边:保温水壶、贴纸、亚克力立牌、挂绳证件卡、帆布袋、圆形化妆镜、陶瓷马克杯、鼠标垫;同步以洛克少年形象完成联名视觉的落地呈现。",
    cover: "cover-02.jpg",
    images: [
      { name: "merch.jpg", label: "联名周边全景 / MERCH LINE-UP", wide: true },
      { name: "boy.png", label: "IP 形象 · 洛克少年 / HERO" },
    ],
  },
  {
    title: "联名宣传主视觉",
    titleCn: "活动海报与传播物料",
    kicker: "传播物料",
    tag: "IP / 海报 / 主视觉",
    desc: "按预热 / 爆发 / 延续三段式节奏产出的 6 张主视觉:悬念预告、话题征集、上线预告、游戏内道具、扫码抽奖到线下快闪店,覆盖线上线下全渠道。",
    cover: "cover-03.jpg",
    images: [
      { name: "poster-01.jpg", label: "预告海报 · 缺水预警 / TEASER" },
      { name: "poster-02.jpg", label: "话题海报 · 续航神器 / UGC" },
      { name: "poster-03.jpg", label: "上线预告 · 补给站地图 / PRE-LAUNCH" },
      { name: "poster-04.jpg", label: "游戏道具 · 补给液 / IN-GAME" },
      { name: "poster-05.jpg", label: "扫码抽奖 · 联名好礼 / SWEEPSTAKE" },
      { name: "poster-06.jpg", label: "快闪店现场 · 3 米水蓝蓝 / POP-UP" },
    ],
  },
];

export const ipProjects = projects.map((project, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `ip-project-${number}`,
    index: number,
    title: project.title,
    titleCn: project.titleCn,
    kicker: project.kicker,
    tag: project.tag,
    cover: ip(project.cover),
    deck: project.deck || [],
    images: project.images.map((img) => ({
      src: ip(img.name),
      label: img.label,
      wide: Boolean(img.wide),
    })),
    desc: project.desc,
  };
});
