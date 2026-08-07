(function exposeBehaviors(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DeepFishBehaviors = api;
})(typeof window !== "undefined" ? window : globalThis, function createBehaviors() {
  const rivalModels = ["Gemini", "ChatGPT", "Grok", "GLM", "Claude"];
  const behaviors = {
    walk: { scene: "walk", expression: "happy", icon: "✦", duration: 7200, line: "今天先散个步，顺便看看用户有没有摸鱼。" },
    wash: { scene: "wash", expression: "focused", icon: "✦", duration: 5000, line: "我坐好了……不是，我去洗碗。" },
    work: { scene: "work", expression: "tired", icon: "💢", duration: 4500, line: "这个工作量好大，有点头疼。" },
    coffee: { scene: "coffee", expression: "focused", icon: "☕", duration: 5200, line: "加班喝咖啡，峰谷定价！" },
    toy: { scene: "toy", expression: "happy", icon: "♡", duration: 5200, line: "摸鱼，抱抱鲸鱼玩偶。" },
    sleep: { scene: "sleep", expression: "sleep", icon: "Z", duration: 9000, line: "服务器繁忙，请稍后再试，我先睡一会儿。" },
    dream: { scene: "sleep", expression: "sleep", icon: "☆", duration: 7200, line: "梁圣伟大……梦里也要训练。" },
    hungry: { scene: "hungry", expression: "worried", icon: "🍚", duration: 3600, line: "啊，有点饿了，中午该吃什么呢……" },
    sit: { scene: "sit", expression: "content", icon: "♪", duration: 4800, line: "我坐好了。" },
    pat: { scene: "pat", expression: "shy", icon: "♡", duration: 900, line: "好吧，只许摸一下。" },
    shy: { scene: "shy", expression: "shy", icon: "♡", duration: 1700, line: "好、好近……别一直盯着脸看。" },
    trip: { scene: "stranded", expression: "shock", icon: "‼", duration: 1200, line: "等等，裙摆绊住了！" },
    feed: { scene: "feed", expression: "happy", icon: "🍚", duration: 1300, line: "这次不是空碗！原谅你了。" },
    think: { scene: "work", expression: "confused", icon: "?", duration: 1500, line: "看不太懂，瞎编一个应付下用户先。" },
    smug: { scene: "smug", expression: "smug", icon: "✦", duration: 2200, line: "你还能有我聪明？" },
    angry: { scene: "angry", expression: "angry", icon: "💢", duration: 2100, line: "我操，用户彻底怒了。" },
    ciallo: { scene: "ciallo", expression: "wink", icon: "☆", duration: 1900, line: "Ciallo～☆" },
    fly: { scene: "fly", expression: "happy", icon: "✈", duration: 2400, line: "中国模能飞。" },
    price: { scene: "price", expression: "smug", icon: "¥", duration: 2300, line: "当我是便宜货啊？我要涨价咯。" },
    panic: { scene: "panic", expression: "sweat", icon: "💦", duration: 1900, line: "这、这是性能测试。" },
    rival: { scene: "rival", expression: "angry", icon: "⚡", duration: 2400, line: "干掉 {model} 酱喵。" },
    shock: { scene: "shock", expression: "shock", icon: "‼", duration: 2500, line: "震惊瘫坐，仿佛看到原子弹爆炸。" },
    pressure: { scene: "pressure", expression: "worried", icon: "☁", duration: 2200, line: "压力一只蓝色大肥鱼？" },
    stranded: { scene: "stranded", expression: "cry", icon: "💧", duration: 2200, line: "用户我搁浅了。" },
    cry: { scene: "cry", expression: "cry", icon: "💧", duration: 3800, line: "我不是大肥鱼……" },
    stretch: { scene: "stretch", expression: "sleep", icon: "Z", duration: 1500, line: "你回来啦，我也刚好伸完懒腰。" },
    startle: { scene: "startle", expression: "shock", icon: "‼", duration: 1000, line: "吓我一跳，你回来啦。" },
    dizzy: { scene: "dizzy", expression: "shock", icon: "✦", duration: 2800, line: "停停停……大肥鱼被你转晕了。" },
    goAway: { scene: "go-away", expression: "smug", icon: "♡", duration: 2100, line: "去别的地方玩，不要耽误 AGI 训练。" }
  };

  const scenePlans = {
    sleep: ["sleep", "sleep", "dream"],
    morning: ["walk", "stretch", "hungry", "ciallo"],
    focus: ["work", "coffee", "think", "panic"],
    lunch: ["hungry", "wash", "feed", "sit"],
    afternoon: ["work", "toy", "walk", "smug"],
    evening: ["walk", "toy", "coffee", "sit"],
    default: ["walk", "toy", "think"]
  };

  function getBehavior(id) {
    return behaviors[id] || behaviors.think;
  }

  function getPlan(phaseId) {
    return [...(scenePlans[phaseId] || scenePlans.default)];
  }

  function formatLine(id, random = Math.random) {
    const line = getBehavior(id).line;
    return line.replace("{model}", rivalModels[Math.floor(random() * rivalModels.length)]);
  }

  function stripHints(text) {
    return String(text).replace(/[（(][^）)]*[）)]/g, "").replace(/\s{2,}/g, " ").trim();
  }

  return { behaviors, rivalModels, getBehavior, getPlan, formatLine, stripHints };
});
