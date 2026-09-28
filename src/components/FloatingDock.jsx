import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import "./FloatingDock.css";

/**
 * 浮动 Dock —— 鼠标靠近哪个图标,哪个图标就放大(像 Mac 电脑底部的程序坞)
 * ------------------------------------------------------------
 * 这是参照 Aceternity UI 的 "Floating Dock" 组件效果自己实现的一版
 * (直接用 npx 装它需要联网装包,而且它是给 Tailwind 项目用的组件库,
 * 跟咱们这个项目的样式系统不搭;所以用同样的交互原理——鼠标越靠近
 * 图标越大——重新做了一份,配色跟网站保持一致,不需要额外装任何东西)。
 *
 * 图标现在用的是你截图里真实的 App 图标图片(存在
 * profileData.js 的 tools 数组里)。去掉了外面那一圈容器背景和
 * 点击常亮的效果,现在就是单纯"图标一个个分散排开,鼠标靠近哪个
 * 哪个就放大"。
 *
 * 想换里面的软件/图标:去 src/data/profileData.js 里改 tools 数组,
 * 每一项是 { name, icon } ,icon 填图片路径。
 */

function DockIcon({ mouseX, item }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  // 鼠标位置到这个图标中心的距离,距离越近,尺寸越大
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(distance, [-140, 0, 140], [44, 74, 44]);
  const size = useSpring(sizeSync, { mass: 0.15, stiffness: 220, damping: 16 });

  return (
    <motion.div
      ref={ref}
      className="dock-icon"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="dock-tooltip mono-label"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            {item.name}
          </motion.div>
        )}
      </AnimatePresence>
      <img className="dock-icon-img" src={item.icon} alt={item.name} draggable="false" />
    </motion.div>
  );
}

export default function FloatingDock({ items }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className="floating-dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {items.map((item) => (
        <DockIcon key={item.name} mouseX={mouseX} item={item} />
      ))}
    </div>
  );
}
