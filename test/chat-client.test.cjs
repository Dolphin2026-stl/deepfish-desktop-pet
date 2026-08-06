const test = require("node:test");
const assert = require("node:assert/strict");
const { buildRequest, normalizeEndpoint } = require("../src/main/chat-client.cjs");

test("normalizes a trailing endpoint slash", () => {
  assert.equal(normalizeEndpoint("https://api.example.com/v1/"), "https://api.example.com/v1");
});

test("builds an OpenAI-compatible request without exposing a missing key", () => {
  const request = buildRequest(
    { endpoint: "https://text.pollinations.ai/openai", model: "openai-fast" },
    "",
    [{ role: "user", content: "你好" }]
  );
  assert.equal(request.body.model, "openai-fast");
  assert.equal(request.headers.authorization, undefined);
  assert.equal(request.body.messages.at(-1).content, "你好");
});

test("rejects an insecure custom endpoint", () => {
  assert.throws(
    () => buildRequest({ endpoint: "http://example.com", model: "x" }, "key", []),
    /HTTPS/
  );
});
