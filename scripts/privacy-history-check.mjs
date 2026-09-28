import { execFileSync } from "node:child_process";
import { inspectText, readLocalTokens } from "./privacy-check.mjs";

function git(args, options = {}) {
  return execFileSync("git", args, {
    encoding: options.encoding,
    maxBuffer: 20 * 1024 * 1024,
  });
}

const commits = git(["rev-list", "--all"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
const extraTokens = await readLocalTokens();
const scannedBlobs = new Set();
const findings = [];

for (const commit of commits) {
  const tree = git(["ls-tree", "-r", "-z", commit]);
  for (const record of tree.toString("utf8").split("\0").filter(Boolean)) {
    const [metadata, file] = record.split("\t");
    const [, type, objectId] = metadata.split(" ");
    if (type !== "blob" || scannedBlobs.has(objectId)) continue;
    scannedBlobs.add(objectId);

    const buffer = git(["cat-file", "blob", objectId]);
    if (buffer.length > 5_000_000 || buffer.includes(0)) continue;
    findings.push(
      ...inspectText(`${commit.slice(0, 12)}:${file}`, buffer.toString("utf8"), extraTokens)
    );
  }
}

const messages = git(["log", "--all", "--format=%H%x00%B%x00"], {
  encoding: "utf8",
});
const messageParts = messages.split("\0");
for (let index = 0; index + 1 < messageParts.length; index += 2) {
  const commit = messageParts[index].trim();
  const message = messageParts[index + 1];
  if (!commit) continue;
  findings.push(...inspectText(`${commit.slice(0, 12)}:commit-message`, message, extraTokens));
}

if (findings.length) {
  for (const finding of findings) {
    console.error(`${finding.rule}: ${finding.file}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Git history privacy scan passed across ${commits.length} commit(s) and ${scannedBlobs.size} blob(s).`
  );
}
