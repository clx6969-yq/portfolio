import { useEffect, useRef, useState } from "react";
import { markEntered } from "../utils/introGate";
import { priorityVideoProps } from "../utils/mediaPriority";
import { publicAsset } from "../utils/publicAsset";
import "./IntroScreen.css";

/**
 * 开屏动画("先加载、再按 START 才能进网站")
 * ------------------------------------------------------------
 * 打开网页先播放模板提供的抽象开机视频。
 * 3秒之后画面中间会出现一个一直在轻轻跳动的圆形 START 按钮,
 * 点一下就正式进入网站;不点的话,过一小会儿也会自动帮你进入,
 * 不会卡住不动。
 *
 * 首页视频真正开始播放、标题打字机真正开始敲字,都是等这个开屏
 * 动画结束的那一刻才触发的(见 utils/introGate.js + Hero.jsx),
 * 这样保证用户真正看到首页的时候,效果是从头开始的,不会因为开屏
 * 动画播了几秒,首页背后已经偷偷播完了。
 */

// 打开页面后多久出现 START 按钮(用户要求:3秒后出现)
const BUTTON_DELAY_MS = 3000;
// START 按钮出现之后,再过多久没人点就自动进入网站
const AUTO_ENTER_DELAY_MS = 3000;
// 点击/自动触发之后,退场动画放多久再真正把这一屏卸载掉
const EXIT_ANIM_MS = 550;

export default function IntroScreen({ onDismiss }) {
  const [phase, setPhase] = useState("loading"); // loading -> ready -> exit
  const finishedRef = useRef(false);
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  // 3秒后切到"可以按 START"的状态
  useEffect(() => {
    const timer = setTimeout(() => setPhase("ready"), BUTTON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // START 按钮出现之后,没人点的话,过一会儿自动进入
  useEffect(() => {
    if (phase !== "ready") return;
    const timer = setTimeout(finishIntro, AUTO_ENTER_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finishIntro() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    // 从这一刻起,首页视频 + 打字机就可以开始了(退场动画还在放,
    // 有一点点重叠,过渡会更顺滑,不会显得是硬切)
    markEntered();
    setPhase("exit");
    setTimeout(() => onDismiss?.(), EXIT_ANIM_MS);
  }

  return (
    <div className={`intro-screen${phase === "exit" ? " is-exiting" : ""}`}>
      {/* 抽象占位视频循环播放,替换路径即可换成自己的素材。 */}
      <video
        ref={videoRef}
        className="intro-bg-video"
        muted
        playsInline
        loop
        {...priorityVideoProps}
      >
        <source src={publicAsset("/videos/site-bg.mp4")} type="video/mp4" />
      </video>

      <div className="intro-flash" aria-hidden="true" />
      <div className="intro-ambient-scanlines" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />

      {phase === "ready" && (
        <button
          type="button"
          className="intro-start-btn"
          onClick={finishIntro}
        >
          <span className="intro-start-glass" aria-hidden="true" />
          开始
        </button>
      )}

      {/* 原来 START 按钮出现之后,下面还有一行「点击进入 · 或稍候自动进入」
          的操作提示,按「页面上不要出现指导用户怎么操作的提示文案」去掉;
          「初始化中」是加载状态反馈,不是操作提示,保留。 */}
      {phase === "loading" && <div className="intro-caption mono-label">初始化中</div>}
    </div>
  );
}
