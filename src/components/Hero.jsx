import { useEffect, useRef, useState } from "react";
import { siteInfo } from "../data/siteConfig";
import { profile } from "../data/profileData";
import { publicAsset } from "../utils/publicAsset";
import { onEnter } from "../utils/introGate";
import "./Hero.css";

/**
 * 首页首屏(海报式排版)
 * ------------------------------------------------------------
 * 从上到下一共三行,一屏放得下、互不遮挡:
 *   1. 小标签    2026 精选作品(打字机敲出来)
 *   2. 大标题    个人作品集(毛笔字图片,逐笔从左往右扫出来)
 *   3. 姓名      蔡灵潇(深墨蓝,退到副位避免与主标题争主体)
 * 再往下是职位列表和底部的联系方式 / 滚动提示。
 *
 * 整块内容在 .hero-sticky 里用 justify-content:center 垂直居中,
 * 让"个人作品集"占据首屏视觉中心。
 *
 * 主标题为什么是图片而不是文字:
 *   用户给了一张毛笔行书的"个人作品集"。这类手写笔触的字形没有
 *   任何字体能还原,唯一的做法是把笔迹本身当成素材。素材在这里
 *   不直接当 <img> 用,而是当"镂空模板"(CSS mask)盖在一层晴空蓝
 *   渐变上 —— 于是笔触形状来自原图,颜色却由网站主题变量控制,
 *   以后改色只改 CSS,不用重新导图。详见 Hero.css 里 .hero-brush
 *   那一段注释。
 *
 * 两处此前导致"首页看起来像乱码"的问题,已经在之前版本修掉:
 *   1. 字体混排:大标题以前用 Anton —— 那是只含拉丁字母的字体,
 *      遇到中文会回退到另一套字体,同一个标题里两种字形混在一起。
 *   2. 重影:模板的占位底图会把姓名直接"画"在背景图画里,
 *      和页面上的真标题叠在一起。这一版那张底图已经整块删掉。
 *
 * 文案 / 顺序想改的话,只改 TYPED_SEGMENTS 这一份数组即可,
 * 打字机逻辑会自动跟着它走。
 */

const roleList = [
  "新媒体运营",
  "内容创意",
  "品牌策划",
  "视频剪辑",
];

// 毛笔字标题素材(透明底笔触,见 public/placeholders/brush-portfolio.png)
const brushTitleUrl = publicAsset("/placeholders/brush-portfolio.png");

// 打字机依次敲出来的文字,数组顺序 = 从上到下看到的顺序。
// 注意第二段"个人作品集"不会真的逐字显示 —— 它上面渲染的是毛笔字
// 图片。这一项留着是因为它是整段动画的"时间占位":TOTAL_TYPE_UNITS
// 里仍然算上这 5 个字,所以打字总时长、光标推进节奏都不用改,
// 而下面用 TITLE_START_UNITS 就能算出"标题该从第几个字开始揭示"。
const TYPED_SEGMENTS = [
  { key: "eyebrow", text: "2026 精选作品" },
  { key: "title", text: "个人作品集" },
  { key: "name", text: siteInfo.nameCn },
];

// 标题段从第几个"字"开始 —— 前面那段小标签敲完就开始扫毛笔字
const TITLE_START_UNITS = TYPED_SEGMENTS[0].text.length;
const TITLE_TEXT = TYPED_SEGMENTS[1].text;

const TOTAL_TYPE_UNITS = TYPED_SEGMENTS.reduce((n, s) => n + s.text.length, 0);

// 打字机总时长(秒)——从点 START 到全部敲完的节奏。
const TYPING_DURATION_SECONDS = 4;
// 每一步之间最短间隔,防止总时长特别短的时候打字快到肉眼看不清。
const MIN_STEP_MS = 16;
// 打字整体速度倍率——2 就是比"跟总时长严格同步"快一倍敲完。
const TYPE_SPEED_MULTIPLIER = 2;

// 已敲出 revealedUnits 个字时,第 index 段应该显示到第几个字
function revealCount(index, revealedUnits) {
  let before = 0;
  for (let i = 0; i < index; i += 1) before += TYPED_SEGMENTS[i].text.length;
  return Math.max(0, Math.min(revealedUnits - before, TYPED_SEGMENTS[index].text.length));
}

// 光标此刻应该跟在第几段后面;返回 -1 表示已经全部敲完
function cursorSegment(revealedUnits) {
  let before = 0;
  for (let i = 0; i < TYPED_SEGMENTS.length; i += 1) {
    before += TYPED_SEGMENTS[i].text.length;
    if (revealedUnits < before) return i;
  }
  return -1;
}

