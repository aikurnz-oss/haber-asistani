export function rankItems(items) {
  const now = Date.now();

  const ranked = items.map(item => {
    let score = 0;

    // USER BEHAVIOR (asıl kişiselleştirme)
    if (item.userBias) {
      score += item.userBias * 10;
    }

    // SOURCE TRUST
    if (item.trust) {
      score += item.trust * 20;
    }

    // RECENCY
    if (item.timestamp) {
      const t = new Date(item.timestamp).getTime();
      const ageHours = (now - t) / (1000 * 60 * 60);

      if (ageHours < 1) score += 40;
      else if (ageHours < 6) score += 30;
      else if (ageHours < 24) score += 15;
      else score += 5;
    }

    // TYPE BONUS
    if (item.type === "free-games") score += 25;
    if (item.type === "big-deals") score += 15;
    if (item.type === "news") score += 20;

    return {
      ...item,
      score: Math.round(score)
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked;
}
