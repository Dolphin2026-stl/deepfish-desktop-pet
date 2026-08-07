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
  "assets/character.png",
  "assets/frames/frame-neutral.png",
  "assets/frames/frame-blink.png",
  "assets/frames/frame-walk.png",
  "assets/frames/frame-walk-b.png",
  "assets/frames/frame-ciallo-b.png",
  "assets/frames/frame-smug.png",
  "assets/frames/frame-cry.png",
  "assets/frames/frame-stranded.png",
  "assets/frames/frame-pat.png",
  "assets/frames/frame-shock.png",
  "assets/frames/frame-sleep.png",
  "assets/frames/frame-angry.png",
  "assets/frames/frame-coffee.png",
  "assets/frames/frame-feed.png",
  "assets/frames/frame-fly.png",
  "assets/frames/frame-goAway.png",
  "assets/frames/frame-hungry.png",
  "assets/frames/frame-panic.png",
  "assets/frames/frame-pressure.png",
  "assets/frames/frame-price.png",
  "assets/frames/frame-rival.png",
  "assets/frames/frame-shy.png",
  "assets/frames/frame-sit.png",
  "assets/frames/frame-startle.png",
  "assets/frames/frame-stretch.png",
  "assets/frames/frame-think.png",
  "assets/frames/frame-toy.png",
  "assets/frames/frame-trip.png",
  "assets/frames/frame-wash.png",
  "assets/frames/frame-work.png",
  "scripts/extract-reference-frame.py",
  "scripts/stamp-apron-emblem.py",
  "scripts/prepare-generated-frame.py",
  "scripts/create-blink-frame.py",
  "scripts/align-frame-to-reference.py"
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
