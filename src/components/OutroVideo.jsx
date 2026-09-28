import { contactInfo } from "../data/contactData";
import "./OutroVideo.css";

/**
 * 结尾 / 联系方式
 * ------------------------------------------------------------
 * 原本这里是"滚动 = 播放视频"的演示屏:section 被拉成 300vh 高,
 * 视频用 sticky 贴在屏幕不动,跟着滚轮进度一帧一帧播放,中间
 * 滚到最后会浮出一张平板设备 UI(联系方式卡)。
 *
 * 改为静态章节的理由:演示视频整体是亮绿色调,跟全站的晴空蓝
 * + 草地调子完全不在一个色系里 —— 上一页是 --bg-veil 的浅蓝
 * 白底,到这里突然切成视频里的绿色,中间不经过任何过渡,色调
 * 跳得很突兀,所以不再用视频了。
 *
 * 现在:背景透全站背景图(summer-meadow 那张,fixed z-index:-1
 * 的固定图层)+ --bg-veil 的天光白纱,跟其它正文章节完全一致;
 * 中间居中放一张玻璃卡(联系方式),替代原来那张"平板 UI"。
 *
 * 联系方式表单行还是直接读 contactInfo.rows —— 卡片里只显示邮箱,
 * 跟原来的平板 UI 行为一致(若以后 links 数组补全其它联系方式,
 * 会自动以网格多列铺开)。
 */
export default function OutroVideo() {
  const mailLink =
    contactInfo.links.find((link) => link.label === "邮箱") ||
    contactInfo.links[0];

  return (
    <section id="outro" className="section outro-region">
      <div className="container outro-content">
        <header className="outro-head">
          <div className="outro-eyebrow mono-label">
            <span className="dot" aria-hidden="true" />
            07 — 结尾 / 联系方式
          </div>
          <h2 className="outro-headline">
            {contactInfo.headlineEn}
            <br />
            {contactInfo.headlineEn2}
          </h2>
          <p className="outro-headline-cn">{contactInfo.headlineCn}</p>
        </header>

        <div className="outro-contact-card glass-strong">
          <div className="outro-device-ui-eyebrow mono-label">联系方式</div>
          <div className="outro-device-ui-headline">
            一起做点
            <span className="outro-device-ui-accent">有意思的内容</span>
          </div>
          <p className="outro-device-ui-sub">{contactInfo.subCn}</p>
          <div className="outro-device-ui-rows">
            {contactInfo.rows.map((row) => (
              <a
                key={row.label}
                href={row.href || "#outro"}
                className="outro-device-ui-row glass"
                // row.download 有值的话(比如"简历 CV"这一条)就是真的
                // 文件下载链接,加上 download 属性,点击直接存文件到本地,
                // 不会跳转/打开新标签页。
                {...(row.download ? { download: row.download } : {})}
              >
                <span className="mono-label">{row.label}</span>
                <span className="outro-device-ui-value">{row.value}</span>
              </a>
            ))}
          </div>
          <a
            href={mailLink?.href || "#outro"}
            className="btn btn-solid outro-device-ui-cta"
          >
            立即联系我
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}