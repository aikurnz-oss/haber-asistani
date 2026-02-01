export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");

    const prompt = `
You are a news analyst.

Title:
${body.title}

Description:
${body.description}

Source:
${body.source}

Produce output as JSON only.
    `;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional news editor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    const json = await res.json();
    const content = json.choices[0].message.content;

    return {
      statusCode: 200,
      body: content
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
