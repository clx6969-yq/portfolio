// 统一管理媒体资源的加载优先级：开屏和首页视频优先，页面后半段的
// 视频与图片等用户滚到附近或主动操作时再下载。
export const priorityVideoProps = Object.freeze({ preload: "auto" });

export const deferredVideoProps = Object.freeze({ preload: "none" });

export const deferredImageProps = Object.freeze({
  loading: "lazy",
  decoding: "async",
});
