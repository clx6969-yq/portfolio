// 联系方式 —— 改一处就够,所有用到的地方(Hero 副文案、结尾卡 / CTA)
// 都会自动跟着变。value 是给卡片展示用的明文,href 是点击真实跳转的
// 协议,没装对应客户端时浏览器会自己兜底(不会崩)。
const links = [
  { label: "邮箱", value: "2499844276@qq.com", href: "mailto:2499844276@qq.com" },
  // 手机号:电话 / 微信共用一个号,tel: 是最稳的跳转(没装微信的人点微信
  // 这条会落到"找不到应用"或无反应,所以微信那条用 weixin:// 协议;
  // 装了微信的设备会直接弹微信,没装的桌面浏览器会走兜底不影响页面)。
  { label: "电话", value: "15736554644", href: "tel:15736554644" },
  { label: "微信", value: "15736554644", href: "weixin://" },
];

const downloads = [];

export const contactInfo = {
  headlineEn: "让我们开始",
  headlineEn2: "一段新的合作。",
  headlineCn: "一起做点有意思的内容。",
  // 副文案不再特指"邮件",因为现在多了电话 / 微信两条。
  subCn:
    "正在寻找新媒体运营 / 内容创意方向的实习与合作机会，欢迎通过邮箱、电话或微信联系我。",
  links,
  rows: [...links, ...downloads],
  downloads,
};