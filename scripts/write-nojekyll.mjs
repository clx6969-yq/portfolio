// 在 dist/ 根目录写一个空的 .nojekyll 文件。
//
// 为什么走这一道:
//   部署到 GitHub Pages 时,Pages 默认会按 Jekyll 处理 dist/,
//   Jekyll 会忽略任何以 "_" 开头的文件和目录。我们这份作品集里有
//   /fonts/ 等下划线开头的目录会被误吞;放一个空的 .nojekyll
//   进去就告诉 Pages"这里不用 Jekyll",整份 dist 原样发布。
//
// 为什么不直接放在 public/.nojekyll:
//   vite 在 build 时会清空 dist/(把已有文件 trash),空文件 + Windows
//   上的 trash 偶尔会撞到权限问题,报错 "Some operations were aborted"
//   让 build 失败。改成 build 之后再写 .nojekyll,vite 不再需要清
//   它,问题就消失了。
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(process.cwd(), "dist/.nojekyll");
writeFileSync(target, "");
console.log(`Wrote ${target}`);