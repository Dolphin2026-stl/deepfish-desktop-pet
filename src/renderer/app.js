const appRoot = document.querySelector("#pet-app");
const stage = document.querySelector("#pet-stage");
const character = document.querySelector("#character");
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

const behaviorApi = window.DeepFishBehaviors;
const frameAliases = { dream: "sleep" };
const frameNames = [
  "neutral", "walk", "walk-b", "wash", "work", "coffee", "toy", "sleep", "hungry",
  "sit", "pat", "feed", "shy", "trip", "cry", "think", "smug", "angry", "ciallo",
  "fly", "price", "panic", "rival", "shock", "pressure", "stranded", "stretch",
  "startle", "goAway"
];
const signaturePool = ["ciallo", "smug", "pressure", "shock", "fly", "price", "rival", "goAway", "stranded"];
const behaviorLabels = {
  walk: "散步中", wash: "洗碗中", work: "认真加班", coffee: "咖啡时间", toy: "摸鱼中",
  sleep: "睡觉中", dream: "做梦中", hungry: "肚子咕咕叫", sit: "坐好了", pat: "摸摸头",
  feed: "投喂成功", shy: "害羞", trip: "绊倒了", cry: "委屈巴巴", think: "深度思考",
  smug: "自信", angry: "用户怒了", ciallo: "随机卖萌", fly: "起飞", price: "准备涨价",
  panic: "慌乱", rival: "双枪模式", shock: "震惊", pressure: "压力测试", stranded: "搁浅了",
  stretch: "欢迎回来", startle: "惊醒", goAway: "AGI 训练中"
};

const clickLines = ["我有在认真营业。", "好的，用户又发癫了。", "你是不是想摸摸头？", "再点就要收费啦。"];
const messages = [];
let currentSettings = {
  provider: "pollinations",
  scale: 1,
  freeWalk: true,
  interactiveZones: true,
  spicyLines: true,
  behaviorIntensity: 1
};
let speechTimer;
let actionTimer;
let sceneTimer;
let idleTimer;
let walkTimer;
let walkStopTimer;
let frameTimer;
let frameLoopTimer;
let walkPending = false;
let walkDirection = -1;
let drag;
let lastClickAt = 0;
let lastHoverAt = 0;
let lastZone = "";
let tripCount = 0;

function randomOf(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function framePath(name) {
  const resolvedName = frameAliases[name] || name;
  return `../../assets/frames/frame-${resolvedName}.png`;
}

function restingFrame() {
  return window.DeepFishClock.getPhase().id === "sleep" && chatPanel.hidden ? "sleep" : "neutral";
}

function setFrame(name) {
  const resolvedName = frameAliases[name] || name;
  character.src = framePath(resolvedName);
  character.dataset.frame = resolvedName;
}

function stopFramePlayback(reset = true) {
  clearTimeout(frameTimer);
  clearInterval(frameLoopTimer);
  frameTimer = undefined;
  frameLoopTimer = undefined;
  if (reset) setFrame(restingFrame());
}

function playFrame(name, duration) {
  stopFramePlayback(false);
  setFrame(name);
  frameTimer = setTimeout(() => {
    frameTimer = undefined;
    setFrame(restingFrame());
  }, duration);
}

function startFrameLoop(names, interval = 220) {
  stopFramePlayback(false);
  let index = 0;
  setFrame(names[index]);
  frameLoopTimer = setInterval(() => {
    index = (index + 1) % names.length;
    setFrame(names[index]);
  }, interval);
}

for (const name of frameNames) {
  const image = new Image();
  image.src = framePath(name);
}

function removePrefixedClass(prefix) {
  for (const name of [...appRoot.classList]) {
    if (name.startsWith(prefix)) appRoot.classList.remove(name);
  }
}

function say(text, label, duration = 4200) {
  phaseLabel.textContent = label || window.DeepFishClock.getPhase().label;
  speechText.textContent = behaviorApi.stripHints(text);
  speech.classList.add("visible");
  clearTimeout(speechTimer);
  speechTimer = setTimeout(() => speech.classList.remove("visible"), duration);
}

function setScene(scene) {
  removePrefixedClass("scene-");
  if (scene) appRoot.classList.add(`scene-${scene}`);
}

function setExpression(expression) {
  removePrefixedClass("expression-");
  if (expression) appRoot.classList.add(`expression-${expression}`);
}

function animate(action, duration = 1200) {
  removePrefixedClass("action-");
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
    setTimeout(() => node.remove(), 1400);
  }
}

