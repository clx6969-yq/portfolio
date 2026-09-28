import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aigcIntro, aigcVideos } from "../data/aigcVideoData";
import { siteInfo } from "../data/siteConfig";
import { deferredImageProps, deferredVideoProps } from "../utils/mediaPriority";
import "./AigcVideoLibrary.css";

// 播放器右上角"放大"按钮的图标:四个角的小折线,点一下放大,
// 再点一下(这时候图标换成叉号)退出放大模式。
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H5a1 1 0 0 0-1 1v4" />
      <path d="M15 4h4a1 1 0 0 1 1 1v4" />
      <path d="M9 20H5a1 1 0 0 0-1-1v-4" />
      <path d="M15 20h4a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/**
 * 动态影像 —— "CD 唱片架 + 右侧播放器" 板块
 * ------------------------------------------------------------
 * 左边是 CD 架,点哪张哪张就被选中(会有蓝色发光边框),
 * 右边播放器切换成这一条的内容并开始播放。
 * 圆盘不再旋转 —— 按"不需要转动"的需求,这里把原来的
 * motion.img rotate 动画去掉了,disc 层现在只是一张静态图。
 * (暂停/播放按钮仍然只控制视频本身的播放暂停,不影响卡片视觉。)
 *
 * 数据见 src/data/aigcVideoData.js,目前 2 条真实作品
 * (微电影《己》+ 纪录片《活路》)。原来模板里 CD 卡片下方的
 * "主创名单"区块(meta 字段)已按"个人专属作品集不放团队名单"
 * 的需求移除 —— 数据里没有了,这边 JSX / CSS 也跟着清理了。
 *
 * 每条视频都用 <video> 播放(videoSrc 有值)。如果某一条 videoSrc
 * 是空字符串,就退回到"封面图 + 模拟进度条"的占位效果,不会报错。
 */

