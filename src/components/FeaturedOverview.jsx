import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { overviewItems } from "../data/overviewData";
import { deferredImageProps } from "../utils/mediaPriority";
import { publicAsset } from "../utils/publicAsset";
import "./FeaturedOverview.css";

/**
 * 系统目录模块(index / 系统目录)—— "扇形抽牌 / 转盘放大" 效果
 * ------------------------------------------------------------
 * 左上角是一个很大的 "INDEX" 标题 + "/ SYSTEM DIRECTORY" 说明;
 * 右上角是一小块像杂志角标一样的文字说明(手写体标语 + 品牌信息);
 * 中间是完整的 5 张"票根卡片"(编号、标题、真实图片、标签、
 * 底部分类,信息全都在)。
 *
 * 平时(没有鼠标悬停):就已经是"中间那张最大、越往两边越小"的
 * 扇形——不是所有牌都一样大,而是天生就有近大远小的透视感,
 * 像现实里摊开的一手扑克牌。
 *
 * 鼠标移到(或键盘聚焦到)哪一张:
 * - 那张会原地"往上弹起 + 摆正 + 放大 12% + 提到最前",视觉上
 *   明显"抽出来";
 * - 其余牌原地不动——这是刻意的:牌如果跟着悬停重新对焦、挪到
 *   中间,就会在光标底下滑走,想点的那张会跑,很容易点成旁边
 *   那张(见下面 getCardAnimate 的注释);
 * - 也可以直接按住鼠标左右拖动,整手牌会跟着手指/鼠标滑动
 *   (拖动之后松手不会误触发跳转,真的"点一下没拖动"才会跳转)。
 *
 * 这些位置全部用 framer-motion 的 spring 动画算出来,不是瞬间
 * 跳过去,所以感觉是"滑过去"而不是"抽动一下"。
 * 手机屏幕太窄摆不下扇形,会自动改回原来那种竖着排一列的样子
 * (看 CSS 里 960px 那个响应式断点)。
 * 最下面是一整条页脚说明文字。
 */
const HOVER_LIFT = -110; // 被悬停的牌往上弹出多少(px);卡片整体放大后从 -84 加到 -110,即使相邻两张重叠,鼠标悬停那张会清楚地"跳"出来,不容易点错

// "中间大、两边依次变小"效果的几个参数:不管是平时(圆心固定
// 在正中间那张)还是鼠标悬停(圆心换成被选中那张),都用同一套
// 规则算位置/角度/大小——离圆心隔了几张(distance),就挪多远、
// 转多斜、缩多少,隔得越远差别越明显,做出"扑克牌抽卡"的层次感。
const FOCUS_SCALE = 1.12; // 鼠标真的悬停在某张上时,那张再多放大(放大 12%),配合更大幅的 hover 抬起,被选中那张会明显"立"起来
// 水平步进 = 卡片实际宽度 × 0.75(相邻两张只重叠 25%,留出足够大的
// 可点区域)。不写死数值是因为卡片宽度归 CSS 断点管(宽屏 400、
// 中等屏 340、手机竖排),写死的话窄屏上整手牌会被左右裁掉——
// 具体在下面的 measure 里量完真实宽度再算。
const FAN_STEP_RATIO = 0.75;
const FAN_STEP_MIN = 140; // 兜底下限,防止极窄屏算成 0/负数
const FAN_STEP_FALLBACK = 300; // 首帧还没量到宽度时先用这个(≈宽屏 400×0.75)
const FAN_FIT_RATIO = 0.9; // 整手牌最多占容器宽度的多少,剩下的是呼吸位(卡片是斜的,外接框比理论宽度大一圈,所以留得比直觉多一点)
const DRAG_RATIO = 0.95; // 左右最多能拖动"一个水平步进"的多少倍
const FOCUS_STEP_Y = 10; // 离圆心每隔一张,往后退多少(px);从 14 收到 10,侧牌不再"重重叠上去",扇形更舒展
const FOCUS_STEP_ROTATE = 7; // 离圆心每隔一张,角度多斜多少(度);从 10 收到 7,扇形整体更"平",每张牌都更易识别
// 注意:紧挨着中间的那一张(隔 1 张)不要一下子缩小太多,不然
// 中间到旁边这一步"掉"得太猛,扇形看起来有棱有角;隔得越远
// 再加大缩小幅度,这样整体过渡更圆润、更像一手自然摊开的牌。
// 下标就是"隔了几张"(absDistance):[中间自己, 隔1张, 隔2张, ...]。
const FOCUS_SCALE_DELTAS = [0, 0.05, 0.2, 0.36, 0.48];
const FOCUS_MIN_SCALE = 0.55; // 最外侧的牌最小缩到多少倍

