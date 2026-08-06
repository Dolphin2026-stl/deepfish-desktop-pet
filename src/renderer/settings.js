const form = document.querySelector("#settings-form");
const endpoint = document.querySelector("#endpoint");
const model = document.querySelector("#model");
const apiKey = document.querySelector("#api-key");
const keyField = document.querySelector("#key-field");
const keyStatus = document.querySelector("#key-status");
const clearKey = document.querySelector("#clear-key");
const alwaysOnTop = document.querySelector("#always-on-top");
const sound = document.querySelector("#sound");
const scale = document.querySelector("#scale");
const scaleOutput = document.querySelector("#scale-output");
const status = document.querySelector("#status");
const resetProvider = document.querySelector("#reset-provider");

const presets = {
  pollinations: { endpoint: "https://text.pollinations.ai/openai", model: "openai-fast" },
  deepseek: { endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-chat" },
  custom: { endpoint: "", model: "" }
};

function selectedProvider() {
  return form.elements.provider.value;
}

function updateKeyVisibility() {
  const needsKey = selectedProvider() !== "pollinations";
  keyField.hidden = !needsKey;
  clearKey.parentElement.hidden = !needsKey;
}

function selectProvider(provider, fillPreset = true) {
  const radio = form.querySelector(`input[name="provider"][value="${provider}"]`);
  if (radio) radio.checked = true;
  if (fillPreset && presets[provider]) {
    endpoint.value = presets[provider].endpoint;
    model.value = presets[provider].model;
  }
  updateKeyVisibility();
}

form.elements.provider.forEach((radio) => radio.addEventListener("change", () => selectProvider(radio.value)));
scale.addEventListener("input", () => { scaleOutput.value = `${Math.round(Number(scale.value) * 100)}%`; });
resetProvider.addEventListener("click", () => selectProvider("pollinations"));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "正在保存...";
  try {
    const saved = await window.deepFish.saveSettings({
      provider: selectedProvider(),
      endpoint: endpoint.value.trim(),
      model: model.value.trim(),
      apiKey: apiKey.value,
      clearApiKey: clearKey.checked,
      alwaysOnTop: alwaysOnTop.checked,
      sound: sound.checked,
      scale: Number(scale.value)
    });
    apiKey.value = "";
    clearKey.checked = false;
    keyStatus.textContent = saved.hasApiKey ? "已加密保存" : "尚未保存 Key";
    status.textContent = "设置已保存";
  } catch (error) {
    status.textContent = `保存失败：${error.message}`;
  }
});

window.deepFish.getSettings().then((settings) => {
  selectProvider(settings.provider, false);
  endpoint.value = settings.endpoint;
  model.value = settings.model;
  alwaysOnTop.checked = settings.alwaysOnTop;
  sound.checked = settings.sound;
  scale.value = settings.scale;
  scaleOutput.value = `${Math.round(Number(settings.scale) * 100)}%`;
  keyStatus.textContent = settings.hasApiKey ? "已加密保存，留空即可保留" : "尚未保存 Key";
});
