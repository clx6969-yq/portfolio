import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("README contains the complete beginner path and privacy warning", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  for (const phrase of [
    "npm install",
    "npm run dev",
    "npm run verify",
    "src/data/",
    "public/placeholders/",
    "Vercel",
    "Netlify",
    "GitHub Pages",
    "隐私",
  ]) {
    assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("public contribution and environment files avoid secrets and private assets", async () => {
  const [contributing, environment] = await Promise.all([
    readFile(new URL("../CONTRIBUTING.md", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(contributing, /npm run verify/);
  assert.match(contributing, /personal|个人/i);
  assert.match(contributing, /copyright|版权/i);
  assert.equal(environment.trim(), "VITE_SITE_URL=https://example.com");
});