/* 把上面那张表当"折线"用,支持小数距离。
   圆心不一定是整数:4 张牌时圆心落在第 1、2 张之间,距离是 0.5 / 1.5。
   以前直接拿小数查数组会拿到 undefined、掉进一个兜底公式,结果 4 张
   牌全都被缩过、"没有一张是满尺寸",整组看着就比实际宽度小一截——
   这就是"牌明明加了宽度却还是显得小"的原因。插值之后,离圆心最近的
   那两张基本能保持接近原始大小。 */
function fanScaleDelta(absDistance) {
  const last = FOCUS_SCALE_DELTAS.length - 1;
  if (absDistance <= 0) return 0;
  if (absDistance >= last) return FOCUS_SCALE_DELTAS[last] + (absDistance - last) * 0.12;
  const lo = Math.floor(absDistance);
  return FOCUS_SCALE_DELTAS[lo] + (FOCUS_SCALE_DELTAS[lo + 1] - FOCUS_SCALE_DELTAS[lo]) * (absDistance - lo);
}

// 之前弹簧太"快",鼠标刚划过去卡片就已经滑走了,很难精准点中
// 自己想要的那张——把 stiffness(弹簧硬度)调低、mass(重量感)
// 调高,让整个滑动过程明显变慢、更沉稳,给手一点反应时间。
const SPRING = { type: "spring", stiffness: 120, damping: 26, mass: 1.3 };

