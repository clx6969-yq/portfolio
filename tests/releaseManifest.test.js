import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

test("tracked files exclude private and generated workspace material", () => {
  const files = execFileSync("git", ["ls-files", "-z"])
    .toString()
    .split("\0")
    .filter(Boolean);
  const blocked = files.filter((file) =>
    /(^|\/)(node_modules|dist|\.vercel|source-assets|private-assets)(\/|$)|^docs\/superpowers\/|\.DS_Store$|^qa-/.test(
      file
    )
  );
  assert.deepEqual(blocked, []);
});

test("commit identity is neutral", () => {
  const authors = execFileSync("git", ["log", "--format=%an <%ae>"])
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);
  assert.ok(authors.length > 0, "仓库里还没有任何 commit");

  // 允许两种中性身份:
  //   1. 模板自带的中性身份(模板作者用)
  //   2. GitHub 官方隐私邮箱 —— 形如
  //      "12345678+你的用户名@users.noreply.github.com"(新格式)或
  //      "你的用户名@users.noreply.github.com"(老格式)
  // 其余的(比如 QQ / 163 / Gmail 私人邮箱)一律报红,提示你去
  // git config 换成 GitHub 隐私邮箱 —— 那才是真正防爬的写法。
  const neutral = /(?:template-maintainer@users\.noreply\.github\.com|(?:\d+\+)?[A-Za-z0-9-]+@users\.noreply\.github\.com)/i;
  const suspicious = authors.filter((value) => !neutral.test(value));
  assert.deepEqual(
    suspicious,
    [],
    `commit 作者不是中性身份,可能泄露私人邮箱:\n${suspicious.join("\n")}\n` +
      `→ 改成 GitHub 隐私邮箱后重新提交:git config user.email "<数字ID>+<用户名>@users.noreply.github.com"`
  );
});

test("dist scan keeps built-in PII rules without minifier denylist collisions", () => {
  const verifier = readFileSync("scripts/verify-release.mjs", "utf8");
  assert.match(verifier, /PRIVATE_DENYLIST_FILE:\s*""/);
});

test("release gate scans every reachable Git commit", () => {
  const verifier = readFileSync("scripts/verify-release.mjs", "utf8");
  assert.match(verifier, /privacy-history-check\.mjs/);
});
