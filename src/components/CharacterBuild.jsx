import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { characterBuildIntro, characterProjects } from "../data/characterBuildData";
import "./CharacterBuild.css";

/**
 * AIGC 人物形象搭建设计
 * ------------------------------------------------------------
 * 模板提供横向循环浏览与可展开的角色详情:
 *
 * 1) 角色卡以"一整行"横向排列,下面配一对左右箭头按钮,
 *    点箭头横向滑动着看,不再是自动换行的网格。
 * 2) 每张卡片最上面那颗胶囊,之前写的是编号(C-01),现在换成角色的
 *    名字;编号挪到了下面小字条里,不占主要位置。
 * 3) 点卡片不再是"原地展开",而是弹出一个独立的详情页
 *    (左边小封面缩略图 + 中间大图 + 右边三张可以点的插卡)——
 *    点右边插卡的正面/侧面/背面,中间的大图立刻切换,大图下面
 *    标注当前是"正面/侧面/背面"。三张插卡也统一放在白底卡片上,
 *    这样即使原图里三个姿势挨得比较近,单独看也是干净的。
 * 4) 这一整行支持"循环":一路往左滑,滑过第一张
 *    之后接的是最后一张;一路往右滑,滑过最后一张
 *    之后接的又是第一张——首尾无缝接起来,不会滑到头卡住。
 *    做法是把卡片多渲染 3 份首尾相连,滑到最边上的缓冲区时
 *    悄悄把滚动位置"跳"回中间那一份,用户感觉不到跳变,看起来就是
 *    一直能往同一个方向滑下去。
 * 5) 每次点击卡片(选中)依然有一个轻微放大的小动效,包括这一整行的
 *    卡片,和详情页右边正面/侧面/背面那三张插卡被选中的时候。
 */

// 首尾渲染几份一样的卡片来做"循环滚动"的缓冲区,3 份足够——
// 中间那份是用户平时看到的"主视图",左右各留一份当缓冲。
const LOOP_SETS = 3;

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 转盘视频卡片上的小图标:一个圈 + 中间一个箭头,示意"可以转动查看"
function RotateIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 8A5 5 0 1 1 11.2 4.1M13 8V4.6M13 8H9.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 把 16 张角色卡复制成 LOOP_SETS 份,首尾接起来用于循环滚动
const loopCharacters = Array.from({ length: LOOP_SETS }).flatMap((_, setIndex) =>
  characterProjects.map((c) => ({ ...c, _loopKey: `${c.id}__set${setIndex}` }))
);

