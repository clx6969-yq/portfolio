import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shell metadata is generic and components read identity from data", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const footer = await readFile(new URL("../src/components/SiteFooter.jsx", import.meta.url), "utf8");
  const pager = await readFile(new URL("../src/components/AiPager.jsx", import.meta.url), "utf8");
  assert.match(html, /蔡灵潇 · 个人作品集/);
  assert.match(footer, /siteInfo/);
  assert.match(pager, /siteInfo/);
  const contactPattern = new RegExp(["mail", "to"].join("") + ":[^\"']+|" + ["t", "el"].join("") + ":\\+?\\d+");
  assert.doesNotMatch(`${html}\n${footer}\n${pager}`, contactPattern);
});

test("hero typing restarts after React strict-mode effect cleanup", async () => {
  const hero = await readFile(
    new URL("../src/components/Hero.jsx", import.meta.url),
    "utf8"
  );
  assert.match(hero, /typingStartedRef\.current\s*=\s*false/);
});
