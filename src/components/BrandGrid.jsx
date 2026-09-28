import { useEffect, useRef, useState } from "react";
import { brandProjects } from "../data/brandProjects";
import { deferredImageProps } from "../utils/mediaPriority";
import "./BrandGrid.css";

/**
 * 品牌与内容运营 —— 档案式浏览板块
 * ------------------------------------------------------------
 * 你说之前那版排版丑,参考了一个"档案浏览器"的样子重做:左边是一列
 * 可以往下滑的档案列表,每一条是缩略图 + 标题;右边直接显示当前选中
 * 这份企划的内容(整份企划拼起来的长图,往下滚动看),不用再点开
 * 弹窗了。右上角还有一对"上一份/下一份"按钮,不用回到左边列表也能
 * 一份一份往后翻。
 *
 * 公众号那一条里有六篇推文:顶栏下面多一条胶囊当 tab,点哪一篇右栏
 * 就地换成那一篇的整篇长图(不是跳浏览器),要跳原文得点「阅读全文」。
 *
 * 以后企划还会一直加,左边这列表是自己滚动的,不会把整个板块撑高。
 */

export default function BrandGrid() {
  const [selectedId, setSelectedId] = useState(brandProjects[0]?.id);
  // 右栏正在看哪一篇(只有"一条企划收了多篇原文"时才用得上)。
  const [activeLink, setActiveLink] = useState(0);
  const bodyRef = useRef(null);
  const activeRowRef = useRef(null);

  const selectedIndex = Math.max(
    brandProjects.findIndex((p) => p.id === selectedId),
    0
  );
  const selected = brandProjects[selectedIndex] || brandProjects[0];

  const links = selected?.links || [];
  // 带整篇长图的链接 = 可以在右栏就地预览的那几篇(现在只有公众号)。
  const previews = links.filter((link) => link.longImage);
  const activeIndex = Math.min(activeLink, Math.max(previews.length - 1, 0));
  const activePreview = previews[activeIndex] || null;
  // 跳转按钮:有预览时指当前这一篇的原文,没有预览时就是企划自己的入口(官网)。
  const jumpLink = activePreview || links[0] || null;
  const shownImage = activePreview?.longImage || selected.longImage;

  // 换一份企划、换一篇的时候,右边内容区滚动条自动回到顶部,不会停在
  // 上一份/上一篇滚到一半的地方。
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [selectedId, activeIndex]);

  // 左边列表跟着选中项自动滚动到可见范围内(主要是用"上一份/下一份"
  // 按钮翻页,或者以后档案很多的时候用得上)。
  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  function goTo(delta) {
    const next = (selectedIndex + delta + brandProjects.length) % brandProjects.length;
    setSelectedId(brandProjects[next].id);
  }

  if (!selected) return null;

  return (
    <section id="brand" className="section">
      <div className="container">
        <div className="section-eyebrow">
          <span className="dot" />
          05 — 品牌与内容运营
        </div>
        <h2 className="section-title">
          品牌与内容运营
          {/* 这行只列工作类型;公众号名写在「公众号运营」那一条的副标题里 ——
              六篇推文已经收进一条,不用在标题行再重复一遍。 */}
          <span className="cjk">
            官网搭建 / 公众号运营 / 抖音运营
          </span>
        </h2>

        <div className="brand-archive glass">
          <div className="brand-archive-list">
            <div className="brand-archive-list-head mono-label">
              <span>企划档案</span>
              <span>{String(brandProjects.length).padStart(2, "0")} 份</span>
            </div>
            <div className="brand-archive-rows">
              {brandProjects.map((p, i) => {
                const isActive = p.id === selected.id;
                const thumb = p.portraitImage || p.image;
                return (
                  <button
                    type="button"
                    key={p.id}
                    ref={isActive ? activeRowRef : null}
                    className={`brand-archive-row${isActive ? " is-active" : ""}`}
                    onClick={() => setSelectedId(p.id)}
                    aria-current={isActive}
                  >
                    <span className="brand-archive-row-index mono-label">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="brand-archive-row-thumb">
                      <img src={thumb} alt="" {...deferredImageProps} />
                    </span>
                    <span className="brand-archive-row-info">
                      <span className="brand-archive-row-title">{p.title}</span>
                      <span className="brand-archive-row-sub mono-label">{p.titleCn}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="brand-archive-main">
            <div className="brand-archive-main-head">
              <span className="mono-label brand-archive-live">
                <span className="dot" aria-hidden="true" />
                当前查看
              </span>
              <div className="brand-archive-actions">
                {/* 对外跳转只有一个入口。放在这里而不是底部那栏:页面右下角
                    有悬浮联系按钮,压在底部栏上会把链接挡掉。
                    公众号那条收着六篇推文时,这里是「阅读全文」,跳的是当前
                    正在看的这一篇;官网那条只有一条链接,就写「访问线上站点」。 */}
                {jumpLink && (
                  <a
                    className="brand-archive-link"
                    href={jumpLink.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={jumpLink.title || jumpLink.label}
                    aria-label={jumpLink.title || jumpLink.label}
                  >
                    {activePreview ? "阅读全文" : jumpLink.label} ↗
                  </a>
                )}
                <div className="brand-archive-nav">
                  <button type="button" onClick={() => goTo(-1)} className="mono-label">
                    ← 上一份
                  </button>
                  <button type="button" onClick={() => goTo(1)} className="mono-label">
                    下一份 →
                  </button>
                </div>
              </div>
            </div>

            {/* 六篇推文的切换条:点一颗就地换右栏内容,不跳浏览器。
                只有"一条企划收了好几篇"时才出现,官网/抖音那些没有这条。 */}
            {previews.length > 0 && (
              <div className="brand-archive-tabs">
                <span className="mono-label brand-archive-tabs-label">
                  收录 {previews.length} 篇
                </span>
                {previews.map((link, i) => (
                  <button
                    key={link.url}
                    type="button"
                    className={`brand-archive-tab mono-label${
                      i === activeIndex ? " is-active" : ""
                    }`}
                    onClick={() => setActiveLink(i)}
                    title={link.title || link.label}
                    aria-current={i === activeIndex}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}

            <div className="brand-archive-main-body" ref={bodyRef}>
              <img
                key={`${selected.id}-${activeIndex}`}
                src={shownImage || selected.image}
                alt={activePreview ? `${activePreview.title} 全文预览` : `${selected.title} 完整内容`}
                {...deferredImageProps}
              />
            </div>

            <div className="brand-archive-main-foot">
              <span className="chip">{selected.tag}</span>
              <h3>{selected.title}</h3>
              <span className="mono-label">{selected.titleCn}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
