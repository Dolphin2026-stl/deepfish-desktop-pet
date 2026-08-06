const appRoot = document.querySelector("#pet-app");
const stage = document.querySelector("#pet-stage");
const speech = document.querySelector("#speech");
const phaseLabel = document.querySelector("#phase-label");
const speechText = document.querySelector("#speech-text");
const effectLayer = document.querySelector("#effect-layer");
const chatPanel = document.querySelector("#chat-panel");
const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatClose = document.querySelector("#chat-close");
const providerLabel = document.querySelector("#provider-label");

const idleEggs = [
  { action: "think", text: "看不太懂，先编一个... 开玩笑的。", icon: "?" },
  { action: "feed", text: "有没有白饭？蓝色大肥鱼饿了。", icon: "🍚" },
  { action: "doze", text: "闭源模型在哪？我先眯一会儿。", icon: "Z" },
  { action: "spin", text: "正在高速旋转上下文窗口。", icon: "✦" },
  { action: "think", text: "我没有在摸鱼，我在深度思考。", icon: "…" }
];

const clickLines = ["收到一次点击。", "再点就要收费啦。", "我有在认真营业。", "你是不是想摸摸头？"];
const messages = [];
let speechTimer;
let actionTimer;
let idleTimer;
let currentSettings = { provider: "pollinations", scale: 1 };
let drag;
let lastClickAt = 0;

function randomOf(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function say(text, label, duration = 4200) {
  phaseLabel.textContent = label || window.DeepFishClock.getPhase().label;
  speechText.textContent = text;
  speech.classList.add("visible");
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.remove("visible"), duration);
}

function animate(action, duration = 1200) {
  for (const name of [...appRoot.classList]) {
    if (name.startsWith("action-")) appRoot.classList.remove(name);
  }
  void appRoot.offsetWidth;
  appRoot.classList.add(`action-${action}`);
  clearTimeout(actionTimer);
  actionTimer = setTimeout(() => appRoot.classList.remove(`action-${action}`), duration);
}

function particles(icon, count = 5) {
  for (let i = 0; i < count; i += 1) {
    const node = document.createElement("span");
    node.className = "particle";
    node.textContent = icon;
    node.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    node.style.setProperty("--turn", `${-80 + Math.random() * 160}deg`);
    node.style.left = `${38 + Math.random() * 24}%`;
    node.style.animationDelay = `${i * 60}ms`;
    effectLayer.append(node);
    setTimeout(() => node.remove(), 1300);
  }
}

function runAction(action) {
  if (action === "pat") {
    animate("pat", 700);
    particles("♡", 6);
    say("好吧，只许摸一下。", "心情 +1");
  } else if (action === "feed") {
    animate("feed", 950);
    particles("🍚", 4);
    say("这次不是空碗！原谅你了。", "投喂成功");
  }
}

function applyClock() {
  const phase = window.DeepFishClock.getPhase();
  for (const name of [...appRoot.classList]) {
    if (name.startsWith("phase-")) appRoot.classList.remove(name);
  }
  appRoot.classList.add(`phase-${phase.id}`);
  document.title = `大肥鱼 · ${phase.label}`;
  if (!speech.classList.contains("visible") && Math.random() < 0.25) say(phase.line, phase.label, 3000);
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  const phase = window.DeepFishClock.getPhase();
  const delay = (18 + Math.random() * 24) * 1000 / Math.max(phase.energy, 0.35);
  idleTimer = setTimeout(() => {
    if (chatPanel.hidden && !drag) {
      const egg = randomOf(idleEggs);
      animate(egg.action, egg.action === "doze" ? 2500 : 1300);
      particles(egg.icon, 3);
      say(egg.text, "闲置彩蛋");
    }
    scheduleIdle();
  }, delay);
}

function openChat() {
  chatPanel.hidden = false;
  speech.classList.remove("visible");
  chatInput.focus();
}

function closeChat() {
  chatPanel.hidden = true;
  stage.focus();
}

function appendMessage(role, content, extraClass = "") {
  const node = document.createElement("p");
  node.className = `message ${role} ${extraClass}`.trim();
  node.textContent = content;
  chatLog.append(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

async function sendChat(event) {
  event.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;
  chatInput.value = "";
  messages.push({ role: "user", content });
  appendMessage("user", content);
  const button = chatForm.querySelector("button");
  button.disabled = true;
  const pending = appendMessage("assistant", "正在想...");
  animate("think", 1200);
  try {
    const reply = await window.deepFish.chat(messages);
    pending.textContent = reply;
    messages.push({ role: "assistant", content: reply });
  } catch (error) {
    pending.textContent = `没连上模型：${error.message}`;
    pending.classList.add("error");
  } finally {
    button.disabled = false;
    chatInput.focus();
  }
}

stage.addEventListener("pointerenter", () => {
  const phase = window.DeepFishClock.getPhase();
  say(randomOf([phase.line, "鼠标经过，检测到一位用户。", "我看见你啦。"]), phase.label, 2200);
});

stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  stage.setPointerCapture(event.pointerId);
  drag = { x: event.screenX, y: event.screenY, total: 0 };
});

stage.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const dx = event.screenX - drag.x;
  const dy = event.screenY - drag.y;
  if (dx || dy) {
    window.deepFish.move({ x: dx, y: dy });
    drag.x = event.screenX;
    drag.y = event.screenY;
    drag.total += Math.abs(dx) + Math.abs(dy);
  }
});

stage.addEventListener("pointerup", () => {
  const moved = drag?.total || 0;
  drag = undefined;
  if (moved > 10) {
    animate("startle", 700);
    say("慢一点，我要晕鱼了。", "拖拽反馈", 2600);
    return;
  }
  const now = Date.now();
  if (now - lastClickAt < 320) {
    openChat();
    lastClickAt = 0;
  } else {
    lastClickAt = now;
    animate("pat", 620);
    particles("♡", 3);
    say(randomOf(clickLines), "点击反馈", 2400);
  }
});

stage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openChat();
  }
});

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  window.deepFish.showMenu();
});

chatClose.addEventListener("click", closeChat);
chatForm.addEventListener("submit", sendChat);

window.deepFish.onWake(({ action, awayMs }) => {
  animate(action, action === "stretch" ? 1500 : 1000);
  if (action === "stretch") say("你回来啦，我也刚好伸完懒腰。", "欢迎回来", 5000);
  else say(awayMs > 3600000 ? "诶？！你终于回来了！" : "吓我一跳，你回来啦。", "惊醒", 5000);
});

window.deepFish.onCommand((command) => {
  if (command === "open-chat") openChat();
  else runAction(command);
});

function applySettings(settings) {
  currentSettings = { ...currentSettings, ...settings };
  appRoot.style.transform = `scale(${currentSettings.scale || 1})`;
  providerLabel.textContent = currentSettings.provider === "deepseek" ? "DeepSeek" : currentSettings.provider === "custom" ? "自定义模型" : "免费模型";
}

window.deepFish.onSettings(applySettings);
window.deepFish.getSettings().then(applySettings);
applyClock();
setInterval(applyClock, 60000);
scheduleIdle();
