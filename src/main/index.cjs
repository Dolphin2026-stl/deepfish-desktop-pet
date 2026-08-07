const fs = require("node:fs");
const path = require("node:path");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  powerMonitor,
  screen,
  Tray
} = require("electron");
const { SettingsStore } = require("./settings-store.cjs");
const { chat } = require("./chat-client.cjs");

let petWindow;
let settingsWindow;
let tray;
let store;
let lockedAt = 0;

const rendererPath = (file) => path.join(__dirname, "..", "renderer", file);
const assetPath = (file) => path.join(__dirname, "..", "..", "assets", file);

function keepOnScreen(win, x, y) {
  const display = screen.getDisplayNearestPoint({ x, y });
  const bounds = display.workArea;
  const [width, height] = win.getSize();
  return [
    Math.min(Math.max(x, bounds.x), bounds.x + bounds.width - width),
    Math.min(Math.max(y, bounds.y), bounds.y + bounds.height - height)
  ];
}

function createPetWindow() {
  const display = screen.getPrimaryDisplay().workArea;
  petWindow = new BrowserWindow({
    width: 340,
    height: 430,
    x: display.x + display.width - 370,
    y: display.y + display.height - 460,
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: store.data.alwaysOnTop,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  petWindow.setAlwaysOnTop(store.data.alwaysOnTop, "floating");
  petWindow.loadFile(rendererPath("index.html"));
  petWindow.once("ready-to-show", () => petWindow.showInactive());
  petWindow.on("closed", () => { petWindow = undefined; });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({
    width: 520,
    height: 720,
    minWidth: 440,
    minHeight: 620,
    title: "大肥鱼设置",
    backgroundColor: "#f6f7fb",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  settingsWindow.loadFile(rendererPath("settings.html"));
  settingsWindow.on("closed", () => { settingsWindow = undefined; });
}

function togglePet() {
  if (!petWindow) return;
  if (petWindow.isVisible()) petWindow.hide();
  else petWindow.showInactive();
}

function createTray() {
  const image = nativeImage.createFromPath(assetPath("character.png")).resize({ width: 32, height: 32 });
  tray = new Tray(image);
  tray.setToolTip("大肥鱼桌宠");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "显示 / 隐藏大肥鱼", click: togglePet },
    { label: "和她聊天", click: () => petWindow?.webContents.send("pet-command", "open-chat") },
    { label: "设置", click: createSettingsWindow },
    { type: "separator" },
    { label: "退出", click: () => app.quit() }
  ]));
  tray.on("double-click", togglePet);
}

function showPetMenu() {
  if (!petWindow) return;
  Menu.buildFromTemplate([
    { label: "和大肥鱼聊天", click: () => petWindow.webContents.send("pet-command", "open-chat") },
    { label: "喂一碗白饭", click: () => petWindow.webContents.send("pet-command", "feed") },
    { label: "摸摸头", click: () => petWindow.webContents.send("pet-command", "pat") },
    {
      label: "陪她玩",
      submenu: [
        { label: "出去散步", click: () => petWindow.webContents.send("pet-command", "walk") },
        { label: "让她洗碗", click: () => petWindow.webContents.send("pet-command", "wash") },
        { label: "加班喝咖啡", click: () => petWindow.webContents.send("pet-command", "coffee") },
        { label: "抱鲸鱼玩偶", click: () => petWindow.webContents.send("pet-command", "toy") },
        { label: "坐好", click: () => petWindow.webContents.send("pet-command", "sit") },
        { label: "睡一会儿", click: () => petWindow.webContents.send("pet-command", "sleep") }
      ]
    },
    { type: "separator" },
    {
      label: "始终置顶",
      type: "checkbox",
      checked: petWindow.isAlwaysOnTop(),
      click: (item) => {
        petWindow.setAlwaysOnTop(item.checked, "floating");
        store.save({ alwaysOnTop: item.checked });
      }
    },
    { label: "设置", click: createSettingsWindow },
    { label: "暂时隐藏", click: () => petWindow.hide() },
    { type: "separator" },
    { label: "退出大肥鱼", click: () => app.quit() }
  ]).popup({ window: petWindow });
}

