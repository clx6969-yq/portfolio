import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { deferredImageProps } from "../utils/mediaPriority";
import { publicAsset } from "../utils/publicAsset";

import "./AccordionGallery.css";

const DEFAULT_ITEMS = [
  { image: publicAsset("/placeholders/landscape-01.svg"), label: "Project 01", link: "#" },
  { image: publicAsset("/placeholders/landscape-02.svg"), label: "Project 02", link: "#" },
  { image: publicAsset("/placeholders/portrait-01.svg"), label: "Project 03", link: "#" },
  { image: publicAsset("/placeholders/portrait-02.svg"), label: "Project 04", link: "#" },
];

/**
 * AccordionGallery —— 来自 React Bits 的"手风琴画廊"组件
 * ------------------------------------------------------------
 * 一排(或一竖列)图片,鼠标移到哪张,哪张就展开变大、恢复彩色,
 * 其余的收窄、变灰、带一点透视旋转。orientation="vertical" 时
 * 是竖着排列、上下展开,用在详情页右侧"MORE VIEWS"参考图区域。
 *
 * 这是从 TypeScript 版本转成普通 JS/JSX 的版本,逻辑完全一致,
 * 只是去掉了类型标注,方便本项目(没有用 TypeScript)直接使用。
 */
const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = true,
  // 竖排书脊标题:不管当前是不是展开的那一本,都一直显示在
  // 每一条"书脊"顶部的竖排小标题(像真的书脊上印着的书名)。
  // 默认关闭,不影响其他已经在用这个组件的地方(比如插画板块)。
  spineLabels = false,
  className = "",
  // 点击某一张时,除了自己在这一条里展开变大,还会调用这个回调,
  // 把被点的那张图告诉外面的父组件——用在"点右边缩略图,中间大图
  // 跟着换成这张"的场景。
  onSelect,
}) => {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const barRefs = useRef([]);
  const textRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === "vertical";
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const applyLayout = useCallback(
    (animate) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              "--ag-gray": gray,
              "--ag-dim": isActive ? 0 : 0.35,
              duration: dur,
              ease,
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [active, count, expandRatio, duration, ease, vertical, tilt, parallax, grayscale, showLabels, stagger, prefersReduced]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i) => {
    if (trigger === "hover") setActive(i);
  };

  const handleClick = (i, e) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
    onSelect?.(i, items[i]);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  const rootStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      role="list"
      aria-label="Image accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = item.link ? "a" : "div";
        return (
          <Tag
            key={i}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? "true" : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
              >
                <img src={item.image} alt={item.alt || item.label || ""} draggable={false} {...deferredImageProps} />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {spineLabels && (item.spineIndex || item.spineTitleEn || item.label) && (
              <span className="ag-panel__spine-label" aria-hidden="true">
                {/* 编号单独占一整行,横排、字号放大,压在最上面 */}
                {item.spineIndex && <span className="ag-panel__spine-index">{item.spineIndex}</span>}
                {/* 下面才是左右两列:中文书名一列、英文书名一列 */}
                <span className="ag-panel__spine-cols">
                  <span className="ag-panel__spine-col ag-panel__spine-col--cn">
                    {item.spineTitleCn && <span className="ag-panel__spine-cn">{item.spineTitleCn}</span>}
                  </span>
                  <span className="ag-panel__spine-col ag-panel__spine-col--en">
                    <span className="ag-panel__spine-en">{item.spineTitleEn || item.label}</span>
                  </span>
                </span>
              </span>
            )}
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
