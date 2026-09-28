import assert from "node:assert/strict";
import test from "node:test";
import { joinPublicBase, publicAsset } from "../src/utils/publicAsset.js";

test("public assets follow the configured Vite base path", () => {
  assert.equal(
    joinPublicBase("/editorial-portfolio-template/", "/placeholders/demo.svg"),
    "/editorial-portfolio-template/placeholders/demo.svg"
  );
  assert.equal(joinPublicBase("./", "/projects/demo.webp"), "./projects/demo.webp");
  assert.equal(publicAsset("/placeholders/demo.svg"), "/placeholders/demo.svg");
});
