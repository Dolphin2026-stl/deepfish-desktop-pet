const fs = require("node:fs");
const path = require("node:path");
const { safeStorage } = require("electron");

const DEFAULTS = Object.freeze({
  provider: "pollinations",
  endpoint: "https://text.pollinations.ai/openai",
  model: "openai-fast",
  alwaysOnTop: true,
  scale: 1,
  sound: true,
  apiKeyEncrypted: ""
});

class SettingsStore {
  constructor(userDataPath) {
    this.file = path.join(userDataPath, "settings.json");
    this.data = this.read();
  }

  read() {
    try {
      return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(this.file, "utf8")) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  publicValue() {
    const { apiKeyEncrypted, ...settings } = this.data;
    return { ...settings, hasApiKey: Boolean(apiKeyEncrypted) };
  }

  save(next) {
    const allowed = ["provider", "endpoint", "model", "alwaysOnTop", "scale", "sound"];
    for (const key of allowed) {
      if (Object.hasOwn(next, key)) this.data[key] = next[key];
    }
    this.data.scale = Math.min(1.15, Math.max(0.6, Number(this.data.scale) || 1));
    if (typeof next.apiKey === "string" && next.apiKey.trim()) {
      if (!safeStorage.isEncryptionAvailable()) throw new Error("系统密钥加密当前不可用");
      this.data.apiKeyEncrypted = safeStorage.encryptString(next.apiKey.trim()).toString("base64");
    }
    if (next.clearApiKey) this.data.apiKeyEncrypted = "";
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    return this.publicValue();
  }

  apiKey() {
    if (!this.data.apiKeyEncrypted) return "";
    try {
      return safeStorage.decryptString(Buffer.from(this.data.apiKeyEncrypted, "base64"));
    } catch {
      return "";
    }
  }
}

module.exports = { SettingsStore, DEFAULTS };
