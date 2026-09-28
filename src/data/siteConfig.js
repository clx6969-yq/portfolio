export const siteInfo = {
  nameEn: "蔡灵潇",
  nameCn: "蔡灵潇",
  shortTag: "CLX",
  titleEn: "作品集目录",
  role: "新媒体运营 / 内容创意",
  roleEn: "新媒体运营 / 内容创意",
};

/* 板块顺序。
   这个数组同时决定两件事:App.jsx 里页面从上到下渲染的顺序,以及
   Nav.jsx 顶部导航从左到右的顺序(它按同样的顺序过滤一遍)。

   顺序 = 首页「目录」那 4 张卡的顺序(overviewData.js):
   项目目录 → 个人简介 → 影视创作 → 运营作品 → IP 策划。
   两个文件要一起改,不然点卡片跳过去的位置跟看到的顺序对不上。 */
export const sections = [
  { id: "hero", label: "首页", labelCn: "首页", enabled: true },
  { id: "work", label: "项目目录", labelCn: "项目目录", enabled: true },
  { id: "about", label: "个人简介", labelCn: "个人简介", enabled: true },
  // 影视创作从原来的倒数第二提到个人简介后面(原本在内容运营、IP 联名之后)
  { id: "media", label: "影视创作", labelCn: "影视创作", enabled: true },
  { id: "brand", label: "内容运营", labelCn: "品牌与内容运营", enabled: true },
  { id: "ip", label: "IP 联名", labelCn: "IP 联名策划", enabled: true },
  /* 下面三个还是关掉的(enabled: false,两处都不会渲染),
     放最后只是为了上面 4 个启用板块的顺序一眼能看出来;
     以后要开哪个板块,直接挪到它该在的位置即可。 */
  { id: "illustration", label: "图案插画", labelCn: "图案插画", enabled: false },
  { id: "fashion", label: "服装配饰", labelCn: "服装配饰", enabled: false },
  { id: "character-build", label: "角色设计", labelCn: "角色设计", enabled: false },
  { id: "outro", label: "结尾", labelCn: "结尾", enabled: true },
];
