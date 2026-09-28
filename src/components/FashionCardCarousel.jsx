import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import {
  getCarouselSlots,
  moveCarouselIndex,
  wrapCarouselIndex,
} from "../utils/fashionCarousel";
import { deferredImageProps } from "../utils/mediaPriority";
import "./FashionCardCarousel.css";

const SWIPE_DISTANCE = 46;
const SWIPE_VELOCITY = 520;
const WHEEL_THRESHOLD = 32;
const WHEEL_COOLDOWN = 420;

function slotMotion(offset, reduceMotion) {
  const distance = Math.abs(offset);
  const x = offset === 0 ? "0%" : `${Math.sign(offset) * (distance === 1 ? 72 : 132)}%`;

  return {
    x,
    y: distance === 0 ? 0 : distance === 1 ? 7 : 18,
    z: distance === 0 ? 80 : distance === 1 ? -30 : -120,
    scale: distance === 0 ? 1 : distance === 1 ? 0.9 : 0.78,
    rotateY: reduceMotion ? 0 : offset * -7,
    opacity: distance === 0 ? 1 : distance === 1 ? 0.68 : 0.28,
    filter: distance === 0 ? "brightness(1) saturate(1)" : "brightness(0.48) saturate(0.58)",
  };
}

export default function FashionCardCarousel({
  items,
  activeIndex,
  onActiveIndexChange,
  onOpen,
  categoryLabel,
  categoryLabelEn,
}) {
  const reduceMotion = useReducedMotion();
  const lastWheelAt = useRef(0);
  const suppressClick = useRef(false);
  const total = items.length;
  const safeActiveIndex = wrapCarouselIndex(activeIndex, total);
  const activeItem = items[safeActiveIndex];
  const slots = useMemo(
    () => getCarouselSlots(items, safeActiveIndex, 2),
    [items, safeActiveIndex]
  );

  function go(step) {
    if (total < 2) return;
    onActiveIndexChange(moveCarouselIndex(safeActiveIndex, step, total));
  }

  function selectCard(index, offset) {
    if (suppressClick.current) return;
    if (offset === 0) {
      onOpen(items[index]);
      return;
    }
    onActiveIndexChange(index);
  }

  function handleDragEnd(_, info) {
    const isSwipe = Math.abs(info.offset.x) >= SWIPE_DISTANCE || Math.abs(info.velocity.x) >= SWIPE_VELOCITY;
    if (!isSwipe) return;

    suppressClick.current = true;
    go(info.offset.x < 0 || info.velocity.x < -SWIPE_VELOCITY ? 1 : -1);
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 80);
  }

  function handleWheel(event) {
    const movement = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const now = Date.now();
    if (Math.abs(movement) < WHEEL_THRESHOLD || now - lastWheelAt.current < WHEEL_COOLDOWN) return;

    lastWheelAt.current = now;
    go(movement > 0 ? 1 : -1);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
    if ((event.key === "Enter" || event.key === " ") && activeItem) {
      event.preventDefault();
      onOpen(activeItem);
    }
  }

  if (!activeItem) return null;

  return (
    <div
      className="fashion-card-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${categoryLabel}作品轮播`}
    >
      <div
        className="fashion-card-stage"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        aria-label="左右方向键、拖动或滚轮切换作品，回车打开当前作品"
      >
        <div className="fashion-card-stage__halo" aria-hidden="true" />
        <div className="fashion-card-stage__perspective">
          <AnimatePresence initial={false} mode="popLayout">
            {slots.map(({ item, index, offset }) => {
              const isActive = offset === 0;
              const number = String(index + 1).padStart(2, "0");

              return (
                <motion.button
                  type="button"
                  key={item.id}
                  className={`fashion-showcase-card${isActive ? " is-active" : ""}`}
                  style={{ zIndex: 10 - Math.abs(offset) }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.72 }}
                  animate={slotMotion(offset, reduceMotion)}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.72 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 250, damping: 28, mass: 0.82 }
                  }
                  drag={isActive && total > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.14}
                  onDragEnd={handleDragEnd}
                  onClick={() => selectCard(index, offset)}
                  aria-label={
                    isActive
                      ? `打开第 ${index + 1} 件作品：${item.titleCn || item.title}`
                      : `切换到第 ${index + 1} 件作品：${item.titleCn || item.title}`
                  }
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isActive ? 0 : -1}
                >
                  <span className="fashion-showcase-card__topline mono-label">
                    <span>LOOK / {number}</span>
                    <span>{categoryLabelEn}</span>
                  </span>

                  <span className="fashion-showcase-card__image-frame">
                    <img
                      className={item.coverFit === "cover" ? "is-cropped" : undefined}
                      src={item.cover}
                      alt={item.titleCn || item.title}
                      draggable="false"
                      {...deferredImageProps}
                      style={item.coverPosition ? { objectPosition: item.coverPosition } : undefined}
                    />
                  </span>

                  <span className="fashion-showcase-card__caption">
                    <span className="fashion-showcase-card__title">{item.title}</span>
                    {item.titleCn && <span className="fashion-showcase-card__title-cn">{item.titleCn}</span>}
                    <span className="fashion-showcase-card__action mono-label">
                      {isActive ? "VIEW PROJECT  ↗" : "SELECT"}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="fashion-carousel-controls">
        <motion.button
          type="button"
          className="fashion-carousel-step"
          onClick={() => go(-1)}
          whileTap={{ scale: 0.96 }}
          aria-label="上一件作品"
        >
          <span aria-hidden="true">←</span>
          PREVIOUS
        </motion.button>

        <div className="fashion-carousel-status" aria-live="polite" aria-atomic="true">
          <span className="fashion-carousel-status__count">
            {String(safeActiveIndex + 1).padStart(2, "0")}
            <span> / {String(total).padStart(2, "0")}</span>
          </span>
          <span className="fashion-carousel-status__hint mono-label">DRAG · SCROLL · EXPLORE</span>
        </div>

        <motion.button
          type="button"
          className="fashion-carousel-step"
          onClick={() => go(1)}
          whileTap={{ scale: 0.96 }}
          aria-label="下一件作品"
        >
          NEXT
          <span aria-hidden="true">→</span>
        </motion.button>
      </div>
    </div>
  );
}
