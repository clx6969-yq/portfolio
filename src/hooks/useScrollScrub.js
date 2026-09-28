import { useEffect, useRef, useState } from "react";

// 视频结尾要循环播放的秒数(需求:播完后,最后3秒反复循环)
const LOOP_TAIL_SECONDS = 3;

/**
 * useScrollScrub
 * ------------------------------------------------------------
 * 分两个阶段:
 * 1)"拖动播放"阶段 —— 在可滚动区域的前一部分(scrubRatio 比例),
 *    滚动多少就把视频拨到对应的进度,往上滚就往回拨。
 * 2)"停靠循环"阶段 —— 滚动到这段区域的后半部分之后,不再跟手拖动,
 *    而是让视频自己正常播放,快到结尾时跳回倒数第 3 秒,反复循环,
 *    直到用户往回滚动,才会退出循环、回到"拖动播放"的状态。
 */
export function useScrollScrub(regionRef, videoRef, options = {}) {
  const scrubRatio = options.scrubRatio ?? 0.72;
  const [progress, setProgress] = useState(0);
  const [settled, setSettled] = useState(false);
  const rafId = useRef(null);
  const targetProgress = useRef(0);
  const targetSettled = useRef(false);
  const durationRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => {
      durationRef.current = video.duration || 0;
    };
    video.addEventListener("loadedmetadata", onLoaded);
    if (video.readyState >= 1) durationRef.current = video.duration || 0;
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (settled) {
      const duration = durationRef.current || video.duration || 0;
      if (duration > LOOP_TAIL_SECONDS && video.currentTime < duration - LOOP_TAIL_SECONDS - 0.2) {
        video.currentTime = duration - LOOP_TAIL_SECONDS;
      }
      video.play?.().catch(() => {});

      const onTimeUpdate = () => {
        const d = video.duration || durationRef.current;
        if (d && video.currentTime >= d - 0.15) {
          video.currentTime = Math.max(d - LOOP_TAIL_SECONDS, 0);
        }
      };
      video.addEventListener("timeupdate", onTimeUpdate);
      return () => video.removeEventListener("timeupdate", onTimeUpdate);
    }

    video.pause?.();
    return undefined;
  }, [settled, videoRef]);

  useEffect(() => {
    function handleScroll() {
      const region = regionRef.current;
      if (!region) return;

      const rect = region.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;

      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const scrubEnd = total * scrubRatio;

      targetProgress.current = Math.min(scrolled / scrubEnd, 1);
      targetSettled.current = scrolled >= scrubEnd;

      if (!rafId.current) rafId.current = requestAnimationFrame(tick);
    }

    function tick() {
      rafId.current = null;
      setProgress(targetProgress.current);
      setSettled(targetSettled.current);

      const video = videoRef.current;
      if (video && video.duration && !targetSettled.current) {
        const t = Math.min(targetProgress.current * video.duration, video.duration - 0.05);
        if (Number.isFinite(t)) {
          try {
            video.currentTime = t;
          } catch (e) {
            /* seek 太快偶尔会报错,忽略即可 */
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [regionRef, videoRef, scrubRatio]);

  return { progress, settled };
}
