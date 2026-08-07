const test = require("node:test");
const assert = require("node:assert/strict");
const gestures = require("../src/shared/gesture.js");

test("fast circular dragging triggers dizziness", () => {
  const radius = 72;
  const tracker = gestures.createSpinTracker(radius, 0, 0);
  let triggered = false;
  for (let step = 1; step <= 40; step += 1) {
    const angle = step / 40 * Math.PI * 2.6;
    triggered = gestures.trackSpin(
      tracker,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      step * 25
    );
  }
  assert.equal(triggered, true);
});

test("fast straight dragging does not trigger dizziness", () => {
  const tracker = gestures.createSpinTracker(0, 0, 0);
  for (let step = 1; step <= 30; step += 1) {
    gestures.trackSpin(tracker, step * 24, 0, step * 20);
  }
  assert.equal(tracker.dizzy, false);
});

test("alternating jitter does not count as a consistent circle", () => {
  const tracker = gestures.createSpinTracker(0, 0, 0);
  for (let step = 1; step <= 40; step += 1) {
    gestures.trackSpin(tracker, step % 2 ? 80 : -80, step * 3, step * 20);
  }
  assert.equal(tracker.dizzy, false);
});
