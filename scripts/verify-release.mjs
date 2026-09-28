import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function run(command, args, env = process.env) {
  execFileSync(command, args, { stdio: "inherit", env });
}

run("npm", ["test"]);
run("npm", ["run", "build"]);
run("node", ["scripts/privacy-check.mjs", "."]);
run("node", ["scripts/privacy-history-check.mjs"]);
run("node", ["scripts/privacy-check.mjs", "dist"], {
  ...process.env,
  PRIVATE_DENYLIST_FILE: "",
});
run("git", ["diff", "--check"]);

const status = execFileSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
}).trim();
if (status) {
  throw new Error(`Working tree is not clean:\n${status}`);
}

const tracked = execFileSync("git", ["ls-files", "-z"])
  .toString()
  .split("\0")
  .filter(Boolean);

for (const file of tracked) {
  const buffer = readFileSync(file);
  const isBinary = buffer.subarray(0, 8000).includes(0);
  if (isBinary && !file.startsWith("public/placeholders/")) {
    throw new Error(`Tracked binary outside placeholder namespace: ${file}`);
  }
}

console.log("Release verification passed.");
