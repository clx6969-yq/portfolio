const categories = [
  ["men", "男装", "MENSWEAR"],
  ["women", "女装", "WOMENSWEAR"],
  ["kids", "童装", "KIDSWEAR"],
  ["accessories", "配件", "ACCESSORIES"],
  ["graphics", "图案", "GRAPHICS"],
];

function makeItems(categoryId) {
  return Array.from({ length: 6 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const tone = (index % 2) + 1;
    return {
      id: `${categoryId}-project-${number}`,
      title: `PROJECT ${number}`,
      titleCn: `服装项目示例 ${number}`,
      tag: "COLLECTION / LOOKBOOK",
      cover: publicAsset(`/placeholders/portrait-0${tone}.svg`),
      images: [1, 2, 3].map((imageIndex) => ({
        src: publicAsset(`/placeholders/${imageIndex % 2 ? "portrait-01" : "portrait-02"}.svg`),
        label: `LOOK ${String(imageIndex).padStart(2, "0")}`,
      })),
    };
  });
}

export const fashionCategories = categories.map(([id, label, labelEn]) => ({
  id,
  label,
  labelEn,
  pageSize: 6,
  items: makeItems(id),
}));
import { publicAsset } from "../utils/publicAsset.js";
