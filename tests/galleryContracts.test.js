import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = ["FeaturedOverview", "IpSlider", "IllustrationMasonry", "BrandGrid"];

test("gallery modules consume centralized data and contain no remote demo images", async () => {
  for (const name of files) {
    const source = await readFile(new URL(`../src/components/${name}.jsx`, import.meta.url), "utf8");
    assert.match(source, /\.\.\/data\//);
    assert.doesNotMatch(source, /picsum\.photos|unsplash\.com|images\.pexels\.com/);
  }
});
