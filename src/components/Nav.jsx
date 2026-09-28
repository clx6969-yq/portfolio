import { motion } from "framer-motion";
import { siteInfo, sections } from "../data/siteConfig";
import { publicAsset } from "../utils/publicAsset";
import "./Nav.css";

/**
 * 顶部导航栏
 * ------------------------------------------------------------
 * 固定在页面顶部,玻璃质感背景。点击链接会平滑滚动到对应模块。
 *
 * 之前依赖的是 `html { scroll-behavior: smooth }` + 原生锚点跳转,
 * 但那条 css 会被 `window.scrollTo` 一并继承——结果就是从开屏切到
 * 首页时也会被强制按平滑动画执行,出现"卡在中间"的现象。现在改
 * 在这里用 JS 显式调 scrollIntoView,smooth 由我们控制,不再被
 * 全局规则误伤。
 */
function handleAnchorJump(e, targetId) {
  e.preventDefault();
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Nav() {
  const navSections = sections.filter(
    (s) => s.enabled && s.id !== "hero" && s.id !== "outro"
  );

  return (
    <header className="nav-bar glass-strong">
      <div className="nav-inner">
        <a
          href="#hero"
          className="nav-logo"
          onClick={(e) => handleAnchorJump(e, "hero")}
        >
          {/* 原来这里是一个蓝底 + 白色 "CLX" 的文字方块,现已换成头像
              插画的方形特写(public/placeholders/site-icon.png:从"插画2"
              原图 1086×1448 上居中裁出 620×620 的头部特写后缩到 256×256)。
              走 publicAsset() 拼路径,子路径部署也不会失效。
              注意:导航栏本身是 <a>,这里用 img 而不是背景图,alt 用姓名,
              图片没加载出来时读屏也能读到,不会变成纯装饰。 */}
          <img
            className="nav-logo-mark"
            src={publicAsset("/placeholders/site-icon.png")}
            alt={siteInfo.nameCn}
          />
          <span className="nav-logo-text mono-label">{siteInfo.titleEn}</span>
        </a>

        <nav className="nav-links">
          {navSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="nav-link mono-label"
              onClick={(e) => handleAnchorJump(e, s.id)}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <motion.a
            href="#outro"
            className="btn btn-solid nav-contact"
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
            onClick={(e) => handleAnchorJump(e, "outro")}
          >
            联系我
            <span aria-hidden>↗</span>
          </motion.a>
        </div>
      </div>
    </header>
  );
}
