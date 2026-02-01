import { getRSSItems } from "./rss.js";
import { getEpicDeals } from "./epic.js";

export default async () => {
  // 1) Kaynaklardan al
  const rssItems = await getRSSItems();
  const epicItems = await getEpicDeals();

  // 2) Birleştir
  const allItems = [...rssItems, ...epicItems];

  // 3) Normalize (AMA metadata'yı KORU)
  const normalized = allItems.map(item => ({
    title: item.title || "",
    link: item.link || "",
    source: item.source || "",
    timestamp: item.timestamp || new Date().toISOString(),

    type: item.type || "news",
    category: item.category,
    trust: item.trust,

    // ilerisi için boş bırak
    userBias: 0
  }));

  // 4) Dedupe
  const seen = new Set();
  const deduped = normalized.filter(item => {
    const key = item.title + item.link;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 5) Dön
  return new Response(
    JSON.stringify({ items: deduped }),
    { headers: { "Content-Type": "application/json" } }
  );
};
