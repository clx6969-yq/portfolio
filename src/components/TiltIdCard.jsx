import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { deferredImageProps } from "../utils/mediaPriority";
import "./TiltIdCard.css";

/**
 * 工卡照片的"彗星卡片"交互效果
 * ------------------------------------------------------------
 * 参考 aceternity 的 comet-card 效果:鼠标移到卡片上时,卡片会跟着
 * 鼠标位置做 3D 倾斜,同时有一道高光/彗星光斑扫过卡片表面。
 * 这里没有装 aceternity 那个组件库(项目用的是纯 CSS + framer-motion,
 * 没有接入 shadcn/Tailwind 那一套),所以是照着同样的效果手写实现的。
 *
 * 小细节:工卡图片本身是一张带透明背景、稍微倾斜摆放的 PNG(不是一个
 * 方方正正的矩形),所以高光和彗星光斑都用同一张图当"遮罩"
 * (mask-image),这样光斑只会出现在卡片实际的形状上,不会亮到
 * 图片四周的透明区域里。
 */
export default function TiltIdCard({ src, alt }) {
  const wrapRef = useRef(null);

  const rotateX = useSpring(0, { stiffness: 220, damping: 18, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 18, mass: 0.6 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const glareBackground = useTransform([glareX, glareY], ([gx, gy]) =>
    `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.45), rgba(255,255,255,0) 45%)`
  );

  const maskStyle = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
  };

  function handleMouseMove(e) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const maxTilt = 13;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set(-(py - 0.5) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      className="tilt-card-wrap"
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="tilt-card-inner"
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.035 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <img className="profile-id-card-img" src={src} alt={alt} draggable={false} {...deferredImageProps} />
        <motion.div
          className="tilt-card-glare"
          style={{ ...maskStyle, background: glareBackground }}
          aria-hidden="true"
        />
        <div className="tilt-card-comet" style={maskStyle} aria-hidden="true" />
      </motion.div>
    </div>
  );
}
