import { AnimatePresence, motion } from "framer-motion";
import "./Lightbox.css";

/**
 * 通用图片放大灯箱
 * ------------------------------------------------------------
 * 谁都可以用:传入 image(图片地址)、title(标题,可选)、
 * onClose(点击关闭时触发的函数)。image 为空时不显示。
 */
export default function Lightbox({ image, title, onClose }) {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="lightbox-inner"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={image} alt={title || ""} />
            {title && <div className="lightbox-title mono-label">{title}</div>}
            <button className="lightbox-close" onClick={onClose} aria-label="关闭">
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