export default function FeaturedOverview() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [dragX, setDragX] = useState(0);
  const fanRef = useRef(null);
  /* 扇形的水平步进(px)。卡片宽度由 CSS 断点决定,这个值必须跟着
     卡片一起变,所以开局先用兜底值渲染,挂载后量真实宽度再修正。 */
  const [stepX, setStepX] = useState(FAN_STEP_FALLBACK);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startOffset: 0,
    moved: false,
    captured: false,
    pointerId: null,
    target: null,
  });

  /* 量出卡片真实宽度,按比例推出水平步进,并且保证"整手牌"不会
     比容器还宽(窄屏被裁 / 贴边都是因为这个)。窗口一变就重量,
     所以从宽屏拖到窄屏也不会瞬间出血。手机断点下卡片是竖排、
     transform 被 CSS 的 !important 关掉,这里算出来的值不参与
     布局,不影响。 */
  useEffect(() => {
    const fan = fanRef.current;
    if (!fan) return undefined;
    const measure = () => {
      const card = fan.querySelector(".ticket-card");
      const cardW = card?.offsetWidth || FAN_STEP_FALLBACK / FAN_STEP_RATIO;
      const room = fan.clientWidth;
      const byOverlap = cardW * FAN_STEP_RATIO; // 优先保证"相邻两张只重叠 25%"
      const byFit =
        room > cardW ? (room * FAN_FIT_RATIO - cardW) / (overviewItems.length - 1) : byOverlap; // 再保证整手牌装得下
      setStepX(Math.max(FAN_STEP_MIN, Math.round(Math.min(byOverlap, byFit))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fan);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const mid = (overviewItems.length - 1) / 2;

  /* 悬停只让"被指着的那张"动,整手牌的位置不再跟着变。
     ------------------------------------------------------------
     以前悬停会把整手牌重新对焦——被选中的那张要"挪到正中间",于是
     牌会在光标底下滑走:想点第 4 张,鼠标刚碰上去它就跑了,光标落空
     → hover 取消 → 弹簧又荡回来 → 反复抖;等手指真正落下时牌还没
     停稳,点到的就是旁边那张。现在:
       · 每张牌的位置/角度/大小只由"离固定圆心的距离"决定,静止和
         悬停共用同一套骨架,所以可点区域和看到的位置永远一致;
       · 被悬停的那张在原地"弹起 + 摆正 + 放大 + 提到最前"(效果
         依旧明显,只是不跑掉)。 */
  function getCardAnimate(i) {
    const isHovered = hoveredIndex === i;
    const distance = i - mid;
    const absDistance = Math.abs(distance);
    const dir = distance > 0 ? 1 : -1;
    const restScale = Math.max(FOCUS_MIN_SCALE, 1 - fanScaleDelta(absDistance));
    const liftY = isHovered ? HOVER_LIFT : 0;
    // 距离可能是 1.5 这种小数,z-index 必须是整数(带小数会被浏览器
    // 整条声明丢掉、退回 auto,叠放顺序就乱了),所以取整。
    const zIndex = isHovered ? 200 : Math.round(100 - absDistance * 2);

    if (absDistance === 0) {
      // 只有牌数是奇数、圆心正好压在中间那张上时才走这里:不偏移、
      // 不倾斜,只负责被悬停时弹起放大。
      return { x: dragX, y: liftY, rotate: 0, scale: isHovered ? FOCUS_SCALE : 1, zIndex };
    }

    return {
      x: dragX + dir * absDistance * stepX,
      y: absDistance * FOCUS_STEP_Y + liftY,
      rotate: isHovered ? 0 : dir * (FOCUS_STEP_ROTATE * 0.6 + absDistance * FOCUS_STEP_ROTATE),
      scale: isHovered ? restScale * FOCUS_SCALE : restScale,
      zIndex,
    };
  }

  // 之前这里一按下(哪怕只是想点一下,没打算拖)就立刻
  // setPointerCapture,把这次交互"抢"到了最外层的 .directory-fan
  // 上——结果卡片(<a> 标签)自己的点击跳转反而经常触发不了,
  // 这就是"点卡片没反应"的真正原因。现在改成"真的挪动超过一点
  // 距离,才算开始拖、才去抢这个 pointer capture";只是单纯点一下
  // 松手,从头到尾都不会进入"拖动"状态,点击自然能正常生效。
  const DRAG_THRESHOLD = 6; // 超过这个像素才算真的在拖,而不是手抖

  function handlePointerDown(e) {
    dragRef.current.dragging = true;
    dragRef.current.moved = false;
    dragRef.current.captured = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startOffset = dragX;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.target = e.currentTarget;
  }

  function handlePointerMove(e) {
    if (!dragRef.current.dragging) return;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      dragRef.current.moved = true;
      // 只有真的开始拖了,才去抢 pointer capture,不影响正常点击。
      if (!dragRef.current.captured) {
        dragRef.current.captured = true;
        dragRef.current.target?.setPointerCapture?.(dragRef.current.pointerId);
      }
    }
    if (!dragRef.current.moved) return;
    // 能拖多远跟着步进走:牌整体放大/缩小,拖动的幅度也一起变,
    // 手感不会因为屏幕宽窄差太多。
    const limit = Math.round(stepX * DRAG_RATIO);
    const next = Math.max(-limit, Math.min(limit, dragRef.current.startOffset + delta));
    setDragX(next);
  }

  function handlePointerUp() {
    if (dragRef.current.captured && dragRef.current.target) {
      dragRef.current.target.releasePointerCapture?.(dragRef.current.pointerId);
    }
    dragRef.current.dragging = false;
    dragRef.current.captured = false;
  }

  function handleCardClick(e, target) {
    // 刚刚是拖动手势,不是真的点击——拦下这次跳转,不然一松手会
    // 顺带"点到"底下那张卡。
    if (dragRef.current.moved) {
      e.preventDefault();
      return;
    }
    // 真的是点击:自己用 JS 平滑滚动过去,不依赖浏览器原生的锚点
    // 跳转(锚点跳转在个别浏览器 + pointer capture 混在一起时不够
    // 可靠),这样点击跳转这件事更稳。
    e.preventDefault();
    const section = document.getElementById(target);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="work"
      className="section directory-section"
      style={{ "--directory-image": `url(${publicAsset("/placeholders/landscape-01.svg")})` }}
    >
      {/* 上一个模块(首屏视频)结尾是接近全黑的画面,这个模块一开始
          就是带图案的深红背景图,两块颜色/明暗直接拼在一起,交界处
          会看到一条很明显的分界线——加一条"从纯黑慢慢淡出"的
          渐变,盖在背景图最上面,把两个模块的颜色自然接起来。 */}
      <div className="directory-top-fade" aria-hidden="true" />
      <div className="directory-noise" aria-hidden="true" />
      <div className="container directory-container">
        <div className="directory-topbar">
          <div className="directory-title-block">
            <div className="directory-title-row">
              <h2 className="directory-mega-title">目录</h2>
              <div className="directory-subtitle">
                <span className="directory-subtitle-cn">系统目录</span>
                <span className="mono-label">/ 作品集导航</span>
                <span className="mono-label directory-subtitle-sub">作品集导航 2026</span>
              </div>
            </div>
            <div className="directory-tabs mono-label">
              <span className="directory-dot is-on" />
              <span className="directory-dot is-on" />
              <span className="directory-dot" />
              <span>内容 / 视觉 / 品牌 / 影像 / 创意</span>
            </div>
          </div>

          {/* 右上角那组信息角标(手写体"好内容 / 连接更多可能"、
              "让创意 被更多人 看见"、分隔线、"创意作品集 2026"+ 地球图标、
              "创意 视觉 内容 文化")已按用户要求整块移除。
              原先配套的 .directory-info-block / .directory-scribble /
              .directory-info-mono / .directory-info-divider /
              .directory-info-brand / .directory-globe / .directory-info-list
              样式已经没人用,也一并从 FeaturedOverview.css 删干净了。
              .directory-topbar 仍是 space-between + flex-wrap,少了右边这
              一栏之后标题区自然靠左,不需要再改布局。 */}
        </div>

        <motion.div
          ref={fanRef}
          className="directory-fan"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            dragRef.current.dragging = false;
            setHoveredIndex(null);
          }}
        >
          {overviewItems.map((item, i) => {
            const anim = getCardAnimate(i);
            return (
              // 注意: .ticket-card-slot 自己有 transform(translateX),
              // 这会在 CSS 里创建一个新的"层叠上下文",把子元素的
              // z-index 关在这个上下文里面——如果 z-index 只写在里面
              // 的卡片上,浏览器还是会按 DOM 先后顺序来叠(后面的卡永远
              // 盖住前面的卡),鼠标移上去也顶不到最前面。所以 z-index
              // 必须写在 slot 这一层,才能真正控制"谁盖住谁"。
              <div key={item.id} className="ticket-card-slot" style={{ zIndex: anim.zIndex }}>
                {/* 卡片内容直接用你给的那张完整票根截图本身
                    (item.cardImage),不再用代码重新画一遍编号/标题/
                    标签这些——避免代码画出来的效果跟你要的对不上。 */}
                <motion.a
                  href={`#${item.target}`}
                  className={`ticket-card tone-${item.tone}`}
                  animate={{ x: anim.x, y: anim.y, rotate: anim.rotate, scale: anim.scale }}
                  transition={SPRING}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onFocus={() => setHoveredIndex(i)}
                  onBlur={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
                  onClick={(e) => handleCardClick(e, item.target)}
                >
                  <img
                    className="ticket-card-image"
                    src={item.cardImage}
                    alt={`${item.titleEn} / ${item.titleCn}`}
                    draggable={false}
                    {...deferredImageProps}
                  />
                  {/* 压在卡片底部的文字提示(个人简介 / 影视创作 / 运营作品 /
                      IP 策划)。这几个字以前是票根截图自己带的,现在封面换成
                      了真实作品图,标签由代码补上,不管封面是亮是暗都读得清
                      (深色胶囊 + 底部渐隐,见 CSS)。 */}
                  <span className="ticket-card-caption">
                    <span className="ticket-card-caption-index mono-label">{item.index}</span>
                    <span className="ticket-card-caption-text">{item.titleCn}</span>
                  </span>
                </motion.a>
              </div>
            );
          })}
        </motion.div>

        {/* 圆形数字按钮(1-5):位置永远固定不动,不会像卡片那样
            悬停时跑掉——如果实在点不准某张卡,直接点这里对应的
            数字也能跳到同一个板块,鼠标移上去还会让扇形里对应的
            那张卡跟着放大预览一下。 */}
        <div className="directory-fan-nav">
          {overviewItems.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.target}`}
              className={`directory-fan-dot${hoveredIndex === i ? " is-active" : ""}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onFocus={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
              onBlur={() => setHoveredIndex((prev) => (prev === i ? null : prev))}
            >
              {i + 1}
            </a>
          ))}
        </div>

        {/* 原来这里有一行「按住鼠标左右拖动 / 移到卡片上让它弹出摆正 ·
            点击进入对应板块」的操作提示,按「页面上不要出现指导用户怎么
            操作的提示文案」的要求整块去掉。 */}

        <div className="directory-bottombar mono-label">
          <div className="directory-bottom-left">
            <span>
              一份关于好奇
              <br />
              与创造的
              <br />
              视觉档案。
            </span>
            <div className="directory-barcode-small" aria-hidden="true" />
            <span>让想法走得更远。</span>
          </div>
          <div className="directory-bottom-center">
            <span className="directory-hr" />
            持续探索 · 持续创造
            <span className="directory-hr" />
          </div>
          <div className="directory-bottom-right">
            <span>
              内容
              <br />
              连接世界。
            </span>
            <span>+ 2026 作品集</span>
          </div>
        </div>
      </div>
    </section>
  );
}
