export const characterBuildIntro = {
  eyebrow: "08 — CHARACTER BUILD",
  titleEn: "CHARACTER BUILD",
  titleCn: "角色形象搭建设计",
  tag: "CHARACTER SHEET / TURNAROUND / ORIGINAL DESIGN",
  note: ["点击卡片展开三视图", "替换为你的角色设定素材"],
};

export const characterProjects = Array.from({ length: 6 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const tone = (index % 2) + 1;
  return {
    id: `character-${number}`,
    name: `CHARACTER ${number}`,
    nameCn: `角色示例 ${number}`,
    tag: "ORIGINAL CHARACTER / STYLE STUDY",
    cover: publicAsset(`/placeholders/portrait-0${tone}.svg`),
    views: ["FRONT", "SIDE", "BACK"].map((label, viewIndex) => ({
      label,
      labelCn: ["正面", "侧面", "背面"][viewIndex],
      image: publicAsset(`/placeholders/portrait-0${(viewIndex % 2) + 1}.svg`),
    })),
    turntable: {
      video: publicAsset("/placeholders/videos/motion-study.webm"),
      poster: publicAsset("/placeholders/poster-video.svg"),
    },
    video: publicAsset("/placeholders/videos/motion-study.webm"),
    poster: publicAsset("/placeholders/poster-video.svg"),
  };
});
import { publicAsset } from "../utils/publicAsset.js";
