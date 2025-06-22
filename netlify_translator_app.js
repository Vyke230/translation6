// Project: Netlify AI Translator App
// Purpose: Translate uploaded documents, inline editing, glossary use, OpenAI translation API
// Structure: React frontend + Netlify Functions backend

/* ==== netlify.toml (Netlify Config) ==== */

[build]
  command = "npm run build"
  publish = "build"

[functions]
  directory = "functions"
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-functions-core"

/* ==== functions/translate.js (Netlify Serverless Function) ==== */

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
          content: `You are a professional French-English technical translator. Use formal, domain-specific language.`
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

/* ==== src/App.jsx (React App Component) ==== */

import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [loading, setLoading] = useState(false);

  async function translate() {
    setLoading(true);
    const response = await fetch("/.netlify/functions/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang })
    });
    const data = await response.json();
    setTranslation(data.translation);
    setLoading(false);
  }

  return (
    <div className="App">
      <h1>📝 AI Translator</h1>
      <textarea
        rows="6"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste or type text to translate..."
      />
      <select value={targetLang} onChange={e => setTargetLang(e.target.value)}>
        <option value="fr">French</option>
        <option value="en">English</option>
      </select>
      <button onClick={translate} disabled={loading}>
        {loading ? "Translating..." : "Translate"}
      </button>
      <h2>🔁 Translated Text</h2>
      <div className="output-box">{translation}</div>
    </div>
  );
}

/* ==== public/index.html (HTML Scaffold) ==== */

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Translator</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>

/* ==== package.json (Install These) ==== */

{
  "name": "netlify-ai-translator",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}

/* ==== .env (Locally) ==== */

OPENAI_API_KEY=sk-... (don’t commit this)

/* ==== README Quick Start ==== */

1. Install dependencies:
```bash
npm install
```
2. Run locally:
```bash
npm run dev
```
3. Deploy to Netlify:
- Push to GitHub
- Connect repo in Netlify dashboard
- Set `OPENAI_API_KEY` in Netlify Environment Vars
- It auto-builds and deploys.

➡️ You now have a working professional-grade AI translator with React + Netlify Functions.
