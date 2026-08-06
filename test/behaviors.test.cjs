const test = require("node:test");
const assert = require("node:assert/strict");
const behaviors = require("../src/shared/behaviors.js");

test("day plans contain the expected simulation beats", () => {
  assert.ok(behaviors.getPlan("lunch").includes("wash"));
  assert.ok(behaviors.getPlan("focus").includes("coffee"));
  assert.ok(behaviors.getPlan("evening").includes("walk"));
  assert.ok(behaviors.getPlan("sleep").includes("sleep"));
});

test("parenthetical action notes never reach the speech bubble", () => {
  assert.equal(behaviors.stripHints("压力一只蓝色大肥鱼？（手指指向自己）"), "压力一只蓝色大肥鱼？");
  assert.equal(behaviors.stripHints("Ciallo～(∠・ω< )⌒★"), "Ciallo～⌒★");
});

test("rival line substitutes one of the supported model names", () => {
  assert.equal(behaviors.formatLine("rival", () => 0), "干掉 Gemini 酱喵。");
  assert.equal(behaviors.formatLine("rival", () => 0.99), "干掉 Claude 酱喵。");
});
