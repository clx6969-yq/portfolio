import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { scanTree } from "../scripts/privacy-check.mjs";

test("scanTree catches contact data, private paths, deploy ids, and local denylist tokens", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-privacy-"));
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src", "bad.js"), [
    `${["mail", "to"].join("")}:${["person", "example.net"].join("@")}`,
    [["t", "el"].join(""), "+12345678901"].join(":"),
    ["", "Users", "private-user", "Desktop", "file.jpg"].join("/"),
    ["prj", "1234567890abcdef"].join("_"),
    "PRIVATE_WORK_TOKEN",
  ].join("\n"));
  const result = await scanTree(root, { extraTokens: ["PRIVATE_WORK_TOKEN"] });
  assert.ok(result.findings.length >= 5);
});

test("scanTree ignores dependencies, build output, git internals, and safe example copy", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-privacy-"));
  await mkdir(path.join(root, "node_modules"));
  await mkdir(path.join(root, "dist"));
  await writeFile(path.join(root, "node_modules", "ignored.js"), `${["mail", "to"].join("")}:${["real", "example.net"].join("@")}`);
  await writeFile(path.join(root, "dist", "ignored.js"), [["t", "el"].join(""), "+12345678901"].join(":"));
  await writeFile(path.join(root, "safe.js"), "hello@example.com\nYOUR NAME");
  const result = await scanTree(root);
  assert.deepEqual(result.findings, []);
  assert.equal(result.scannedFiles, 1);
});

test("scanTree allows documentation to name contact URL schemes without values", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-privacy-"));
  await writeFile(path.join(root, "README.md"), "Remove real `mailto:` and `tel:` values before publishing.");
  const result = await scanTree(root);
  assert.deepEqual(result.findings, []);
});

test("scanTree treats short denylist tokens as whole words and skips the local denylist file", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "portfolio-privacy-"));
  const token = ["L", "N", "G"].join("");
  await writeFile(path.join(root, "package-lock.json"), "sha512-XXlngZZ");
  await writeFile(path.join(root, ".privacy-denylist.local.txt"), token);
  const safe = await scanTree(root, { extraTokens: [token] });
  assert.deepEqual(safe.findings, []);
  await writeFile(path.join(root, "README.md"), `Blocked token: ${token}`);
  const blocked = await scanTree(root, { extraTokens: [token] });
  assert.equal(blocked.findings.length, 1);
  assert.equal(blocked.findings[0].file, "README.md");
});
