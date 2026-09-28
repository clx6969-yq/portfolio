import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IGNORED_DIRS = new Set([".git", ".superpowers", "node_modules", "dist", ".vercel", "coverage"]);
const IGNORED_FILES = new Set([".privacy-denylist.local.txt"]);
// 已知安全的明文 token —— 扫描器遇到 RULES 命中后又出现在这里的字面量,
// 视为"有意公开陈列",不再报红。分三类:
//   1. 模板自带的占位示例
//   2. 作品集里公开陈列的真实联系方式(裸邮箱 / mailto: 前缀 / tel: 前缀)
//   3. 部署文档里必然出现的 GitHub SSH 地址 —— `git@github.com` 形式上
//      命中了 email 规则,但它是 Git 官方推荐写法,不是隐私信息
// ⚠️ 改联系方式时,这里要跟着同步更新,否则 verify 会重新报红。
const SAFE_VALUES = new Set([
  // 模板自带占位示例
  "hello@example.com",
  "template-maintainer@users.noreply.github.com",
  // 公开陈列的真实联系方式（作品集页面上人人可见）
  "2499844276@qq.com",
  "mailto:2499844276@qq.com",
  "15736554644",
  "tel:15736554644",
  // 部署文档里的 GitHub SSH 地址写法
  "git@github.com",
]);
const RULES = [
  ["email", /\b[A-Z0-9._%+-]+@(?!example\.com\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ["mailto", new RegExp(["mail", "to"].join("") + ":(?!hello@example\\.com\\b)[^\\s\"'`]+", "gi")],
  ["telephone", new RegExp(["t", "el"].join("") + ":\\+?[0-9][0-9\\s()-]{7,}", "gi")],
  ["private-path", /\/(?:Users|home)\/[A-Za-z0-9._-]+\//g],
  ["vercel-project", /\b(?:prj|team)_[A-Za-z0-9]{12,}\b/g],
];

async function walk(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    if (IGNORED_FILES.has(entry.name)) continue;
    const target = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await walk(root, target));
    else files.push(target);
  }
  return files;
}

export function inspectText(file, text, extraTokens) {
  const findings = [];
  for (const [rule, pattern] of RULES) {
    for (const match of text.matchAll(pattern)) {
      if (!SAFE_VALUES.has(match[0])) findings.push({ file, match: match[0], rule });
    }
  }
  for (const token of extraTokens.filter(Boolean)) {
    const isShortAsciiToken = /^[A-Za-z0-9_-]{1,4}$/.test(token);
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matched = isShortAsciiToken
      ? new RegExp(`\\b${escaped}\\b`, "i").test(text)
      : text.toLocaleLowerCase().includes(token.toLocaleLowerCase());
    if (matched) {
      findings.push({ file, match: token, rule: "private-denylist" });
    }
  }
  return findings;
}

export async function scanTree(root, { extraTokens = [] } = {}) {
  const files = await walk(root);
  const findings = [];
  let scannedFiles = 0;
  for (const file of files) {
    const info = await stat(file);
    if (info.size > 5_000_000) continue;
    const buffer = await readFile(file);
    if (buffer.includes(0)) continue;
    scannedFiles += 1;
    findings.push(...inspectText(path.relative(root, file), buffer.toString("utf8"), extraTokens));
  }
  return { findings, scannedFiles };
}

export async function readLocalTokens() {
  const file = process.env.PRIVATE_DENYLIST_FILE;
  if (!file) return [];
  return (await readFile(file, "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || ".");
  const result = await scanTree(root, { extraTokens: await readLocalTokens() });
  if (result.findings.length) {
    for (const finding of result.findings) console.error(`${finding.rule}: ${finding.file}`);
    process.exitCode = 1;
  } else {
    console.log(`Privacy scan passed across ${result.scannedFiles} text files.`);
  }
}
