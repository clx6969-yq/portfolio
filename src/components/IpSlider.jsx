import { useCallback, useState } from "react";
import { ipProjects } from "../data/ipProjects";
import IpCards from "./IpCards";
import PosterGallery from "./PosterGallery";
import StrategyDetail from "./StrategyDetail";
import Lightbox from "./Lightbox";
import "./IpSlider.css";

/**
 * IP 联名策划板块
 * ------------------------------------------------------------
 * 经典结构:板块头 + 三张卡。三张卡的素材都是那份 23 页 PPT 里的原图:
 *   01 跨界联名总策划   —— 弹窗里整份引用原始 PPT(按页铺开,不写总结)
 *   02 联名周边与 IP 形象 —— 点开看周边与形象(版式墙)
 *   03 联名宣传主视觉    —— 点开看 6 张活动海报(版式墙)
 *
 * 展示层原来是 AccordionGallery 的手风琴书脊,但书脊没展开时只有 80px
 * 宽,封面被裁得看不出内容,深色标签块叠浅色海报也让标题读不出来,
 * 所以换成 IpCards 的三张完整卡片。
 *
 * 01 走 StrategyDetail(原方案全文);02/03 走 PosterGallery(混合比例版式墙)。
 * 两种弹窗共用深色遮罩 + 实心白面板 + 强调色描边,视觉一致。
 *
 * 灯箱(点开某张图放大)统一放在这一层渲染,不塞进弹窗里面 ——
 * 弹窗面板有 transform(framer-motion)和 overflow: hidden,
 * 里面再放 position: fixed 的灯箱会被裁掉。
 */
export default function IpSlider() {
  const [opened, setOpened] = useState(null);
  const [zoom, setZoom] = useState(null);

  // 打开的项是不是策略项(01),决定走哪个弹窗
  const isStrategy = opened?.id === "ip-project-01";

  /* 按 Esc / 点遮罩关闭时,分两层:先关灯箱,灯箱关掉了再关弹窗。
     不然在放大看图的时候按 Esc,会连下面那个弹窗一起关掉。 */
  const closeTop = useCallback(() => {
    if (zoom) {
      setZoom(null);
      return;
    }
    setOpened(null);
  }, [zoom]);

  return (
    <section id="ip" className="section">
      <div className="container">
        {/* 板块标题 —— 跟三张卡共享的入口标题 */}
        <header className="ip-section-head">
          <div className="section-eyebrow">
            <span className="dot" />
            06 — IP 联名策划
          </div>
          <h2 className="section-title">
            IP 联名与衍生设计
            <span className="cjk">跨界品牌联动 · 周边 / 主视觉 / 整合营销</span>
          </h2>
          {/* 原来这里有一段「点击书架上的任意一本展开详情 —— ……」的
              操作提示,按「页面上不要出现指导用户怎么操作的提示文案」
              的要求整段去掉。 */}
        </header>

        <div className="ip-cards-wrap">
          <IpCards onSelect={setOpened} />
        </div>
      </div>

      {/* 策略卡(01)走原方案全文弹窗;其它两张走图册弹窗 */}
      {isStrategy ? (
        <StrategyDetail item={opened} onClose={closeTop} onZoom={setZoom} />
      ) : (
        <PosterGallery item={opened} onClose={closeTop} onZoom={setZoom} />
      )}

      <Lightbox image={zoom?.src} title={zoom?.label} onClose={() => setZoom(null)} />
    </section>
  );
}
