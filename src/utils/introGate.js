/**
 * "进场动画"开关
 * ------------------------------------------------------------
 * 开屏动画(IntroScreen)播完 / 用户点了 START 之后,才算真正"进入
 * 网站"。首页视频要等到这一刻才开始播放、打字机效果也要等到这一刻
 * 才开始敲字——不然用户还在看开屏动画的时候,首页视频和打字已经在
 * 背后偷偷播完了,等真正看到首页时效果全没了。
 *
 * 这里用一个很简单的"发布/订阅"模式:谁想在"进入网站"那一刻做点
 * 什么(比如 Hero.jsx 里开始播视频),就调用 onEnter(callback)
 * 注册一下;真正进入的时候只要调用一次 markEntered() 就行。
 */

let entered = false;
const listeners = new Set();

// 开屏还没结束时不要挂载整站。否则 Hero、AIGC、结尾视频和作品图
// 会躲在开屏下面同时抢网络，反而让最先要看的开场视频加载更慢。
export function shouldMountSiteContent(isEntered) {
  return Boolean(isEntered);
}

export function hasEntered() {
  return entered;
}

export function markEntered() {
  if (entered) return;
  entered = true;
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* 单个回调出错不应该影响其它回调 */
    }
  });
  listeners.clear();
}

// 如果已经进入过了,回调会立刻执行一次;否则先记下来,
// 等 markEntered() 被调用的时候再触发。返回一个取消订阅的函数。
export function onEnter(callback) {
  if (entered) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}
