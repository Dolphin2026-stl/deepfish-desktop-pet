import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "src/main/index.cjs",
  "src/preload.cjs",
  "src/renderer/app.js",
  "src/renderer/settings.js",
  "src/shared/circadian.js",
  "src/shared/behaviors.js",
  "assets/character.png"
];

for (const relative of required) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`Missing required file: ${relative}`);
}

const scripts = [
  "src/main/index.cjs",
  "src/main/settings-store.cjs",
  "src/main/chat-client.cjs",
  "src/preload.cjs",
  "src/renderer/app.js",
  "src/renderer/settings.js",
  "src/shared/circadian.js",
  "src/shared/behaviors.js"
];

for (const relative of scripts) {
  execFileSync(process.execPath, ["--check", path.join(root, relative)], { stdio: "inherit" });
}

console.log(`Checked ${scripts.length} scripts and ${required.length} required files.`);