function stopWalk(clearScene = true) {
  clearInterval(walkTimer);
  clearTimeout(walkStopTimer);
  walkTimer = undefined;
  walkStopTimer = undefined;
  appRoot.classList.remove("is-walking");
  if (frameLoopTimer) stopFramePlayback();
  if (clearScene && appRoot.classList.contains("scene-walk")) setScene(null);
}

function startWalk(duration = 7200, announce = true) {
  stopWalk(false);
  setScene("walk");
  setExpression("happy");
  animate("walk", duration);
  appRoot.classList.add("is-walking");
  startFrameLoop(["walk", "walk-b"]);
  if (announce) say(behaviorApi.formatLine("walk"), behaviorLabels.walk, 3400);
  walkTimer = setInterval(async () => {
    if (walkPending || drag || !chatPanel.hidden) return;
    walkPending = true;
    try {
      const result = await window.deepFish.walkStep({ x: walkDirection * 3, y: 0 });
      if (result?.boundary) walkDirection *= -1;
    } finally {
      walkPending = false;
    }
  }, 48);
  walkStopTimer = setTimeout(() => {
    stopWalk();
    setExpression(null);
  }, duration);
}

function runBehavior(id, options = {}) {
  const behavior = behaviorApi.getBehavior(id);
  if (id === "walk") {
    if (currentSettings.freeWalk !== false) startWalk(behavior.duration, options.say !== false);
    return;
  }
  stopWalk(false);
  setScene(behavior.scene);
  setExpression(behavior.expression);
  animate(id, behavior.duration);
  playFrame(id, behavior.duration);
  particles(behavior.icon, ["cry", "shock", "rival"].includes(id) ? 6 : 3);
  if (options.say !== false) say(behaviorApi.formatLine(id), options.label || behaviorLabels[id], Math.min(5200, behavior.duration + 1800));
  clearTimeout(sceneTimer);
  sceneTimer = setTimeout(() => {
    setScene(null);
    setExpression(null);
  }, behavior.duration);
}

function applyClock() {
  const phase = window.DeepFishClock.getPhase();
  removePrefixedClass("phase-");
  appRoot.classList.add(`phase-${phase.id}`);
  document.title = `大肥鱼 · ${phase.label}`;
  if (phase.id === "sleep" && !walkTimer && chatPanel.hidden) {
    setExpression("sleep");
    setScene("sleep");
  }
  if (!frameTimer && !frameLoopTimer && !drag && chatPanel.hidden) setFrame(restingFrame());
}

function nextIdleBehavior() {
  const phase = window.DeepFishClock.getPhase();
  let pool = behaviorApi.getPlan(phase.id);
  if (phase.id !== "sleep" && Math.random() < 0.38) pool = pool.concat(signaturePool);
  if (currentSettings.freeWalk === false) pool = pool.filter((id) => id !== "walk");
  if (currentSettings.spicyLines === false) pool = pool.filter((id) => !["angry", "rival", "goAway"].includes(id));
  return randomOf(pool.length ? pool : ["think"]);
}

function scheduleIdle() {
  clearTimeout(idleTimer);
  const phase = window.DeepFishClock.getPhase();
  const intensity = Math.min(1.8, Math.max(.5, Number(currentSettings.behaviorIntensity) || 1));
  const delay = (15 + Math.random() * 25) * 1000 / Math.max(phase.energy * intensity, .3);
  idleTimer = setTimeout(() => {
    if (chatPanel.hidden && !drag) runBehavior(nextIdleBehavior());
    scheduleIdle();
  }, delay);
}

function resumeWalkAfterInteraction(id) {
  const behavior = behaviorApi.getBehavior(id);
  setTimeout(() => {
    if (currentSettings.freeWalk !== false && chatPanel.hidden && !drag) startWalk(4200, false);
  }, behavior.duration + 280);
}

