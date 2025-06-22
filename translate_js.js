const axios = require("axios");
require("dotenv").config();

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { text, source_lang = "EN", target_lang = "FR" } = JSON.parse(event.body);

    // Translate with GPT-4.5 (ChatGPT)
    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a technical translator. Translate the text from " +
              source_lang +
              " to " +
              target_lang +
              ". Preserve technical formatting, structure, and terminology. Include notes explaining any complex or ambiguous translations.",
          },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    const gptTranslation = gptResponse.data.choices[0].message.content;

    // Translate with DeepSeek
    const deepseekResponse = await axios.post(
      "https://api.deepseek.com/translate",
      {
        text,
        source_lang,
        target_lang,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );
    const deepseekTranslation = deepseekResponse.data.translation;

    // Translate with DeepL
    const deeplResponse = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        text,
        source_lang,
        target_lang,
      }),
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const deeplTranslation = deeplResponse.data.translations[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({
        gpt: gptTranslation,
        deepseek: deepseekTranslation,
        deepl: deeplTranslation,
        notes: "GPT-4.5 translation was guided by technical context. DeepSeek and DeepL are included for comparison to ensure accuracy and domain consistency.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
