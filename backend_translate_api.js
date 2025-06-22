const axios = require("axios");
require("dotenv").config();

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const formData = JSON.parse(event.body);
    const originalText = formData.text;

    // 1. Use GPT-4.5 (OpenAI API)
    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional technical translator. Translate this text into the target language while preserving technical integrity, layout, and style. Justify difficult translations."
          },
          {
            role: "user",
            content: originalText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const gptTranslation = gptResponse.data.choices[0].message.content;

    // 2. Use DeepSeek
    const deepseekRes = await axios.post(
      "https://api.deepseek.com/translate",
      { text: originalText },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );
    const deepseekTranslation = deepseekRes.data.translation;

    // 3. Use DeepL
    const deeplRes = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({
        text: originalText,
        target_lang: "FR"
      }),
      {
        headers: {
          Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
        }
      }
    );
    const deeplTranslation = deeplRes.data.translations[0].text;

    // Return comparison and notes
    return {
      statusCode: 200,
      body: JSON.stringify({
        translation: gptTranslation,
        deepseek: deepseekTranslation,
        deepl: deeplTranslation,
        justification: "Translation choices were guided by context-specific domain terminology and formatting requirements. GPT-4.5 output is prioritized, DeepSeek and DeepL are shown for contrast and verification."
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
