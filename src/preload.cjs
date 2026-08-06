const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld("deepFish", {
  move: (delta) => ipcRenderer.send("move-pet", delta),
  showMenu: () => ipcRenderer.send("pet-menu"),
  openSettings: () => ipcRenderer.send("open-settings"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  chat: (messages) => ipcRenderer.invoke("chat:send", messages),
  onWake: (callback) => subscribe("wake-event", callback),
  onCommand: (callback) => subscribe("pet-command", callback),
  onSettings: (callback) => subscribe("settings-updated", callback)
});
