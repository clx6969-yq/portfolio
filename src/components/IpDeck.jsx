import "./IpDeck.css";

/**
 * 原方案全文 —— 直接把作者那份 PPT 的每一页铺出来
 * ------------------------------------------------------------
 * 「跨界联名总策划」不再写文字总结了:转述一定会丢东西(数据、排期、
 * 平台选择都在原页里),所以这里按 16:9 原比例一页一页排下来,
 * 点任意一页交给 Lightbox 放大看细节。
 *
 * pages: [{ src, label }](顺序就是 PPT 的页码顺序)
 * onZoom:透传给 IpSlider 最外层的灯箱 —— 不能挂在这个弹窗面板里,
 *         面板有 transform + overflow: hidden,position: fixed 会被裁。
 */
export default function IpDeck({ pages = [], onZoom }) {
  const total = pages.length;
  if (!total) return null;

  return (
    <ol className="ipdeck">
      {pages.map((page, i) => (
        <li key={page.src} className="ipdeck-item">
          <button
            type="button"
            className="ipdeck-btn"
            onClick={() => onZoom?.(page)}
            aria-label={`原方案第 ${i + 1} 页`}
          >
            <span className="ipdeck-media">
              <img src={page.src} alt={page.label} loading="lazy" />
            </span>
            <span className="mono-label ipdeck-no">
              {String(i + 1).padStart(2, "0")} / {total}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