function registerIpc() {
  ipcMain.on("pet-menu", showPetMenu);
  ipcMain.on("move-pet", (_event, delta) => {
    if (!petWindow || petWindow.isDestroyed()) return;
    const [x, y] = petWindow.getPosition();
    const [nextX, nextY] = keepOnScreen(petWindow, x + Math.round(delta.x), y + Math.round(delta.y));
    petWindow.setPosition(nextX, nextY, false);
  });
  ipcMain.handle("walk-pet", (_event, delta) => {
    if (!petWindow || petWindow.isDestroyed()) return { boundary: true };
    const [x, y] = petWindow.getPosition();
    const targetX = x + Math.round(delta.x);
    const targetY = y + Math.round(delta.y);
    const [nextX, nextY] = keepOnScreen(petWindow, targetX, targetY);
    petWindow.setPosition(nextX, nextY, false);
    return { x: nextX, y: nextY, boundary: nextX !== targetX || nextY !== targetY };
  });
  ipcMain.on("open-settings", createSettingsWindow);
  ipcMain.handle("settings:get", () => store.publicValue());
  ipcMain.handle("settings:save", (_event, value) => {
    const saved = store.save(value);
    petWindow?.setAlwaysOnTop(saved.alwaysOnTop, "floating");
    petWindow?.webContents.send("settings-updated", saved);
    return saved;
  });
  ipcMain.handle("chat:send", async (_event, messages) => {
    const settings = store.data;
    if (settings.provider === "deepseek" && !store.apiKey()) {
      throw new Error("请先在设置中填写 DeepSeek API Key");
    }
    return chat(settings, store.apiKey(), Array.isArray(messages) ? messages : []);
  });
}

function registerPowerEvents() {
  powerMonitor.on("lock-screen", () => { lockedAt = Date.now(); });
  const wake = (reason) => {
    const action = Math.random() > 0.5 ? "stretch" : "startle";
    petWindow?.webContents.send("wake-event", { action, reason, awayMs: lockedAt ? Date.now() - lockedAt : 0 });
    lockedAt = 0;
  };
  powerMonitor.on("unlock-screen", () => wake("unlock"));
  powerMonitor.on("resume", () => wake("resume"));
}

async function runSmokeCapture() {
  if (!process.argv.includes("--smoke-test") || !petWindow) return;
  const argumentValue = (prefix) => process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
  const outputDir = argumentValue("--smoke-dir=") || process.env.DEEPFISH_SMOKE_DIR || app.getPath("temp");
  const smokeAction = argumentValue("--smoke-action=") || process.env.DEEPFISH_SMOKE_ACTION || "shock";
  fs.mkdirSync(outputDir, { recursive: true });
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const petShot = await petWindow.capturePage();
  fs.writeFileSync(path.join(outputDir, "pet-window.png"), petShot.toPNG());
  petWindow.webContents.send("pet-command", smokeAction);
  await new Promise((resolve) => setTimeout(resolve, 650));
  const actionShot = await petWindow.capturePage();
  if (actionShot.isEmpty()) throw new Error("Action smoke capture is empty");
  fs.writeFileSync(path.join(outputDir, "pet-action.png"), actionShot.toPNG());
  createSettingsWindow();
  await new Promise((resolve) => settingsWindow.webContents.once("did-finish-load", resolve));
  settingsWindow.show();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const settingsShot = await settingsWindow.capturePage();
  if (settingsShot.isEmpty()) throw new Error("Settings smoke capture is empty");
  fs.writeFileSync(path.join(outputDir, "settings-window.png"), settingsShot.toPNG());
  console.log(`SMOKE_OK ${outputDir}`);
  app.quit();
}

app.whenReady().then(() => {
  store = new SettingsStore(app.getPath("userData"));
  registerIpc();
  createPetWindow();
  createTray();
  registerPowerEvents();
  petWindow.webContents.once("did-finish-load", runSmokeCapture);
});

app.on("window-all-closed", (event) => event.preventDefault());
app.on("activate", () => {
  if (!petWindow) createPetWindow();
  else petWindow.showInactive();
});

app.on("before-quit", () => {
  petWindow?.removeAllListeners("close");
});
