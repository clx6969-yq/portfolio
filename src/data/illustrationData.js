export const illustrations = Array.from({ length: 12 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const portrait = index % 3 !== 0;
  return {
    id: `illustration-${number}`,
    title: `插画示例 ${number}`,
    titleEn: `ILLUSTRATION ${number}`,
    image: publicAsset(`/placeholders/${portrait ? "portrait" : "landscape"}-0${(index % 2) + 1}.svg`),
    width: portrait ? 1000 : 1600,
    height: portrait ? 1400 : 1000,
    extraImages: [
      publicAsset("/placeholders/landscape-01.svg"),
      publicAsset("/placeholders/landscape-02.svg"),
    ],
  };
});
import { publicAsset } from "../utils/publicAsset.js";
