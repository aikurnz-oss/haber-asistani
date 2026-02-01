import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function summarizeItem(item) {
  const title = item.title || "";
  const content =
    item.description ||
    item.summary ||
    title;

  const source = item.source || "";

  const prompt = `
Aşağıdaki haber için TÜRKÇE bir başlık ve kısa bir özet üret.

Kurallar:
- Başlık 1 cümle, net
- Özet 1–2 cümle
- Yorumsuz, bilgi odaklı
- Tarih, sayı, fiyat varsa yaz
- Çıktıyı SADECE JSON olarak ver

JSON formatı:
{
  "title": "...",
  "summary": "..."
}

Haber:
Başlık: ${title}
Açıklama: ${content}
Kaynak: ${source}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const text = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(text);

    return {
      title: parsed.title || title,
      summary: parsed.summary || ""
    };

  } catch {
    // Fallback (ASLA undefined dönmez)
    return {
      title,
      summary: ""
    };
  }
}
