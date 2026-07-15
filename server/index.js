require("dotenv").config();
const express = require("express");
const path = require("path");
const { DEFAULT_MODEL, ALLOWED_MODELS, ALLOWED_MODEL_IDS } = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Frontend reads this to populate the RULES tab model picker — no key involved.
app.get("/api/models", (req, res) => {
  res.json({ models: ALLOWED_MODELS, defaultModel: DEFAULT_MODEL });
});

app.post("/api/feed", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set on the server.",
    });
  }

  const { worldId, worldName, goal, model } = req.body || {};
  if (!worldName || !goal) {
    return res.status(400).json({ error: "worldName and goal are required." });
  }

  const chosenModel = ALLOWED_MODEL_IDS.includes(model) ? model : DEFAULT_MODEL;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: 512,
        system: `You are a personal development coach. Generate 3-5 concise, actionable ideas for progression in "${worldName}". Goal: ${goal}. Return ONLY ideas (one per line, no numbering or bullets). Keep each under 10 words.`,
        messages: [
          {
            role: "user",
            content: `Give me fresh ideas for progressing in ${worldName} today.`,
          },
        ],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = (data && data.error && data.error.message) || "Anthropic API error";
      return res.status(response.status).json({ error: message });
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const ideas = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^\d+[\.\)]/))
      .slice(0, 5);

    res.json({ ideas, model: chosenModel });
  } catch (err) {
    res.status(502).json({ error: "Failed to reach Anthropic API." });
  }
});

app.post("/api/chat", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set on the server. Add it to .env and restart.",
    });
  }

  const { system, messages, model } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required." });
  }

  const chosenModel = ALLOWED_MODEL_IDS.includes(model) ? model : DEFAULT_MODEL;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: 2048,
        system,
        messages,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = (data && data.error && data.error.message) || "Anthropic API error";
      return res.status(response.status).json({ error: message });
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    res.json({ text, model: chosenModel });
  } catch (err) {
    res.status(502).json({ error: "Failed to reach Anthropic API." });
  }
});

app.listen(PORT, () => {
  console.log(`Joeputer running at http://localhost:${PORT}`);
});
