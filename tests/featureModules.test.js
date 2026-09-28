import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fashionCategories } from "../src/data/fashionData.js";
import { characterProjects } from "../src/data/characterBuildData.js";
import { aigcVideos } from "../src/data/aigcVideoData.js";

test("all feature-module assets resolve inside the generated namespace", async () => {
  const paths = [
    ...fashionCategories.flatMap(({ items }) => items.flatMap(({ cover, images = [] }) => [cover, ...images.map(({ src }) => src)])),
    ...characterProjects.flatMap(({ cover, views = [], video, poster }) => [cover, poster, video, ...views.map(({ image }) => image)]),
    ...aigcVideos.flatMap(({ poster, video }) => [poster, video]),
  ].filter(Boolean);
  assert.ok(paths.length > 20);
  assert.ok(paths.every((value) => value.startsWith("/placeholders/")));
  await Promise.all([...new Set(paths)].map((value) => access(new URL(`../public${value}`, import.meta.url))));
});

test("opening media stays below four megabytes", async () => {
  const info = await stat(new URL("../public/placeholders/videos/intro-boot.webm", import.meta.url));
  assert.ok(info.size <= 4_000_000);
});

test("fashion details keep repeated placeholder paths as distinct React items", async () => {
  const source = await readFile(
    new URL("../src/components/FashionDetail.jsx", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source, /key=\{img\.src\}/);
});

test("motion library derives its footer identity from generic site data", async () => {
  const source = await readFile(
    new URL("../src/components/AigcVideoLibrary.jsx", import.meta.url),
    "utf8"
  );
  assert.match(source, /siteInfo\.nameCn/);
  assert.doesNotMatch(source, /LIN\s+SHEN/i);
});
