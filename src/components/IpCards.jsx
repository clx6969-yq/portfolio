import { ipProjects } from "../data/ipProjects";
import "./IpCards.css";

/**
 * IP 联名 —— 三张完整卡片
 * ------------------------------------------------------------
 * 原来是 AccordionGallery 手风琴(靠"书脊")展示,实测有两个问题:
 *   1) 没展开的那些只剩 80px 宽,封面被裁得只剩一条,看不出是什么;
 *   2) 书脊标签是深色半透明块 + 深墨蓝文字,叠在浅色海报上等于糊掉,
 *      十几字的竖排中文书名挤在两列里根本读不出来。
 * 所以换成三张等宽的完整卡片:封面按素材原本的 3:4 铺满(不裁),
 * 编号 / 标题 / 副标题 / 标签全部横排摆在封面下方的白底上,一眼看清。
 *
 * 点卡片仍然是"打开详情弹窗"——01 走原 PPT 全文那一档,02/03 走版式墙。
 */
export default function IpCards({ onSelect }) {
  return (
    <ul className="ip-cards">
      {ipProjects.map((project) => (
        <li key={project.id} className="ip-card">
          <button
            type="button"
            className="ip-card-btn"
            onClick={() => onSelect?.(project)}
            aria-label={`${project.index} ${project.titleCn}`}
          >
            <span className="ip-card-media">
              <img src={project.cover} alt={project.titleCn} loading="lazy" />
              <span className="ip-card-num">{project.index}</span>
            </span>

            <span className="ip-card-text">
              <span className="ip-card-kicker mono-label">{project.kicker}</span>
              <span className="ip-card-title">{project.title}</span>
              <span className="ip-card-sub">{project.titleCn}</span>
              <span className="ip-card-tag mono-label">{project.tag}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
