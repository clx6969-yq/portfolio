import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { illustrations } from "../data/illustrationData";
import AccordionGallery from "./AccordionGallery";
import "./IllustrationMasonry.css";

/**
 * 图案 & 插画绘制设计 —— 瀑布流模块
 * ------------------------------------------------------------
 * 这个模块被放进一个"固定高度的盒子"里(.illustration-stage),
 * 里面自己滚动,不会把整个网页撑得很长——不管你放多少张图案,
 * 用户往下滚,过了这一屏就是下一个模块,不用一直刷图案才能刷到别的内容。
 *
 * 两种状态:
 * 1) 瀑布流(grid)—— 默认状态,每张图下面固定显示英文+中文名字,
 *    点击任意一张图进入详情。
 * 2) 详情(detail)—— 左边是竖向缩略图条(可以上下滚动切换),
 *    中间是大图,右边是"MORE VIEWS"——同一个作品文件夹里其余的
 *    参考图/延展图(数量多的话可以在这一栏单独往下滚)。
 *    左上角"返回"按钮可以回到瀑布流。
 */
export default function IllustrationMasonry() {
  const [view, setView] = useState("grid"); // "grid" | "detail"
  const [activeIndex, setActiveIndex] = useState(0);
  // 中间大图默认显示这个作品自己的主图;点了右边"MORE VIEWS"里的
  // 某一张参考图之后,这里记一下"现在中间显示的其实是第几张参考图"
  // (null 就是显示主图本身)。
  const [mainExtraIndex, setMainExtraIndex] = useState(null);

  const active = illustrations[activeIndex];
  const mainImageSrc =
    mainExtraIndex !== null && active.extraImages?.[mainExtraIndex]
      ? active.extraImages[mainExtraIndex]
      : active.image;

  function openDetail(index) {
    setActiveIndex(index);
    setMainExtraIndex(null);
    setView("detail");
  }

  function selectThumb(index) {
    setActiveIndex(index);
    setMainExtraIndex(null);
  }

  return (
    <section id="illustration" className="section">
      <div className="container">
        <div className="section-eyebrow">
          <span className="dot" />
          05 — ILLUSTRATION
        </div>
        <h2 className="section-title">
          Illustration
          <span className="cjk">图案 &amp; 插画绘制设计 · 点击图片查看详情</span>
        </h2>

        <div className="illustration-stage glass">
          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key="grid"
                className="illustration-grid-scroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="masonry">
                  {illustrations.map((item, i) => (
                    <motion.button
                      key={item.id}
                      className="masonry-item"
                      onClick={() => openDetail(i)}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.95, y: -2 }}
                      transition={{ type: "spring", stiffness: 340, damping: 16 }}
                    >
                      <span className="masonry-thumb">
                        <img src={item.image} alt={item.title} loading="lazy" />
                      </span>
                      <span className="masonry-caption">
                        <span className="masonry-caption-en mono-label">{item.titleEn}</span>
                        <span className="masonry-caption-cjk">{item.title}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                className="illustration-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.button
                  className="illustration-back-btn"
                  onClick={() => setView("grid")}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ← 返回
                </motion.button>

                <div className="illustration-thumbrail">
                  {illustrations.map((item, i) => (
                    <button
                      key={item.id}
                      className={`illustration-thumb ${i === activeIndex ? "is-active" : ""}`}
                      onClick={() => selectThumb(i)}
                    >
                      <img src={item.image} alt={item.title} loading="lazy" />
                    </button>
                  ))}
                </div>

                <div className="illustration-main">
                  {/* key 里带上 mainExtraIndex,这样点右边任意一张
                      参考图之后,中间大图会跟着切换过去、有一个
                      淡入放大的小动效,而不是直接生硬地跳一下。 */}
                  <motion.img
                    key={`${active.id}-${mainExtraIndex ?? "main"}`}
                    src={mainImageSrc}
                    alt={active.title}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                  <div className="illustration-main-caption">
                    <span className="illustration-main-caption-cjk">{active.title}</span>
                    <span className="illustration-main-caption-en mono-label">{active.titleEn}</span>
                  </div>
                </div>

                <div className="illustration-side">
                  <span className="mono-label illustration-side-title">MORE VIEWS</span>
                  {active.extraImages && active.extraImages.length > 0 ? (
                    <div className="illustration-accordion-wrap">
                      <AccordionGallery
                        key={active.id}
                        items={active.extraImages.map((src) => ({ image: src }))}
                        orientation="vertical"
                        defaultIndex={0}
                        showLabels={false}
                        grayscale={false}
                        accentColor="var(--accent)"
                        overlayColor="var(--bg)"
                        expandRatio={0.46}
                        radius={10}
                        gap={8}
                        onSelect={(i) => setMainExtraIndex(i)}
                      />
                    </div>
                  ) : (
                    <div className="illustration-side-empty mono-label">暂无更多参考图</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
