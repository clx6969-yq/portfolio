import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./FashionDetail.css";

/**
 * 服装作品详情页
 * ------------------------------------------------------------
 * 点开"女装"(以后男装/童装也会用到)里的某个项目,弹出这个详情页:
 * 左边竖着排一列缩略图(封面 + 每一张造型图),右边是大图 + 左右箭头切换,
 * 点哪张小图大图就跳到哪张,当前这张缩略图会亮起来。
 *
 * item 需要有: title / titleCn / tag / cover / images: [{ src, label }]
 */
export default function FashionDetail({ item, onClose }) {
  const [index, setIndex] = useState(0);

  // 每次换一个新项目打开,都从封面开始看
  useEffect(() => {
    if (item) setIndex(0);
  }, [item]);

  // 把封面也算进这一组图片里,放在最前面
  const gallery = item ? [{ src: item.cover, label: "COVER" }, ...item.images] : [];

  useEffect(() => {
    if (!item) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + gallery.length) % gallery.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % gallery.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, gallery.length]);

  if (!item) return null;

  const active = gallery[index] || gallery[0];
  const multi = gallery.length > 1;

  function go(dir) {
    setIndex((i) => (i + dir + gallery.length) % gallery.length);
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fashion-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="fashion-detail"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="fashion-detail-close" onClick={onClose} aria-label="关闭详情页">
              ✕
            </button>

            <div className="fashion-detail-inner">
              <div className="fashion-detail-side">
                <div className="fashion-detail-head">
                  <span className="mono-label fashion-detail-plate">
                    PLATE {String(index + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                  </span>
                  <h3 className="fashion-detail-title">
                    {item.title}
                    {item.titleCn && <span className="cjk">{item.titleCn}</span>}
                  </h3>
                  {item.tag && <p className="mono-label fashion-detail-tag">{item.tag}</p>}
                </div>

                {multi && (
                  <div className="fashion-detail-strip">
                    {gallery.map((img, i) => (
                      <motion.button
                        key={`${img.label}-${i}`}
                        type="button"
                        className={`fashion-detail-thumb${i === index ? " is-active" : ""}`}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIndex(i)}
                      >
                        <img src={img.src} alt={img.label} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {multi && <span className="fashion-detail-rail" aria-hidden="true" />}

              <div className="fashion-detail-main">
                <span className="frame-corner tl" />
                <span className="frame-corner tr" />
                <span className="frame-corner bl" />
                <span className="frame-corner br" />
                <img key={active.src} src={active.src} alt={`${item.titleCn || item.title} ${active.label}`} />
                <span className="character-view-tag mono-label fashion-detail-view-tag">{active.label}</span>

                {multi && (
                  <>
                    <button
                      type="button"
                      className="fashion-detail-arrow is-left"
                      onClick={() => go(-1)}
                      aria-label="上一张"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="fashion-detail-arrow is-right"
                      onClick={() => go(1)}
                      aria-label="下一张"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
