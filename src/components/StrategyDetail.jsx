import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IpDeck from "./IpDeck";
import "./StrategyDetail.css";

/**
 * IP 联名策略详情弹窗
 * ------------------------------------------------------------
 * 给"IP 联名策划"板块里的「跨界联名总策划」那张卡用的,点开看到
 * 完整原方案。其它两张卡(周边与形象、主视觉)走 PosterGallery
 * 版式墙弹窗。
 *
 * 内容从"重写的文字版策略"换成了 IpDeck —— 直接把作者那份 PPT 的
 * 23 页按原比例铺出来。文字总结一定会丢东西(数据、排期、平台选择
 * 都在原页里),引用原文反而更可靠。
 *
 * onZoom:点某页要放大,但灯箱不能挂在这块面板里 —— 面板有 transform
 * 和 overflow: hidden,会把 position: fixed 的灯箱裁掉。所以一路透传给
 * IpSlider,由它在最外层渲染。
 *
 * 结构:
 *   ┌─ 背景层 ─┐
 *   │  ↓          │ ← 点击空白关掉
 *   │ ┌─ 面板 ─┐ │
 *   │ │ 头部   │ │ ← 项目序号 + 标题 + 关闭按钮
 *   │ ├────────┤ │
 *   │ │ IpDeck   │
 *   │ │ 滚动内容 │ │
 *   │ └────────┘ │
 *   └────────┘
 */
export default function StrategyDetail({ item, onClose, onZoom }) {
  useEffect(() => {
    if (!item) return;
    // 锁定背景滚动 —— 弹窗里内容多,不希望背后也跟着滚
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="sd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="sd-panel"
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部:项目序号 + 标题 + 关闭 */}
            <header className="sd-header">
              <div className="sd-header-meta">
                <span className="sd-header-eyebrow mono-label">
                  {item.index} — IP 联名策略
                </span>
                <h3 className="sd-header-title">
                  {item.title}
                  {item.titleCn && <span className="cjk">{item.titleCn}</span>}
                </h3>
                {item.tag && (
                  <p className="sd-header-tag mono-label">{item.tag}</p>
                )}
              </div>
              <button
                type="button"
                className="sd-close"
                onClick={onClose}
                aria-label="关闭详情"
              >
                ✕
              </button>
            </header>

            {/* 滚动主体:原方案的 23 页 PPT,按页铺开 */}
            <div className="sd-body">
              <IpDeck pages={item.deck} onZoom={onZoom} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}