function bodyZone(event) {
  const rect = stage.getBoundingClientRect();
  const y = (event.clientY - rect.top) / rect.height;
  if (y < .38) return "hair";
  if (y < .64) return "face";
  if (y > .76) return "legs";
  return "body";
}

function reactToWalkHover(event) {
  if (!appRoot.classList.contains("is-walking") || currentSettings.interactiveZones === false) return;
  const zone = bodyZone(event);
  const now = Date.now();
  if (zone === lastZone || now - lastHoverAt < 1800) return;
  lastZone = zone;
  lastHoverAt = now;
  if (zone === "hair") {
    runBehavior(Math.random() > .5 ? "ciallo" : "smug");
    resumeWalkAfterInteraction("ciallo");
  } else if (zone === "face") {
    runBehavior("shy");
    resumeWalkAfterInteraction("shy");
  } else if (zone === "legs") {
    tripCount += 1;
    if (tripCount >= 3) {
      runBehavior("cry");
      tripCount = 0;
    } else {
      runBehavior("trip");
      resumeWalkAfterInteraction("trip");
    }
  }
}

function openChat() {
  stopWalk();
  chatPanel.hidden = false;
  stopFramePlayback();
  speech.classList.remove("visible");
  chatInput.focus();
}

function closeChat() {
  chatPanel.hidden = true;
  stopFramePlayback();
  stage.focus();
  scheduleIdle();
}

function appendMessage(role, content, extraClass = "") {
  const node = document.createElement("p");
  node.className = `message ${role} ${extraClass}`.trim();
  node.textContent = content;
  chatLog.append(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

function reactToUserText(content) {
  if (/生气|怒|气死|操|发火/.test(content)) runBehavior("angry", { say: false });
  else if (/性能|测试|压测/.test(content)) runBehavior("panic", { say: false });
  else if (/贵|价格|涨价/.test(content)) runBehavior("price", { say: false });
  else if (/Gemini|ChatGPT|Grok|GLM|Claude/i.test(content)) runBehavior("rival", { say: false });
  else if (content.length > 260) runBehavior("work", { say: false });
  else runBehavior("think", { say: false });
}

async function sendChat(event) {
  event.preventDefault();
  const content = chatInput.value.trim();
  if (!content) return;
  chatInput.value = "";
  messages.push({ role: "user", content });
  appendMessage("user", content);
  reactToUserText(content);
  const button = chatForm.querySelector("button");
  button.disabled = true;
  const pending = appendMessage("assistant", "正在想...");
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
  if (!appRoot.classList.contains("is-walking")) say(randomOf([phase.line, "我看见你啦。", "好的，用户又发癫了。"]), phase.label, 2200);
});

stage.addEventListener("pointerleave", () => { lastZone = ""; });

stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  stopWalk();
  stopFramePlayback();
  stage.setPointerCapture(event.pointerId);
  drag = { x: event.screenX, y: event.screenY, total: 0 };
});

stage.addEventListener("pointermove", (event) => {
  if (!drag) {
    reactToWalkHover(event);
    return;
  }
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
    runBehavior("startle", { label: "拖拽反馈" });
    return;
  }
  const now = Date.now();
  if (now - lastClickAt < 320) {
    openChat();
    lastClickAt = 0;
  } else {
    lastClickAt = now;
    runBehavior("pat", { say: false });
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
  runBehavior(action);
  if (action === "startle" && awayMs > 3600000) say("诶？！你终于回来了！", "惊醒", 5000);
});

window.deepFish.onCommand((command) => {
  if (command === "open-chat") openChat();
  else runBehavior(command);
});

function applySettings(settings) {
  currentSettings = { ...currentSettings, ...settings };
  appRoot.style.transform = `scale(${currentSettings.scale || 1})`;
  providerLabel.textContent = currentSettings.provider === "deepseek" ? "DeepSeek" : currentSettings.provider === "custom" ? "自定义模型" : "免费模型";
  if (currentSettings.freeWalk === false) stopWalk();
  scheduleIdle();
}

window.deepFish.onSettings(applySettings);
window.deepFish.getSettings().then(applySettings);
applyClock();
setInterval(applyClock, 60000);
scheduleIdle();
