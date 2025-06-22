import React, { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [targetLang, setTargetLang] = useState("fr");

  const handleTranslate = async () => {
    const response = await fetch("/.netlify/functions/translate", {
      method: "POST",
      body: JSON.stringify({ text, targetLang }),
    });
    const data = await response.json();
    setTranslation(data.translation);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Translator</h1>
      <textarea
        rows={6}
        style={{ width: "100%" }}
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
        <option value="fr">French</option>
        <option value="en">English</option>
      </select>
      <button onClick={handleTranslate}>Translate</button>
      <h2>Translation</h2>
      <p>{translation}</p>
    </div>
  );
}

export default App;