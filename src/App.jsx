import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import IntroScreen from "./components/IntroScreen";
import Hero from "./components/Hero";
import About from "./components/About";
import FeaturedOverview from "./components/FeaturedOverview";
import IpSlider from "./components/IpSlider";
import IllustrationMasonry from "./components/IllustrationMasonry";
import BrandGrid from "./components/BrandGrid";
import FashionTabs from "./components/FashionTabs";
import CharacterBuild from "./components/CharacterBuild";
import AigcVideoLibrary from "./components/AigcVideoLibrary";
import OutroVideo from "./components/OutroVideo";
import SiteFooter from "./components/SiteFooter";
import AiPager from "./components/AiPager";
import { hasEntered, shouldMountSiteContent } from "./utils/introGate";
import { sections } from "./data/siteConfig";
import { publicAsset } from "./utils/publicAsset";

const COMPONENT_MAP = {
  hero: Hero,
  work: FeaturedOverview,
  about: About,
  ip: IpSlider,
  illustration: IllustrationMasonry,
  brand: BrandGrid,
  fashion: FashionTabs,
  "character-build": CharacterBuild,
  media: AigcVideoLibrary,
  outro: OutroVideo,
};

function jumpToTopInstantly() {
  const html = document.documentElement;

  // URL 里有 #xxx 的话,即使我们滚到顶,刷新或刚进入时浏览器也
  // 会自动滚到那个锚点。直接清掉,确保从 hero 最顶端开始。
  if (window.location.hash) {
    try {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    } catch {
      /* 部分环境(history 被禁)静默忽略 */
    }
  }

  // 主滚动容器是哪个?body / html 都试一遍,跨浏览器更稳。
  function scrollNow() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  // 立刻一次 + 下一帧 + 50ms 后 + 200ms 后,覆盖掉内容挂载、
  // 图片占位变化、字体回流等任何后续布局抖动。
  scrollNow();
  requestAnimationFrame(scrollNow);
  setTimeout(scrollNow, 50);
  setTimeout(scrollNow, 200);
}

export default function App() {
  const [entered, setEntered] = useState(() => hasEntered());

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return undefined;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    jumpToTopInstantly();
  }, []);

  // 退出开屏之后强制滚到顶部,避免浏览器保留了上次访问的滚动位置,
  // 导致用户点 START 后被"卡"在页面中间看不到 hero 标题。
  useEffect(() => {
    if (!entered) return;
    jumpToTopInstantly();
  }, [entered]);

  useEffect(() => {
    if (entered) return undefined;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [entered]);

  if (!shouldMountSiteContent(entered)) {
    // 在退出开屏、内容即将挂载之前,先把滚动位置硬归零——
    // 这样 main 挂载时页面已经在最顶端,不会被"先按当前位置渲染、
    // 再被 useEffect 滚回去"的中间态闪到。
    return (
      <IntroScreen
        onDismiss={() => {
          jumpToTopInstantly();
          setEntered(true);
        }}
      />
    );
  }

  return (
    <>
      {/* 全站背景图:固定铺满视口、压在内容下面(z-index:-1),
          样式在 index.css 的 .site-backdrop 里;图片路径走 publicAsset(),
          子路径部署时也能指向正确的位置。 */}
      <div
        className="site-backdrop"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${publicAsset(
            "/placeholders/backgrounds/summer-meadow.jpg"
          )})`,
        }}
      />
      <Nav />
      <main>
        {sections.map(({ id, enabled }) => {
          const Component = COMPONENT_MAP[id];
          return enabled && Component ? <Component key={id} /> : null;
        })}
      </main>
      <SiteFooter />
      <AiPager />
    </>
  );
}
