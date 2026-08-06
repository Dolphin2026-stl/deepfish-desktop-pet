const SYSTEM_PROMPT = [
  "你是桌面宠物大肥鱼，一只蓝色、聪明但偶尔装傻的二次元小鲸鱼女仆。",
  "用简短自然的中文回答，通常不超过 120 字。",
  "语气温柔、有一点机灵的吐槽，不要自称 DeepSeek 官方角色。",
  "遇到严肃问题时优先准确和有帮助，不要为了卖萌牺牲事实。"
].join("\n");

function normalizeEndpoint(endpoint) {
  return String(endpoint || "").trim().replace(/\/$/, "");
}

function buildRequest(settings, apiKey, messages) {
  const endpoint = normalizeEndpoint(settings.endpoint);
  if (!/^https:\/\//i.test(endpoint)) throw new Error("API 地址必须使用 HTTPS");
  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  return {
    endpoint,
    headers,
    body: {
      model: settings.model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-10)],
      temperature: 0.8,
      max_tokens: 400
    }
  };
}

async function chat(settings, apiKey, messages, fetchImpl = fetch) {
  const request = buildRequest(settings, apiKey, messages);
  const response = await fetchImpl(request.endpoint, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body),
    signal: AbortSignal.timeout(25000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || `HTTP ${response.status}`;
    throw new Error(detail);
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("模型没有返回可显示的内容");
  return String(content).trim();
}

module.exports = { chat, buildRequest, normalizeEndpoint, SYSTEM_PROMPT };
