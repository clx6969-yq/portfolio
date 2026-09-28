import { useState } from "react";
import { motion } from "framer-motion";
import { fashionCategories } from "../data/fashionData";
import FashionCardCarousel from "./FashionCardCarousel";
import FashionDetail from "./FashionDetail";
import "./FashionTabs.css";

/**
 * 服装与配饰设计 —— 男装/女装/童装/配件/T恤图案
 * ------------------------------------------------------------
 * 使用横向立体卡片画廊：中央作品完整展示，左右邻近作品后退、
 * 缩小并带轻微透视。侧卡负责切换，中央卡点开原有详情页。
 */
export default function FashionTabs() {
  const [activeId, setActiveId] = useState(fashionCategories[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(null);
  const activeCategory = fashionCategories.find((c) => c.id === activeId);

  function changeCategory(categoryId) {
    setActiveId(categoryId);
    setActiveIndex(0);
    setZoomed(null);
  }

  return (
    <section id="fashion" className="section">
      <div className="container">
        <div className="section-eyebrow">
          <span className="dot" />
          07 — FASHION
        </div>
        <h2 className="section-title">
          Fashion
          <span className="cjk">服装与配饰设计 · 男装 / 女装 / 童装 / 配件 / T恤图案</span>
        </h2>

        <div className="fashion-tabs">
          {fashionCategories.map((c) => (
            <motion.button
              key={c.id}
              className={`chip fashion-tab ${c.id === activeId ? "is-active" : ""}`}
              onClick={() => changeCategory(c.id)}
              aria-pressed={c.id === activeId}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              {c.label}
              <span className="fashion-tab-en"> / {c.labelEn}</span>
            </motion.button>
          ))}
        </div>

        <FashionCardCarousel
          key={activeId}
          items={activeCategory.items}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onOpen={setZoomed}
          categoryLabel={activeCategory.label}
          categoryLabelEn={activeCategory.labelEn}
        />
      </div>

      <FashionDetail item={zoomed} onClose={() => setZoomed(null)} />
    </section>
  );
}
