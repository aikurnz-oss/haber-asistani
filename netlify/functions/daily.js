import aggregate from "./aggregate.js";
import { rankItems } from "./rank.js";
import { summarizeItem } from "./ai-summary.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler() {
  try {
    const res = await aggregate();
    let { items } = await res.json();

    // 1) Sert öncelik (KİLİTLİ)
    const freeGames = items.filter(i => i.type === "free-games");
    const bigDeals = items.filter(i => i.type === "big-deals");
    const news = items.filter(i => i.type === "news");

    // 2) Haberleri kendi içinde rankla
    const rankedNews = rankItems(news);

    // 3) Birleştir (öncelik bozulmaz)
    items = [
      ...freeGames,
      ...bigDeals,
      ...rankedNews
    ];

    // 4) Limit
    items = items.slice(0, 20);

    // 5) AI özet – SADECE HABERLERDEN İLK 10
    let aiUsed = 0;
    for (const item of items) {
      if (aiUsed >= 10) break;
      if (item.type !== "news") continue;

      try {
        const ai = await summarizeItem(item);
        item.title = ai.title;
        item.summary = ai.summary;
        aiUsed++;
      } catch {}
    }

    // 6) BUGÜN NE OLDU? (TEK AI ÇAĞRISI)
    let dailySummary = null;

    try {
      const topNews = items
        .filter(i => i.type === "news")
        .slice(0, 5)
        .map(i => `- ${i.title}`)
        .join("\n");

      const prompt = `
Aşağıdaki başlıklara bakarak BUGÜN NE OLDU? başlıklı,
2–3 cümlelik TÜRKÇE, yorumsuz bir özet yaz.

Başlıklar:
${topNews}
`;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      dailySummary = completion.choices[0].message.content.trim();
    } catch {
      dailySummary = null;
    }

    return new Response(
      JSON.stringify({
        meta: {
          generated: new Date().toISOString(),
          aiUsed
        },
        dailySummary,
        items
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "daily crash", detail: err.message }),
      { status: 500 }
    );
  }
}
