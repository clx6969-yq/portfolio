import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { contactInfo } from "../data/contactData";
import { siteInfo } from "../data/siteConfig";
import "./AiPager.css";

/**
 * 右下角悬浮"呼叫器" —— 造型仿照掌上游戏机/BB机
 * ------------------------------------------------------------
 * 平时是右下角一个小小的呼叫器图标,一直显示在那里;点一下展开
 * 成一个完整的"掌机"面板:上面是屏幕,下面是方向键 + A/B 按钮 +
 * SELECT/START 两个小按钮,每个按钮做的事情都很直接:
 * - A 键:打开邮箱,给我留言
 * - B 键:跳到"系统目录"板块(相当于作品总览)
 * - SELECT:跳到"个人经历"板块
 * - START:跳到最下面的联系方式板块
 * - 方向键 上/下:回到最顶部 / 跳到最下面
 * - 方向键 左/右:往上翻一屏 / 往下翻一屏
 *
 * 造型和颜色都改成完全照着你发的那张掌机图片来:透明的蓝紫色
 * 塑料外壳、四个角上的小螺丝、圆形玻璃质感的 A/B 按钮、屏幕加了
 * 像素风的装饰边框。这些视觉细节都写在同名的 .css 文件里,以后
 * 想再调颜色/形状,去改那个文件就行,不用动这个 .jsx。
 */

const MAIL_ROW = contactInfo.rows.find((row) => row.label === "邮箱");
const MAIL_HREF = MAIL_ROW?.href || "#outro";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollByScreens(direction) {
  window.scrollBy({ top: direction * window.innerHeight * 0.92, behavior: "smooth" });
}

export default function AiPager() {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    setOpen((v) => !v);
  }

  // 点完一个跳转按钮之后,顺便把面板收起来,避免挡住跳转过去的内容
  function handleJump() {
    setOpen(false);
  }

  return (
    <div className="ai-pager">
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-pager-device"
            role="dialog"
            aria-label="呼叫器快捷面板"
            initial={{ opacity: 0, y: 26, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.88 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
          >
            <span className="ai-pager-antenna" aria-hidden="true" />

            <div className="ai-pager-screen">
              <div className="ai-pager-screen-frameline" aria-hidden="true">
                <span className="frameline-corner">⌐</span>
                <span className="frameline-dots" />
                <span className="frameline-spark">✦</span>
                <span className="frameline-dots" />
                <span className="frameline-corner">¬</span>
              </div>

              <div className="ai-pager-screen-topline">
                <span className="ai-pager-live-dot" aria-hidden="true" />
                {siteInfo.nameEn}.SYS
              </div>
              <div className="ai-pager-screen-title">联系 · {siteInfo.nameCn}</div>
              {/* 原来这里还有一行「按一个键,跳到对应板块」的操作提示,
                  按「页面上不要出现指导用户怎么操作的提示文案」的要求去掉。 */}

              <div className="ai-pager-screen-pillrow" aria-hidden="true">
                <span className="frameline-spark">☆</span>
                <span className="ai-pager-screen-pill">NO. 01</span>
                <span className="frameline-spark">☆</span>
              </div>

              <div className="ai-pager-screen-frameline" aria-hidden="true">
                <span className="frameline-dots frameline-dots--full" />
              </div>

              <div className="ai-pager-screen-bottomline">
                <span className="ai-pager-heart" aria-hidden="true">
                  ♥
                </span>
                <span className="ai-pager-battery" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>

            <span className="ai-pager-speaker" aria-hidden="true" />

            <div className="ai-pager-body">
              <div className="ai-pager-dpad" role="group" aria-label="翻页方向键">
                <button
                  type="button"
                  className="dpad-key dpad-key--up"
                  onClick={() => {
                    handleJump();
                    scrollToTop();
                  }}
                  aria-label="回到最顶部"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="dpad-key dpad-key--left"
                  onClick={() => {
                    scrollByScreens(-1);
                  }}
                  aria-label="往上翻一屏"
                >
                  ◀
                </button>
                <span className="dpad-key dpad-key--center" aria-hidden="true" />
                <button
                  type="button"
                  className="dpad-key dpad-key--right"
                  onClick={() => {
                    scrollByScreens(1);
                  }}
                  aria-label="往下翻一屏"
                >
                  ▶
                </button>
                <a href="#outro" className="dpad-key dpad-key--down" onClick={handleJump} aria-label="跳到最下面">
                  ▼
                </a>
              </div>

              <div className="ai-pager-ab">
                <a href={MAIL_HREF} className="ab-key ab-key--a" onClick={handleJump}>
                  <span className="ab-key-mark">A</span>
                  <span className="ab-key-label">留言</span>
                </a>
                <a href="#work" className="ab-key ab-key--b" onClick={handleJump}>
                  <span className="ab-key-mark">B</span>
                  <span className="ab-key-label">作品</span>
                </a>
              </div>
            </div>

            <div className="ai-pager-meta">
              <a href="#about" className="meta-key" onClick={handleJump}>
                <span className="meta-key-mark">SELECT</span>
                <span className="meta-key-label">关于我</span>
              </a>
              <a href="#outro" className="meta-key" onClick={handleJump}>
                <span className="meta-key-mark">START</span>
                <span className="meta-key-label">联系我</span>
              </a>
            </div>

            <button type="button" className="ai-pager-close" onClick={handleToggle} aria-label="收起呼叫器">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className={`ai-pager-bubble${open ? " is-open" : ""}`}
        onClick={handleToggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
        aria-expanded={open}
        aria-label={open ? "收起呼叫器" : "打开呼叫器"}
      >
        <span className="ai-pager-bubble-ring" aria-hidden="true" />
        <span className="ai-pager-bubble-antenna" aria-hidden="true" />
        <span className="ai-pager-bubble-face" aria-hidden="true">
          <span className="ai-pager-bubble-screen" />
          <span className="ai-pager-bubble-btn ai-pager-bubble-btn--a" />
          <span className="ai-pager-bubble-btn ai-pager-bubble-btn--b" />
        </span>
        <span className="ai-pager-bubble-label mono-label">联系 · {siteInfo.shortTag}</span>
      </motion.button>
    </div>
  );
}
