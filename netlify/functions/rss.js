import { SOURCES, DEFAULT_CONFIG } from "../../data/sources.js";

export async function getRSSItems() {
  const items = [];

  const rssSources = SOURCES.filter(s => s.feed);

  for (const src of rssSources) {
    try {
      const res = await fetch(src.feed);
      const xml = await res.text();

      const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
        .slice(0, DEFAULT_CONFIG.maxItemsPerSource);

      for (const m of matches) {
        const block = m[1];

        const get = (tag) =>
          (block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "")
            .replace(/<!\[CDATA\[|\]\]>/g, "")
            .trim();

        // ÖNEMLİ: içerik fallback zinciri
        const description =
          get("description") ||
          get("content:encoded") ||
          get("summary") ||
          "";

console.log("RSS OK:", src.feed);

        items.push({
          title: get("title"),
          link: get("link"),
          description,              // ← AI için KRİTİK
          source: src.name,
          timestamp: get("pubDate") || new Date().toISOString(),

          // SABİT / METADATA
          type: "news",
          category: src.category,
          trust: src.trust
        });
      }
    } catch {
      // sessiz geç
    }
  }

  return items;
}