function parseDuration(str) {
  const [m, s] = str.split(":").map(Number);
  return m * 60 + s;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AigcVideoLibrary() {
  const [selected, setSelected] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // 播放器是否处于"放大居中"模式:true 的时候,播放器跳到网页
  // 正中间放大显示,左边的CD架变成竖排一列、整体虚焦(模糊+变暗)。
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(1);
  const [mutedVolume, setMutedVolume] = useState(0);
  /* 当前这一部是否已经真的出过画面。false 的时候展示栏里盖的是海报,
     用户点播放 → <video> 真的开始出帧(onPlaying)→ 海报淡出。
     不直接用 isPlaying 判断,是因为 preload="none" 下点了播放还要先下载
     一小段,这段时间里如果海报先躲开,展示栏会先黑一下再亮,很难看。 */
  const [started, setStarted] = useState(false);
  const tickRef = useRef(null);
  const videoRef = useRef(null);

  const current = aigcVideos[selected];
  const hasVideo = Boolean(current.videoSrc);
  const durationSeconds = parseDuration(current.duration);

  // 换一部作品:只把播放器切到这一部的海报,不自动播放。
  // (原来这里会 setIsPlaying(true),也就是"点一下 CD 卡片就开演",
  //  按需求改成"先出海报/片头,点了播放按钮才开始"。)
  function selectVideo(index) {
    setSelected(index);
    setElapsed(0);
    setIsPlaying(false);
    setStarted(false);
  }

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  // 没有视频文件的条目,退回到计时器模拟进度条
  useEffect(() => {
    if (hasVideo || !isPlaying) return;
    tickRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= durationSeconds) {
          setIsPlaying(false);
          return durationSeconds;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [hasVideo, isPlaying, durationSeconds]);

  // 视频存在时:isPlaying 变化会同步控制 <video> 播放/暂停
  useEffect(() => {
    if (!hasVideo) return;
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  }, [hasVideo, isPlaying, selected]);

  useEffect(() => {
    setElapsed(0);
  }, [selected]);

  // 音量同步到 <video>;没有视频的条目会安全跳过
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume, selected]);

  function goRelative(delta) {
    const next = (selected + delta + aigcVideos.length) % aigcVideos.length;
    selectVideo(next);
  }

  function handleSeek(e) {
    const next = Number(e.target.value);
    setElapsed(next);
    if (hasVideo && videoRef.current) videoRef.current.currentTime = next;
    // 直接拖进度条 = 想直接看某个时间点的画面,这时候把海报撤掉。
    // 不然海报盖着,拖了完全没有视觉反馈,会以为进度条坏了。
    if (hasVideo) setStarted(true);
  }

  function toggleMute() {
    if (volume > 0) {
      setMutedVolume(volume);
      setVolume(0);
    } else {
      setVolume(mutedVolume || 1);
    }
  }

  const progressPct = durationSeconds ? Math.min(100, (elapsed / durationSeconds) * 100) : 0;
  const remaining = Math.max(0, durationSeconds - elapsed);

  return (
    <section id="media" className="section aigc-section">
      <div className="container">
        {/* 原来这里右侧还有一块 meta(2 部 / 23 分 48 秒 / 2026),内容跟
            底部 footer 完全重复,而且标题改成中文以后只有三百来像素宽,
            中间会空掉一大段。整块删掉,标题栏收成单列左对齐。 */}
        <div className="aigc-header">
          <div className="section-eyebrow">
            <span className="dot" />
            {aigcIntro.eyebrow}
          </div>
          <h2 className="section-title aigc-title">
            {aigcIntro.title}
            <span className="cjk">{aigcIntro.sub}</span>
          </h2>
        </div>

        <div className="aigc-layout">
          {/* 播放器放大的时候,这一列整体虚焦(模糊 + 变暗、竖着排成
              一列、间距拉均匀),把视觉重心让给中间放大的播放器;
              自己选中的那张、或者鼠标移上去的那张会恢复清晰,
              还是可以正常点击切换。 */}
          <div className={`aigc-grid${isExpanded ? " is-unfocused" : ""}`}>
            {aigcVideos.map((v, i) => {
              const isSelected = i === selected;
              return (
                <motion.button
                  key={v.id}
                  className={`aigc-disc${isSelected ? " is-selected" : ""}`}
                  onClick={() => selectVideo(i)}
                  whileHover={{ y: -14, rotate: 3, scale: 1.04 }}
                  whileTap={{ scale: 0.97, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  style={{ transformOrigin: "50% 100%" }}
                >
                  <span className="aigc-disc-case" style={{ aspectRatio: v.caseAspect }}>
                    <img className="aigc-disc-case-bg" src={v.cover} alt="" aria-hidden="true" {...deferredImageProps} />
                    {/* 圆盘不再旋转:原来这里用 motion.img 在播放时持续
                        旋转(animate rotate 360),现在只是一张静态图。
                        class 名保留了 .aigc-disc-spin,是因为 disc / cover
                        是模板里两个独立字段,以后想换成不同的盘面图,
                        只改数据里的 disc 即可,不用动组件。 */}
                    <img
                      className="aigc-disc-spin"
                      src={v.disc}
                      alt={`${v.titleCn}海报`}
                      {...deferredImageProps}
                    />
                  </span>
                  <span className="aigc-disc-id mono-label">{v.code}</span>
                  <span className="aigc-disc-info">
                    <span className="aigc-disc-title">{v.titleEn}</span>
                    <span className="aigc-disc-duration mono-label">{v.duration}</span>
                  </span>
                  <span className="mono-label aigc-disc-tags">{v.tags.join(" / ")}</span>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
            className={`aigc-player glass${isExpanded ? " is-expanded" : ""}`}
          >
            <div className="aigc-player-head">
              {/* 不再自动播放之后,这里说「当前播放」就不准了(可能是暂停/
                  还没开始),改成「当前作品」。 */}
              <span className="mono-label">当前作品 {current.id.replace("video-", "")}</span>
              <span className="mono-label aigc-player-tags">{current.tags.join(" / ")}</span>
            </div>

            <div className="aigc-player-screen-wrap">
              <button className="aigc-player-screen" onClick={togglePlay} aria-label="播放 / 暂停">
                {hasVideo ? (
                  <video
                    key={current.id}
                    ref={videoRef}
                    src={current.videoSrc}
                    poster={current.poster || current.cover}
                    playsInline
                    {...deferredVideoProps}
                    onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
                    // 真正出画了才撤掉海报 —— 点播放到出第一帧之间的下载
                    // 等待时间,展示栏里一直是这张海报
                    onPlaying={() => setStarted(true)}
                    // 镜像源加载失败(比如镜像站挂了)时,自动切到
                    // videoSrcFallback(github.io 同源地址)再试一次。
                    // dataset 标记防止两个源都失败时无限循环。
                    onError={(e) => {
                      const video = e.currentTarget;
                      if (video.dataset.fallbackApplied) return;
                      if (!current.videoSrcFallback) return;
                      video.dataset.fallbackApplied = "1";
                      video.src = current.videoSrcFallback;
                      video.load();
                      if (isPlaying) video.play().catch(() => {});
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      setElapsed(durationSeconds);
                    }}
                  />
                ) : (
                  <img src={current.poster || current.cover} alt={current.titleEn} {...deferredImageProps} />
                )}
                {/* 没起播前盖在画面上的海报(单独一层图,不是 <video poster>:
                    poster 属性只在"从没播过"时有效,暂停/换片之后压不住
                    已经解出来的画面)。空 src 的条目(numbered 占位)不重复
                    盖,上面那个 <img> 已经是海报了。 */}
                {hasVideo && (
                  <img
                    className={`aigc-player-poster${started ? " is-hidden" : ""}`}
                    src={current.poster || current.cover}
                    alt=""
                    aria-hidden="true"
                    {...deferredImageProps}
                  />
                )}
                {!isPlaying && (
                  <span className="aigc-player-playhint">
                    <span className="aigc-play-btn">
                      <span className="aigc-play-triangle" />
                    </span>
                  </span>
                )}
                {/* 点了播放、到真正出第一帧之间(video 还在下载,正片有一两百
                    MB),展示栏里保持海报 + 转一圈,不会看着像点坏了。 */}
                {isPlaying && !started && (
                  <span className="aigc-player-loading" aria-hidden="true">
                    <span className="aigc-loading-ring" />
                  </span>
                )}
              </button>
              <button
                type="button"
                className="aigc-expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((v) => !v);
                }}
                aria-label={isExpanded ? "退出放大模式" : "居中放大播放"}
              >
                {isExpanded ? <CloseIcon /> : <ExpandIcon />}
              </button>
            </div>

            <div className="aigc-player-deck">
              <div className="aigc-scrub-row">
                <span className="mono-label aigc-scrub-time">{formatTime(elapsed)}</span>
                <input
                  className="aigc-scrub-input"
                  type="range"
                  min={0}
                  max={durationSeconds || 0}
                  step={0.1}
                  value={Math.min(elapsed, durationSeconds || 0)}
                  onChange={handleSeek}
                  style={{ "--pct": `${progressPct}%` }}
                  aria-label="播放进度"
                />
                <span className="mono-label aigc-scrub-time aigc-scrub-time-remaining">
                  -{formatTime(remaining)}
                </span>
              </div>

              <div className="aigc-player-buttons">
                <button aria-label="上一条" onClick={() => goRelative(-1)}>
                  <span className="aigc-icon-prev" />
                </button>
                <button className="aigc-player-toggle" aria-label="播放 / 暂停" onClick={togglePlay}>
                  {isPlaying ? <span className="aigc-icon-pause" /> : <span className="aigc-icon-play" />}
                </button>
                <button aria-label="下一条" onClick={() => goRelative(1)}>
                  <span className="aigc-icon-next" />
                </button>
              </div>

              <div className="aigc-volume-row">
                <button className="aigc-icon-btn" aria-label="静音" onClick={toggleMute}>
                  <span className="aigc-icon-speaker" />
                </button>
                <input
                  className="aigc-volume-input"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ "--pct": `${volume * 100}%` }}
                  aria-label="音量"
                />
                <button className="aigc-icon-btn" aria-label="音量最大" onClick={() => setVolume(1)}>
                  <span className="aigc-icon-speaker aigc-icon-speaker--loud" />
                </button>
              </div>
            </div>

            <div className="aigc-player-footer">
              <div>
                <div className="aigc-player-title">{current.titleEn}</div>
                <div className="mono-label aigc-player-subtags">{current.tags.join(" / ")}</div>
              </div>
              {/* 只有数据里给了 link 才显示外链按钮。原来硬编码指向 #work
                  (精选作品板块),对这里的片子来说是错的落点,所以改成可选:
                  没有 link 就完全不渲染,不要一个点不出东西的按钮。 */}
              {current.link && (
                <a
                  href={current.link}
                  className="btn btn-solid aigc-player-cta"
                  {...(current.link.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  查看作品
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* 放大模式的深色蒙层,盖住整个页面,点一下蒙层也能退出放大 */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="aigc-expand-backdrop"
                className="aigc-expand-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setIsExpanded(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="aigc-footer mono-label">
          <span>收录 {aigcVideos.length} 部作品</span>
          <span>{siteInfo.nameCn} — 影视作品</span>
          <span>{aigcIntro.year}</span>
        </div>
      </div>
    </section>
  );
}