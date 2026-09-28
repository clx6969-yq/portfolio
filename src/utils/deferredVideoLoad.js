/**
 * Keep a deferred video out of the initial page download, then request it once
 * the owning section is close enough to the viewport for a seamless reveal.
 */
export function observeDeferredVideo({
  target,
  video,
  Observer = globalThis.IntersectionObserver,
  rootMargin = "1000px 0px",
}) {
  if (!target || !video) return () => {};

  let requested = false;
  let observer = null;

  function requestVideo() {
    if (requested) return;
    requested = true;
    video.preload = "auto";
    video.load();
    observer?.disconnect();
  }

  // IntersectionObserver is available in all supported browsers. Loading at
  // once is the safe fallback for older embedded browsers.
  if (typeof Observer !== "function") {
    requestVideo();
    return () => {};
  }

  observer = new Observer(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) requestVideo();
    },
    { rootMargin }
  );
  observer.observe(target);

  return () => observer?.disconnect();
}
