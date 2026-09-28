import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./PosterGallery.css";

/**
 * IP 联名 —— 图册弹窗(混合比例版)
 * ------------------------------------------------------------
 * 书架上 02「联名周边与 IP 形象」、03「联名宣传主视觉」点开后走这个弹窗。
 *
 * 为什么不用 FashionDetail 那个"左缩略图 + 右大图"的画廊:
 *   它右边是写死的 3:4 硬框(object-fit: contain),而这批真实物料的比例
 *   从 0.67(竖版海报)横跨到 1.5(周边展示板),塞进 3:4 框里要么上下
 *   一大条白边、要么把海报裁掉一半;而且框高 min(70vh,720px)、左右只剩
 *   四百多像素宽,横版海报根本铺不开。
 *   所以这里改成"版式墙":每张图按自己的比例排,宽图占满、竖图自然变高,
 *   点一下交给 Lightbox 放大看细节。FashionDetail 仍然留给服装板块用。
 *
 * item 需要:index / kicker / title / titleCn / tag / desc / images[{ src, label }]
 * onZoom:把被点的图交给外面的 Lightbox(放在 IpSlider 顶层,避免被弹窗的
 *         transform / overflow 裁掉)。
 */
export default function PosterGallery({ item, onClose, onZoom }) {
  const items = item?.images || [];

  // 锁定背景滚动:弹窗里内容多,背后跟着滚很难受
  useEffect(() => {
    if (!item) return;
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

  // 开着灯箱时按 Esc 会先关灯箱、弹窗留着 —— 那层判断在 IpSlider 的
  // onClose 里(它同时管着弹窗和灯箱两个 state,这里拿不到)。

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="pg-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="pg-panel"
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="pg-header">
              <div className="pg-header-meta">
                <span className="mono-label pg-header-eyebrow">
                  {item.index} — {item.kicker || "IP 联名"}
                </span>
                <h3 className="pg-header-title">
                  {item.title}
                  {item.titleCn && <span className="cjk">{item.titleCn}</span>}
                </h3>
                {item.tag && <p className="mono-label pg-header-tag">{item.tag}</p>}
              </div>
              <button type="button" className="pg-close" onClick={onClose} aria-label="关闭详情">
                ✕
              </button>
            </header>

            <div className="pg-body">
              {item.desc && <p className="pg-lead">{item.desc}</p>}

              <ul className="pg-grid">
                {items.map((img, i) => (
                  <li key={img.src} className={`pg-cell${img.wide ? " pg-cell--wide" : ""}`}>
                    <button
                      type="button"
                      className="pg-plate"
                      onClick={() => onZoom?.(img)}
                      aria-label={`${item.titleCn || item.title} ${img.label}`}
                    >
                      <span className="pg-plate-media">
                        <img src={img.src} alt={img.label || item.titleCn} loading="lazy" />
                      </span>
                      <span className="pg-plate-meta">
                        <span className="mono-label pg-plate-index">{String(i + 1).padStart(2, "0")}</span>
                        <span className="mono-label pg-plate-label">{img.label}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
