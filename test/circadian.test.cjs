const test = require("node:test");
const assert = require("node:assert/strict");
const { getPhase, msUntilNextMinute } = require("../src/shared/circadian.js");

function atHour(hour, minute = 0) {
  return new Date(2026, 7, 6, hour, minute, 0, 0);
}

test("maps every boundary hour to the expected biological phase", () => {
  assert.equal(getPhase(atHour(0)).id, "sleep");
  assert.equal(getPhase(atHour(6)).id, "morning");
  assert.equal(getPhase(atHour(9)).id, "focus");
  assert.equal(getPhase(atHour(12)).id, "lunch");
  assert.equal(getPhase(atHour(14)).id, "afternoon");
  assert.equal(getPhase(atHour(18)).id, "evening");
  assert.equal(getPhase(atHour(23)).id, "sleep");
});

test("returns a sane delay until the next minute", () => {
  assert.equal(msUntilNextMinute(new Date(2026, 7, 6, 9, 30, 0, 0)), 60000);
  assert.equal(msUntilNextMinute(new Date(2026, 7, 6, 9, 30, 59, 500)), 500);
});