export default function Hero() {
  const typingStartedRef = useRef(false);
  const typingTimerRef = useRef(null);

  const [revealedUnits, setRevealedUnits] = useState(0);

  useEffect(() => {
    function startTyping() {
      if (typingStartedRef.current) return;
      typingStartedRef.current = true;

      // 留一点点提前量(0.3 秒),让最后一个字刚好在计时到点前出现,
      // 而不是卡在最后一瞬间才敲完;再除以 TYPE_SPEED_MULTIPLIER
      // 让整体节奏更快一点。
      const totalMs = Math.max(
        (TYPING_DURATION_SECONDS * 1000 - 300) / TYPE_SPEED_MULTIPLIER,
        TOTAL_TYPE_UNITS * MIN_STEP_MS
      );
      const stepMs = Math.max(totalMs / TOTAL_TYPE_UNITS, MIN_STEP_MS);

      let unit = 0;
      function tick() {
        unit += 1;
        setRevealedUnits(unit);
        if (unit < TOTAL_TYPE_UNITS) {
          typingTimerRef.current = setTimeout(tick, stepMs);
        }
      }
      typingTimerRef.current = setTimeout(tick, stepMs);
    }

    // 打字机真正开始敲字,要等到开屏动画(IntroScreen)播完/用户点了
    // START 之后才触发——不然用户还在看开屏动画的时候,字已经在背后
    // 偷偷敲完了,等真正看到首页时反而错过了整个过程。如果用户打开
    // 页面时开屏动画已经放过一次了(hasEntered() 为真),onEnter 会
    // 立刻执行,效果不受影响。
    const unsubscribe = onEnter(startTyping);

    return () => {
      unsubscribe();
      clearTimeout(typingTimerRef.current);
      typingStartedRef.current = false;
    };
  }, []);

  const typingDone = revealedUnits >= TOTAL_TYPE_UNITS;
  const activeCursor = cursorSegment(revealedUnits);
  const activeKey = activeCursor === -1 ? null : TYPED_SEGMENTS[activeCursor].key;

  // 小标签敲完的下一拍就开始扫毛笔字。这里故意用同一套 revealedUnits
  // 驱动,而不是另开一个定时器 —— 打字节奏将来怎么调,标题的出场时机
  // 都会自动跟着走,不会对不上。
  const brushRevealed = revealedUnits > TITLE_START_UNITS;

  // 每段文字当前该显示的部分,按 key 取用,省得在 JSX 里算下标
  const revealed = {};
  TYPED_SEGMENTS.forEach((seg, i) => {
    revealed[seg.key] = seg.text.slice(0, revealCount(i, revealedUnits));
  });

  const typedCursor = (key) =>
    activeKey === key && !typingDone ? (
      <span className="hero-type-cursor" aria-hidden="true" />
    ) : null;

  return (
    <section id="hero" className="hero-region">
      <div className="hero-sticky">
        <div className="hero-vignette" />

        <div className="hero-content container">
          <h1 className="hero-title-block">
            <span className="hero-eyebrow mono-label">
              {revealed.eyebrow}
              {typedCursor("eyebrow")}
            </span>

            {/* 毛笔字标题。role="img" + aria-label 让读屏软件读到的是
                "个人作品集"这几个字,而不是一句"图片"。笔触本身是背景
                层(hero-brush-ink)上的 mask,这里只负责框出尺寸和做
                从左往右的揭示动画。 */}
            <span
              className={`hero-brush${brushRevealed ? " is-revealed" : ""}`}
              role="img"
              aria-label={TITLE_TEXT}
            >
              <span
                className="hero-brush-ink"
                style={{
                  WebkitMaskImage: `url(${brushTitleUrl})`,
                  maskImage: `url(${brushTitleUrl})`,
                }}
              />
            </span>

            <span className="hero-title-line hero-title-line--plain">
              {revealed.name}
              {typedCursor("name")}
            </span>
          </h1>

          <ul className="hero-roles">
            {roleList.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <div className="hero-bottom-row">
            <div className="hero-contacts mono-label">
              {profile.contacts.map((c) => (
                <span key={c.label}>
                  {c.label} — {c.value}
                </span>
              ))}
            </div>

            {/* 原来这里还有一行「向下滚动浏览 ↓」的操作提示,按
                「页面上不要出现指导用户怎么操作的提示文案」的要求整块去掉。 */}
          </div>
        </div>
      </div>
    </section>
  );
}
