import { publicAsset } from "../utils/publicAsset.js";

export const profile = {
  /* 个人证件照 —— "个人简介"板块左上角那张会跟着鼠标 3D 倾斜的照片卡
     (About.jsx → TiltIdCard)。
     图片放在 public/placeholders/id-photo.jpg,由 publicAsset() 拼路径,
     子路径部署(比如 GitHub Pages 的 /repo-name/)也不会失效。
     当前图 799×1080(比例 0.740),卡片是按图片自身宽高渲染的
     (width:100% + height:auto),所以不会被裁切或拉伸;和占位图
     1000×1400(0.714)比例差 3.6%,视觉上看不出来。
     想换头像时直接覆盖这个 jpg 即可,不用动代码。
     注:比例固定 0.740(约 20:27),换图时尽量保持,否则卡片会跟着变高。 */
  avatarCard: publicAsset("/placeholders/id-photo.jpg"),
  nameEn: "蔡灵潇",
  nameCn: "蔡灵潇",
  idCode: "个人作品集 / 2026",
  introEn: "网络与新媒体专业在读，熟悉品牌策划与新媒体运营，擅长 IP 联名创意构思，可独立完成文案、视觉及视频创作，兼具线下运营经验。",
  introCn: "网络与新媒体专业在读，熟悉品牌策划与新媒体运营，擅长 IP 联名创意构思。可独立完成文案、视觉及视频创作，个人运营账号粉丝 10000+、点赞量 400000+，兼具线下运营经验，做事细心负责，执行力强。",
  // 卡片展示的字段只这 3 项:邮箱 / 常驻 / 状态。电话 / 微信
  // 那两条只放在尾部联系方式卡(contactInfo.links)里,那里有
  // tel: 和 weixin:// 跳转,这里就不再重复挂出,避免一打开简介
  // 就 5 行联系信息显得拥挤。
  //
  // href 字段先填好(邮箱 → 邮件协议),但 Hero.jsx 现在把这 3 项
  // 渲染成纯 <span> 不会真的可点 —— 这是有意为之,Hero 区域只
  // 是让访客快速看到信息,真要交互留给尾部的联系卡。等以后想
  // 把这里的邮箱也做成可点链接,直接把 <span> 改成 <a href={c.href}>
  // 就行,不用再来改这份数据。
  contacts: [
    { label: "邮箱", value: "2499844276@qq.com", href: "mailto:2499844276@qq.com" },
    { label: "常驻", value: "重庆" },
    { label: "状态", value: "求职中" },
  ],
  /* 工作经历。"点击展开"之后,每条右边那张小图就是这里的 logo ——
     原来挂的是方形占位图,现在换成各家真实的图:
       东傲科技(品牌「怡贰叁科技」官网)→ /resume/dongao-site.jpg  官网首屏
       万达宝贝王                      → /resume/wanda-kids.png  品牌 logo
       重庆城市科技学院                → /resume/cqu.jpg          校园实拍
     图都放在 public/resume/,尺寸由 _doc/_resume.ps1 裁好(展示位只有
     128x84、图按 contain 缩放,长边 900 已经够)。 */
  timeline: [
    {
      year: "2026.06 — 2026.09",
      role: "新媒体运营",
      roleEn: "新媒体运营",
      company: "重庆东傲科技发展有限公司",
      logo: publicAsset("/resume/dongao-site.jpg"),
      desc: "独立负责公司微信公众号「九域巴渝·健康生活馆」搭建与运营，承担内容选题、文案撰写、排版发布等全流程工作；同时独立负责公司官网从 0 到 1 的建设与日常维护。",
      keyProjects: [
        "公众号「九域巴渝·健康生活馆」原创内容 30 篇，纯自然流量总阅读量 5000+",
        "企业官网从 0 到 1 独立搭建并上线",
        "官网栏目规划、内容更新与功能运维",
      ],
      keywords: ["内容", "运营", "增长"],
    },
    {
      year: "2025.06 — 2025.09",
      role: "乐园运营",
      roleEn: "乐园运营",
      company: "万达宝贝王",
      logo: publicAsset("/resume/wanda-kids.png"),
      desc: "统筹园区现场客流管理与动线规划，落地亲子主题文娱活动，把控现场运营安全与服务标准。",
      keyProjects: [
        "亲子主题文娱活动策划与现场统筹",
        "园区日常安全巡检与场地运维",
      ],
      keywords: ["活动", "服务", "协作"],
    },
    {
      year: "2023.09 — 至今",
      role: "网络与新媒体（本科在读）",
      roleEn: "本科在读",
      company: "重庆城市科技学院",
      logo: publicAsset("/resume/cqu.jpg"),
      desc: "主修新媒体概论、直播营销与运营、广告文案写作、融合新闻学、网页设计与制作、微电影创作、摄影基础等课程。曾获全国大学生文案比赛优秀奖。",
      keyProjects: [
        "全国大学生文案比赛优秀奖",
        "个人自媒体账号粉丝 10000+、点赞 400000+",
      ],
      /* 那条获奖记录配的证书:展开后「重点项目」下面会多一张小卡片,
         点一下由 About.jsx 的 Lightbox 放大看(图在 _doc/_resume.ps1 里
         从 4964x7017 / 25MB 的原图压到 1060x1498 / 264KB)。 */
      cert: {
        label: "学院奖入围证书",
        meta: "2025 秋季征集大赛 · 广告文案 · 郁美净命题",
        src: publicAsset("/resume/cert-xueyuanjiang.jpg"),
      },
      keywords: ["文案", "传媒", "创意"],
    },
  ],
  /* 常用工具 Dock(About 板块底部那一排,鼠标靠近哪个图标哪个放大)。
     图标文件都放在 public/tool-icons/ ,想换软件直接改这个数组即可。
     name 只在鼠标悬停的小气泡里显示,写全称还是简称自己定。

     图标来源(都不是我自己画的,字形和几何都取自官方):
       - photoshop / illustrator / premiere / aftereffects:Iconify logos
         集里的官方 logo 原图,配色也是官方的 ——
         PS #001E36/#31A8FF、Ai #330000/#FF9A00、
         PR 和 AE 都是 #00005B/#9999FF。
         注意:Adobe 官方就是让 Pr 和 Ae 共用这组深蓝紫、只靠字母区分的,
         不是我把它们做成一样(已用 Iconify 的官方 logo 交叉核对过)。
       - codex:OpenAI 花结字形 + 深色底。
       - jianying(剪映)/ canva(可画)/ workbuddy:App Store 官方 512px 图标。
       - codebuddy:官网 codebuddy.cn 的 logo.svg 原图。 */
  tools: [
    { name: "Photoshop", icon: "/tool-icons/photoshop.svg" },
    { name: "Illustrator", icon: "/tool-icons/illustrator.svg" },
    { name: "剪映", icon: "/tool-icons/jianying.jpg" },
    { name: "可画 Canva", icon: "/tool-icons/canva.jpg" },
    { name: "Premiere Pro", icon: "/tool-icons/premiere.svg" },
    { name: "After Effects", icon: "/tool-icons/aftereffects.svg" },
    { name: "Codex", icon: "/tool-icons/codex.svg" },
    { name: "WorkBuddy", icon: "/tool-icons/workbuddy.jpg" },
    { name: "CodeBuddy", icon: "/tool-icons/codebuddy.svg" },
  ].map((tool) => ({ ...tool, icon: publicAsset(tool.icon) })),
};
