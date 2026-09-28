import assert from "node:assert/strict";
import test from "node:test";
import { siteInfo, sections } from "../src/data/siteConfig.js";
import { profile } from "../src/data/profileData.js";
import { contactInfo } from "../src/data/contactData.js";
import { overviewItems } from "../src/data/overviewData.js";
import { ipProjects } from "../src/data/ipProjects.js";
import { illustrations } from "../src/data/illustrationData.js";
import { brandProjects } from "../src/data/brandProjects.js";
import { fashionCategories } from "../src/data/fashionData.js";
import { characterProjects } from "../src/data/characterBuildData.js";
import { aigcVideos } from "../src/data/aigcVideoData.js";

test("identity and downloads are safe defaults", () => {
  assert.equal(siteInfo.nameEn, "蔡灵潇");
  assert.equal(siteInfo.nameCn, "蔡灵潇");
  assert.equal(profile.nameEn, "蔡灵潇");
  assert.deepEqual(contactInfo.downloads, []);
  assert.equal(contactInfo.links[0].href, "mailto:2499844276@qq.com");
});

test("all sections and demo collections remain represented", () => {
  // sections 数组顺序按 siteConfig.js 当前内容为准 —— 之前把"影视创作"
  // 提到个人简介后面、IP 联名挪到内容运营之后,这里跟着 sections 的实际
  // 顺序做断言。改 sections 顺序时,这条测试也要同步改,否则 CI 会红。
  assert.deepEqual(sections.map(({ id }) => id), [
    "hero", "work", "about", "media", "brand", "ip",
    "illustration", "fashion", "character-build", "outro",
  ]);
  // 模板原本每个集合都断言 ≥ 3 项,但真人作品集里:
  //   aigcVideos   = 2 部(《己》+《活路》)
  //   ipProjects   = 3 件刚好
  //   illustrations/characterProjects   对应板块默认 enabled:false,
  //     数据里的占位条目数不等于"实际公开作品数"
  // 这里统一放宽成"至少有 1 条数据,且 id 不重复",既保留了空集合检测
  // 能力,又跟实际作品数量解耦;以后作品数增减这条断言不用动。
  for (const collection of [overviewItems, ipProjects, illustrations, brandProjects, characterProjects, aigcVideos]) {
    assert.ok(collection.length >= 1, `集合 ${collection.constructor.name} 是空的`);
    assert.equal(new Set(collection.map(({ id }) => id)).size, collection.length, "集合内 id 重复");
  }
  assert.ok(fashionCategories.length >= 1);
});

test("every public demo asset uses the generated placeholder namespace", () => {
  const json = JSON.stringify({ overviewItems, ipProjects, illustrations, brandProjects, fashionCategories, characterProjects, aigcVideos });
  const paths = [...json.matchAll(/"(\/[^"?]+\.(?:svg|png|jpe?g|webp|mp4|mov|pdf))"/gi)].map((match) => match[1]);
  assert.ok(paths.length > 20);
  // 模板自带的示例内容只许引用 /placeholders/ 下生成的占位图。
  // 真人真事的素材单独放一个目录,这里按目录前缀放行 —— 仍然拦得住
  // 来路不明的路径。当前三个目录:
  //   /brand/      品牌项目里那几张企业线上的站截图
  //   /catalog/   首页"项目目录"那 4 张卡的封面
  //   /ip/        IP 联名板块全部素材(封面 / 海报 / PPT 页面图 / IP 形象立绘)
  const realAssetDirs = ["/brand/", "/catalog/", "/ip/"];
  const stray = paths.filter(
    (value) => !value.startsWith("/placeholders/") && !realAssetDirs.some((dir) => value.startsWith(dir))
  );
  assert.deepEqual(stray, [], `出现了不在占位图或真实素材目录下的路径: ${stray.join(", ")}`);
});
