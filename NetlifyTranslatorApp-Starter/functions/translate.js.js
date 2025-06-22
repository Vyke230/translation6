import fetch from "node-fetch";

export async function handler(event) {
  const { text, targetLang } = JSON.parse(event.body);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional French-English technical translator.`
        },
        {
          role: "user",
          content: `Translate this to ${targetLang}:

${text}`
        }
      ]
    })
  });

  const data = await response.json();
  const translation = data.choices?.[0]?.message?.content || "Translation failed";

  return {
    statusCode: 200,
    body: JSON.stringify({ translation })
  };
}