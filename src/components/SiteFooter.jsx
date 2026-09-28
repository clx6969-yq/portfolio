import "./SiteFooter.css";
import { siteInfo } from "../data/siteConfig";

/**
 * 网站最底部的版权条 —— 就一行字,不重复"结尾场景"里已经有的
 * 大标题/联系方式内容(那些已经在 OutroVideo 模块里了)。
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer mono-label">
      <span>© 2026 {siteInfo.nameCn}</span>
      <span>个人作品集 · 蔡灵潇</span>
    </footer>
  );
}
