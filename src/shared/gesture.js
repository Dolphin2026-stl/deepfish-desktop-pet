(function exposeGestures(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DeepFishGestures = api;
})(typeof window !== "undefined" ? window : globalThis, function createGestures() {
  const MAX_WINDOW_MS = 1800;
  const MIN_SEGMENT_PX = 4;
  const MIN_PATH_PX = 360;
  const MIN_SPEED_PX_PER_SECOND = 260;
  const MIN_TURN_RADIANS = Math.PI * 2.4;
  const MIN_TURN_CONSISTENCY = 0.68;

  function createSpinTracker(x, y, now = 0) {
    return {
      x,
      y,
      startedAt: now,
      path: 0,
      turn: 0,
      absoluteTurn: 0,
      lastAngle: undefined,
      dizzy: false
    };
  }

  function normalizeAngle(angle) {
    let normalized = angle;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    return normalized;
  }

  function resetTracker(tracker, x, y, now) {
    Object.assign(tracker, createSpinTracker(x, y, now));
  }

  function trackSpin(tracker, x, y, now) {
    if (tracker.dizzy) return true;
    if (now - tracker.startedAt > MAX_WINDOW_MS) resetTracker(tracker, tracker.x, tracker.y, now);

    const dx = x - tracker.x;
    const dy = y - tracker.y;
    const distance = Math.hypot(dx, dy);
    if (distance < MIN_SEGMENT_PX) return false;

    const angle = Math.atan2(dy, dx);
    if (tracker.lastAngle !== undefined) {
      const turn = normalizeAngle(angle - tracker.lastAngle);
      tracker.turn += turn;
      tracker.absoluteTurn += Math.abs(turn);
    }
    tracker.lastAngle = angle;
    tracker.path += distance;
    tracker.x = x;
    tracker.y = y;

    const elapsed = Math.max(1, now - tracker.startedAt);
    const speed = tracker.path / elapsed * 1000;
    const consistency = Math.abs(tracker.turn) / Math.max(tracker.absoluteTurn, 0.001);
    tracker.dizzy = tracker.path >= MIN_PATH_PX
      && Math.abs(tracker.turn) >= MIN_TURN_RADIANS
      && speed >= MIN_SPEED_PX_PER_SECOND
      && consistency >= MIN_TURN_CONSISTENCY;
    return tracker.dizzy;
  }

  return { createSpinTracker, normalizeAngle, trackSpin };
});
