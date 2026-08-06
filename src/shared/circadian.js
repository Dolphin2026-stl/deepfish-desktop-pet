(function exposeCircadian(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DeepFishClock = api;
})(typeof window !== "undefined" ? window : globalThis, function createCircadian() {
  const phases = [
    { start: 0, end: 6, id: "sleep", label: "呼呼大睡", energy: 0.16, line: "Zzz... 模型也要休息。" },
    { start: 6, end: 9, id: "morning", label: "刚刚醒来", energy: 0.58, line: "早上好，先伸个懒腰。" },
    { start: 9, end: 12, id: "focus", label: "专注营业", energy: 0.92, line: "今天也要认真回答问题。" },
    { start: 12, end: 14, id: "lunch", label: "寻找白饭", energy: 0.64, line: "蓝色大肥鱼也要吃午饭。" },
    { start: 14, end: 18, id: "afternoon", label: "下午摸鱼", energy: 0.76, line: "让我先假装思考三秒。" },
    { start: 18, end: 23, id: "evening", label: "陪你加班", energy: 0.72, line: "夜色很好，适合聊点什么。" },
    { start: 23, end: 24, id: "sleep", label: "开始犯困", energy: 0.22, line: "很晚啦，答案明天也不会跑。" }
  ];

  function getPhase(input) {
    const date = input instanceof Date ? input : new Date(input || Date.now());
    const hour = date.getHours();
    return phases.find((phase) => hour >= phase.start && hour < phase.end) || phases[0];
  }

  function msUntilNextMinute(input) {
    const date = input instanceof Date ? input : new Date(input || Date.now());
    return 60000 - (date.getSeconds() * 1000 + date.getMilliseconds());
  }

  return { phases, getPhase, msUntilNextMinute };
});