export default function CharacterBuild() {
  const rowRef = useRef(null);
  const [openId, setOpenId] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  // 详情页中间大图现在有两种模式:'photo'(正/侧/背视图)和
  // 'video'(转盘展示视频)。默认是 photo,点了左下角的视频卡才切到 video。
  const [mode, setMode] = useState("photo");
  const videoRef = useRef(null);
  const scrubRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);
  // 滑轨手柄/进度条的位置,0~1,只由"拖动"来驱动,不会自己播放走动。
  const [scrubFraction, setScrubFraction] = useState(0);
  const isScrubbingRef = useRef(false);
  // 鼠标悬停放大只给"真的能悬停的鼠标设备"用(电脑),手机/平板这种
  // 触屏设备不给悬停效果——因为触屏点一下有时候"悬停状态"消不掉,
  // 会卡在放大的样子出不来,之前"放大特效被裁剪"很大一部分就是这个。
  // 触屏改成点击的瞬间也有一下轻微放大,松手就恢复。
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupportsHover(mq.matches);
    function onChange(e) {
      setSupportsHover(e.matches);
    }
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const openCharacter = characterProjects.find((c) => c.id === openId) || null;
  const activeView = openCharacter ? openCharacter.views[mainIndex] || openCharacter.views[0] : null;

  function openCard(id) {
    setOpenId(id);
    setMainIndex(0);
    setMode("photo");
    setVideoDuration(0);
    setScrubFraction(0);
  }

  function closeModal() {
    setOpenId(null);
  }

  // 点右边插卡(正面/侧面/背面):切回照片模式,并选中对应那一张
  function selectView(i) {
    setMode("photo");
    setMainIndex(i);
  }

  // 点左上角的封面身份卡:中间大图切换成这张"形象照"
  function openCover() {
    setMode("cover");
  }

  // 点左下角的转盘视频卡:切到视频模式。默认没有拖动滑轨的时候,
  // 视频会自动循环播放(见下面 <video> 的 autoPlay/loop);
  // 一旦手指/鼠标开始拖动滑轨,就会暂停自动播放,改成跟着拖动的位置
  // 精确定格到某一帧,松手后又会继续自动播放。
  function openTurntable() {
    setMode("video");
  }

  // 滑轨的核心逻辑:把手指/鼠标在滑轨上的横向位置,换算成 0~1 的比例,
  // 再乘以视频总时长,直接设置 video.currentTime——这是"拖动跳帧"。
  function seekFromClientX(clientX) {
    const rail = scrubRef.current;
    const video = videoRef.current;
    if (!rail || !video) return;
    const duration = video.duration || videoDuration;
    if (!duration) return;
    const rect = rail.getBoundingClientRect();
    if (rect.width <= 0) return;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = fraction * duration;
    setScrubFraction(fraction);
  }

  // 按下滑轨:先暂停自动播放,再定格到按下的位置——拖动优先于自动播放
  function handleScrubPointerDown(e) {
    isScrubbingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    videoRef.current?.pause();
    seekFromClientX(e.clientX);
  }

  function handleScrubPointerMove(e) {
    if (!isScrubbingRef.current) return;
    seekFromClientX(e.clientX);
  }

  // 松手:拖动结束,恢复"没有滑动的时候就自动播放"的默认状态
  function handleScrubPointerUp(e) {
    isScrubbingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    videoRef.current?.play?.().catch(() => {});
  }

  // 视频自动播放的时候,让下面滑轨的进度跟着同步走(拖动的时候不用管,
  // 拖动本身已经在 seekFromClientX 里同步过 scrubFraction 了)
  function handleVideoTimeUpdate(e) {
    if (isScrubbingRef.current) return;
    const v = e.currentTarget;
    if (v.duration) setScrubFraction(v.currentTime / v.duration);
  }

  function scrollRow(dir) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: "smooth" });
  }

  // 页面刚打开时,先把横向滚动条定位到"中间那一份"卡片的开头,
  // 这样往左往右都还有一整份缓冲区可以滑,才能做出循环的效果。
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const setWidth = el.scrollWidth / LOOP_SETS;
      el.scrollLeft = setWidth;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // 滑到最左边或最右边的缓冲区时,等这一下滑动停下来,
  // 就悄悄把滚动位置挪回中间那一份的对应位置(不带动画),
  // 用户感觉不到跳变,看起来就像是可以一直往同一个方向滑下去。
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    function correctIfNeeded() {
      const setWidth = el.scrollWidth / LOOP_SETS;
      if (setWidth <= 0) return;
      if (el.scrollLeft < setWidth * 0.5) {
        el.scrollLeft += setWidth;
      } else if (el.scrollLeft > setWidth * 1.5) {
        el.scrollLeft -= setWidth;
      }
    }

    // 优先用浏览器原生的"这一下滑动/惯性彻底停下来了"事件(scrollend),
    // 比"隔一段时间没再触发 scroll 就当作停了"更准,循环的跳变更不明显、
    // 滑起来更顺;老版本浏览器不支持这个事件的话,退回到一个很短的
    // 延迟兜底,不影响正常使用。
    let settleTimer = null;
    function handleScroll() {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(correctIfNeeded, 80);
    }

    const supportsScrollEnd = "onscrollend" in window;
    if (supportsScrollEnd) {
      el.addEventListener("scrollend", correctIfNeeded, { passive: true });
    } else {
      el.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (supportsScrollEnd) {
        el.removeEventListener("scrollend", correctIfNeeded);
      } else {
        el.removeEventListener("scroll", handleScroll);
      }
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, []);

  // 详情页打开的时候,支持按 Esc 关闭
  useEffect(() => {
    if (!openId) return;
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <section id="character-build" className="section character-section">
      <div className="container">
        <div className="section-eyebrow mono-label">
          <span className="dot" aria-hidden="true" />
          {characterBuildIntro.eyebrow}
        </div>
        <h2 className="section-title">
          {characterBuildIntro.titleEn}
          <span className="cjk">{characterBuildIntro.titleCn}</span>
        </h2>
        <p className="section-tag mono-label character-tag">{characterBuildIntro.tag}</p>

        <div className="character-row-wrap">
          <div className="character-row" ref={rowRef}>
            {loopCharacters.map((c) => (
              <motion.button
                key={c._loopKey}
                type="button"
                className="character-card"
                {...(supportsHover ? { whileHover: { scale: 1.05 } } : {})}
                whileTap={{ scale: 1.06 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                onClick={() => openCard(c.id)}
                aria-label={`打开 ${c.nameCn} 的详情`}
              >
                <div className="character-card-topbar">
                  <span className="character-card-topname">{c.name}</span>
                  <ExpandIcon />
                </div>
                <div className="character-card-cover" style={{ backgroundImage: `url(${c.cover})` }}>
                  <span className="frame-corner tl" />
                  <span className="frame-corner tr" />
                  <span className="frame-corner bl" />
                  <span className="frame-corner br" />
                </div>
                <div className="character-card-bottombar">
                  <span className="mono-label">{c.id}</span>
                  <span className="character-card-name-cn">{c.nameCn}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="character-row-nav">
            <button
              type="button"
              className="character-nav-btn"
              onClick={() => scrollRow(-1)}
              aria-label="向左循环查看角色"
            >
              <ArrowIcon />
            </button>
            <button
              type="button"
              className="character-nav-btn is-right"
              onClick={() => scrollRow(1)}
              aria-label="向右循环查看角色"
            >
              <ArrowIcon />
            </button>
          </div>
        </div>

        <div className="character-footer mono-label">
          {characterBuildIntro.note.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </div>

      {/* 点卡片弹出的详情页:左边封面缩略图 + 中间大图 + 右边三张可点的插卡 */}
      <AnimatePresence>
        {openCharacter && (
          <motion.div
            className="character-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
          >
            <motion.div
              className="character-modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="character-modal-close" onClick={closeModal} aria-label="关闭详情页">
                <CloseIcon />
              </button>

              <div className="character-modal-inner">
                <div className="character-modal-left">
                  <motion.button
                    type="button"
                    className={`character-modal-thumb${mode === "cover" ? " is-active" : ""}`}
                    whileTap={{ scale: 0.96 }}
                    onClick={openCover}
                    aria-label={`查看 ${openCharacter.nameCn} 的形象照`}
                  >
                    <span className="frame-corner tl" />
                    <span className="frame-corner tr" />
                    <span className="frame-corner bl" />
                    <span className="frame-corner br" />
                    <img src={openCharacter.cover} alt={`${openCharacter.nameCn} 封面`} />
                    <div className="character-modal-thumb-label">
                      <span className="mono-label">{openCharacter.id}</span>
                      <span className="character-modal-thumb-name">{openCharacter.name}</span>
                      <span className="character-card-name-cn">{openCharacter.nameCn}</span>
                    </div>
                  </motion.button>

                  {openCharacter.turntable && (
                    <motion.button
                      type="button"
                      className={`character-modal-video-thumb${mode === "video" ? " is-active" : ""}`}
                      whileTap={{ scale: 0.94 }}
                      onClick={openTurntable}
                      aria-label={`查看 ${openCharacter.nameCn} 的 360° 转盘视频`}
                    >
                      <img src={openCharacter.turntable.poster} alt={`${openCharacter.nameCn} 转盘展示`} />
                      <span className="character-video-thumb-badge">
                        <RotateIcon />
                        360°
                      </span>
                      <span className="mono-label character-video-thumb-label">转盘展示 / TURNTABLE</span>
                    </motion.button>
                  )}
                </div>

                <div className="character-modal-main-col">
                  <div className="character-modal-main">
                    <span className="frame-corner tl" />
                    <span className="frame-corner tr" />
                    <span className="frame-corner bl" />
                    <span className="frame-corner br" />
                    {mode === "video" && openCharacter.turntable ? (
                      <video
                        key={`${openCharacter.id}-video`}
                        ref={videoRef}
                        className="character-modal-video"
                        src={openCharacter.turntable.video}
                        poster={openCharacter.turntable.poster}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration || 0)}
                        onTimeUpdate={handleVideoTimeUpdate}
                      />
                    ) : mode === "cover" ? (
                      <img
                        key={openCharacter.cover}
                        src={openCharacter.cover}
                        alt={`${openCharacter.nameCn} 形象照`}
                      />
                    ) : (
                      <img
                        key={activeView.image}
                        src={activeView.image}
                        alt={`${openCharacter.nameCn} ${activeView.labelCn}`}
                      />
                    )}
                    <span className="character-view-tag mono-label">
                      {mode === "video"
                        ? "拖动旋转 / DRAG TO ROTATE"
                        : mode === "cover"
                        ? "形象照 / PORTRAIT"
                        : `${activeView.labelCn} / ${activeView.label}`}
                    </span>
                  </div>

                  {mode === "video" && openCharacter.turntable && (
                    <div className="character-scrub-wrap">
                      <div
                        className="character-scrub-rail"
                        ref={scrubRef}
                        onPointerDown={handleScrubPointerDown}
                        onPointerMove={handleScrubPointerMove}
                        onPointerUp={handleScrubPointerUp}
                        onPointerCancel={handleScrubPointerUp}
                      >
                        <div className="character-scrub-track">
                          <div className="character-scrub-fill" style={{ width: `${scrubFraction * 100}%` }} />
                        </div>
                        <div className="character-scrub-handle" style={{ left: `${scrubFraction * 100}%` }} />
                      </div>
                      <span className="mono-label character-scrub-hint">左右拖动滑轨 · 像转动 3D 模型一样查看各个角度</span>
                    </div>
                  )}
                </div>

                <div className="character-modal-stack">
                  {openCharacter.views.map((v, i) => (
                    <motion.button
                      key={v.label}
                      type="button"
                      className={`character-modal-stack-card${mode === "photo" && mainIndex === i ? " is-active" : ""}`}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => selectView(i)}
                    >
                      <img src={v.image} alt={`${openCharacter.nameCn} ${v.labelCn}`} />
                      <span className="mono-label">
                        {v.labelCn} / {v.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <p className="character-modal-desc">{openCharacter.tag}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
